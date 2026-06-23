import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  DepannageRequestEntity,
  DepannageStatus,
  DepannageMode,
  ArtisanProposal,
  DiagnosisReport,
} from './entities/depannage-request.entity';
import { ArtisanSpecialty } from '../artisans/entities/artisan.entity';
import { EscrowStatus } from '../orders/entities/order.entity';

const URGENCY_FEE_RATE = 0.15;

@Injectable()
export class DepannageService {
  private readonly logger = new Logger(DepannageService.name);

  constructor(
    @InjectRepository(DepannageRequestEntity)
    private readonly repo: Repository<DepannageRequestEntity>,
    private readonly dataSource: DataSource,
  ) {}

  // Étape 1 — Créer la demande + lancer diagnostic IA en arrière-plan
  async create(
    clientId: string,
    dto: {
      description: string;
      photoUrls?: string[];
      address: string;
      city: string;
      latitude?: number;
      longitude?: number;
    },
  ): Promise<DepannageRequestEntity> {
    const request = this.repo.create({
      clientId,
      description: dto.description,
      photoUrls: dto.photoUrls ?? [],
      address: dto.address,
      city: dto.city,
      latitude: dto.latitude,
      longitude: dto.longitude,
      status: DepannageStatus.DIAGNOSIS_PENDING,
      proposals: [],
    });
    const saved = await this.repo.save(request);
    this.runAiDiagnosis(saved.id, dto.description).catch(e =>
      this.logger.error(`Diagnosis failed for ${saved.id}`, e),
    );
    return saved;
  }

  private async runAiDiagnosis(requestId: string, description: string): Promise<void> {
    // TODO: appel réel Claude API avec description + photos
    const report: DiagnosisReport = {
      summary: `Diagnostic automatique : "${description.slice(0, 80)}"`,
      estimatedPriceMinXof: 15_000,
      estimatedPriceMaxXof: 50_000,
      recommendedCategory: ArtisanSpecialty.PLOMBERIE,
      generatedAt: new Date().toISOString(),
    };
    await this.repo.update(requestId, {
      diagnosisReport: report,
      status: DepannageStatus.DIAGNOSIS_DONE,
    });
  }

  // Étape 1 — Client confirme le devis et ouvre l'appel d'offre
  async confirmQuote(
    requestId: string,
    clientId: string,
    category?: ArtisanSpecialty,
  ): Promise<DepannageRequestEntity> {
    const req = await this.findAndCheck(requestId, clientId);
    if (req.status !== DepannageStatus.DIAGNOSIS_DONE) {
      throw new BadRequestException('Diagnostic non terminé');
    }
    if (category) req.category = category;
    req.status = DepannageStatus.QUOTE_CONFIRMED;
    await this.repo.save(req);
    await this.repo.update(requestId, { status: DepannageStatus.TENDER_OPEN });
    return this.repo.findOne({ where: { id: requestId } }) as Promise<DepannageRequestEntity>;
  }

  // Étape 3 — Artisan soumet une proposition
  async submitProposal(
    requestId: string,
    artisanId: string,
    artisanName: string,
    priceXof: number,
    estimatedDurationMin: number,
  ): Promise<DepannageRequestEntity> {
    const req = await this.repo.findOne({ where: { id: requestId } });
    if (!req) throw new NotFoundException();
    if (req.status !== DepannageStatus.TENDER_OPEN) {
      throw new BadRequestException('Appel d\'offre non ouvert');
    }
    const proposal: ArtisanProposal = {
      artisanId,
      artisanName,
      priceXof,
      estimatedDurationMin,
      submittedAt: new Date().toISOString(),
    };
    req.proposals = [...(req.proposals ?? []), proposal];
    req.status = DepannageStatus.PROPOSALS_RECEIVED;
    return this.repo.save(req);
  }

  // Étape 4 — Sélection artisan → chat ouvert
  async selectArtisan(
    requestId: string,
    clientId: string,
    artisanId: string,
  ): Promise<DepannageRequestEntity> {
    const req = await this.findAndCheck(requestId, clientId);
    if (req.status !== DepannageStatus.PROPOSALS_RECEIVED) {
      throw new BadRequestException('Aucune proposition disponible');
    }
    const proposal = req.proposals.find(p => p.artisanId === artisanId);
    if (!proposal) throw new BadRequestException('Artisan introuvable dans les propositions');
    req.artisanId = artisanId;
    req.agreedPriceXof = proposal.priceXof;
    req.status = DepannageStatus.CHAT_OPEN;
    return this.repo.save(req);
  }

  // Étape 5 — Mode d'intervention (urgent / planifié)
  async chooseMode(
    requestId: string,
    clientId: string,
    mode: DepannageMode,
    scheduledAt?: Date,
  ): Promise<DepannageRequestEntity> {
    const req = await this.findAndCheck(requestId, clientId);
    if (req.status !== DepannageStatus.CHAT_OPEN) {
      throw new BadRequestException('Chat non ouvert');
    }
    req.mode = mode;
    if (mode === DepannageMode.URGENT) {
      req.urgencyFeeXof = Math.round(Number(req.agreedPriceXof) * URGENCY_FEE_RATE);
      req.status = DepannageStatus.URGENT_PENDING;
    } else {
      if (!scheduledAt) throw new BadRequestException('Date/heure requise pour le mode planifié');
      req.scheduledAt = scheduledAt;
      req.urgencyFeeXof = 0;
      req.status = DepannageStatus.SCHEDULED_CONFIRMED;
    }
    return this.repo.save(req);
  }

  // Étape 5 — Artisan confirme son intervention urgente
  async artisanConfirmUrgent(requestId: string, artisanId: string): Promise<DepannageRequestEntity> {
    const req = await this.repo.findOne({ where: { id: requestId, artisanId } });
    if (!req) throw new NotFoundException();
    if (req.status !== DepannageStatus.URGENT_PENDING) {
      throw new BadRequestException('Statut incorrect pour cette opération');
    }
    req.status = DepannageStatus.URGENT_CONFIRMED;
    return this.repo.save(req);
  }

  // Étape 6a — Accord de prix → calcule le montant escrow total
  async reachAgreement(requestId: string, clientId: string): Promise<DepannageRequestEntity> {
    const req = await this.findAndCheck(requestId, clientId);
    const validStatuses = [DepannageStatus.URGENT_CONFIRMED, DepannageStatus.SCHEDULED_CONFIRMED];
    if (!validStatuses.includes(req.status)) {
      throw new BadRequestException('Accord non disponible dans ce statut');
    }
    req.escrowAmountXof = Number(req.agreedPriceXof) + Number(req.urgencyFeeXof);
    req.status = DepannageStatus.AGREEMENT_REACHED;
    return this.repo.save(req);
  }

  // Étape 6b/6c — Client recharge son compte ; webhook CinetPay appelle cette méthode
  async fundEscrow(
    requestId: string,
    clientId: string,
    transactionRef: string,
  ): Promise<DepannageRequestEntity> {
    return this.dataSource.transaction(async manager => {
      const req = await manager.findOne(DepannageRequestEntity, {
        where: { id: requestId, clientId },
      });
      if (!req) throw new NotFoundException('Demande introuvable');
      const validStatuses = [
        DepannageStatus.AGREEMENT_REACHED,
        DepannageStatus.PAYMENT_PENDING,
        DepannageStatus.ACCOUNT_TOPPED_UP,
      ];
      if (!validStatuses.includes(req.status)) {
        throw new BadRequestException('Financement impossible dans ce statut');
      }
      this.logger.log(`Escrow funded for ${requestId} — ref: ${transactionRef}`);
      req.escrowStatus = EscrowStatus.FUNDED;
      req.status = DepannageStatus.FUNDS_HELD;
      return manager.save(req);
    });
  }

  // Étape 6c — Verrouiller l'intervention après confirmation des fonds
  async lockIntervention(
    requestId: string,
    requiredPartIds?: string[],
  ): Promise<DepannageRequestEntity> {
    const req = await this.repo.findOne({ where: { id: requestId } });
    if (!req) throw new NotFoundException();
    if (req.status !== DepannageStatus.FUNDS_HELD) {
      throw new BadRequestException('Les fonds doivent être bloqués avant de verrouiller');
    }
    if (requiredPartIds?.length) {
      req.requiredPartIds = requiredPartIds;
      req.status = DepannageStatus.PARTS_REQUESTED;
    } else {
      req.status = DepannageStatus.INTERVENTION_LOCKED;
    }
    return this.repo.save(req);
  }

  // Étape 7 — Marquer les pièces comme expédiées → déverrouille l'intervention
  async dispatchParts(requestId: string): Promise<DepannageRequestEntity> {
    const req = await this.repo.findOne({ where: { id: requestId } });
    if (!req) throw new NotFoundException();
    if (req.status !== DepannageStatus.PARTS_REQUESTED) {
      throw new BadRequestException('Aucune pièce en attente d\'expédition');
    }
    req.status = DepannageStatus.PARTS_DISPATCHED;
    return this.repo.save(req);
  }

  // Étape 6 — Artisan marque l'intervention comme terminée
  async completeIntervention(requestId: string, artisanId: string): Promise<DepannageRequestEntity> {
    const req = await this.repo.findOne({ where: { id: requestId, artisanId } });
    if (!req) throw new NotFoundException();
    const validStatuses = [
      DepannageStatus.INTERVENTION_LOCKED,
      DepannageStatus.PARTS_DISPATCHED,
    ];
    if (!validStatuses.includes(req.status)) {
      throw new BadRequestException('Intervention non encore verrouillée');
    }
    req.status = DepannageStatus.INTERVENTION_COMPLETED;
    return this.repo.save(req);
  }

  // Étape 6d — Client valide et libère le paiement vers l'artisan
  async releasePayment(requestId: string, clientId: string): Promise<DepannageRequestEntity> {
    const req = await this.findAndCheck(requestId, clientId);
    if (req.status !== DepannageStatus.INTERVENTION_COMPLETED) {
      throw new BadRequestException('Intervention non encore terminée');
    }
    req.escrowStatus = EscrowStatus.RELEASED;
    req.status = DepannageStatus.PAYMENT_RELEASED;
    // TODO: déclencher virement CinetPay
    // - artisan reçoit agreedPriceXof (net commission 5%)
    // - fixAI retient urgencyFeeXof + commission 5%
    this.logger.log(
      `Payment released for ${requestId}: artisan=${req.agreedPriceXof} XOF, urgency=${req.urgencyFeeXof} XOF`,
    );
    return this.repo.save(req);
  }

  // ─── Lecture ────────────────────────────────────────────────────────────────

  async findByClient(clientId: string): Promise<DepannageRequestEntity[]> {
    return this.repo.find({ where: { clientId }, order: { createdAt: 'DESC' } });
  }

  async findByArtisan(artisanId: string): Promise<DepannageRequestEntity[]> {
    return this.repo.find({ where: { artisanId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<DepannageRequestEntity> {
    const req = await this.repo.findOne({ where: { id }, relations: ['client', 'artisan'] });
    if (!req) throw new NotFoundException('Demande introuvable');
    return req;
  }

  // Recherche géographique d'artisans disponibles
  async findNearbyArtisans(
    category: ArtisanSpecialty,
    lat: number,
    lng: number,
    radiusKm = 20,
  ) {
    return this.dataSource.query(
      `SELECT a.*, (6371 * acos(
        cos(radians($1)) * cos(radians(a.latitude)) *
        cos(radians(a.longitude) - radians($2)) +
        sin(radians($1)) * sin(radians(a.latitude))
      )) AS distance_km
      FROM artisans a
      WHERE a.specialty = $3 AND a.is_available = true AND a.is_verified = true
      HAVING distance_km <= $4
      ORDER BY distance_km ASC LIMIT 20`,
      [lat, lng, category, radiusKm],
    );
  }

  async cancel(requestId: string, clientId: string): Promise<DepannageRequestEntity> {
    const req = await this.findAndCheck(requestId, clientId);
    const blocked = [
      DepannageStatus.FUNDS_HELD,
      DepannageStatus.INTERVENTION_LOCKED,
      DepannageStatus.PARTS_REQUESTED,
      DepannageStatus.PARTS_DISPATCHED,
      DepannageStatus.INTERVENTION_COMPLETED,
      DepannageStatus.PAYMENT_RELEASED,
    ];
    if (blocked.includes(req.status)) {
      throw new BadRequestException('Annulation impossible à ce stade');
    }
    req.status = DepannageStatus.CANCELLED;
    return this.repo.save(req);
  }

  private async findAndCheck(requestId: string, clientId: string): Promise<DepannageRequestEntity> {
    const req = await this.repo.findOne({ where: { id: requestId, clientId } });
    if (!req) throw new NotFoundException('Demande introuvable');
    return req;
  }
}
