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

  // Étape 1 — Créer la demande + lancer diagnostic IA
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

  async confirmQuote(requestId: string, clientId: string, category: ArtisanSpecialty): Promise<DepannageRequestEntity> {
    const req = await this.findAndCheck(requestId, clientId);
    if (req.status !== DepannageStatus.DIAGNOSIS_DONE) {
      throw new BadRequestException('Diagnostic non terminé');
    }
    req.category = category;
    req.status = DepannageStatus.QUOTE_CONFIRMED;
    await this.repo.save(req);
    await this.repo.update(requestId, { status: DepannageStatus.TENDER_OPEN });
    return this.repo.findOne({ where: { id: requestId } }) as Promise<DepannageRequestEntity>;
  }

  // Étape 3 — Proposition artisan
  async submitProposal(
    requestId: string,
    artisanId: string,
    dto: { priceXof: number; estimatedDurationMin: number; artisanName: string },
  ): Promise<DepannageRequestEntity> {
    const req = await this.repo.findOne({ where: { id: requestId } });
    if (!req) throw new NotFoundException();
    if (req.status !== DepannageStatus.TENDER_OPEN) throw new BadRequestException('Appel d\'offre non ouvert');
    const proposal: ArtisanProposal = {
      artisanId, artisanName: dto.artisanName,
      priceXof: dto.priceXof, estimatedDurationMin: dto.estimatedDurationMin,
      submittedAt: new Date().toISOString(),
    };
    req.proposals = [...(req.proposals ?? []), proposal];
    req.status = DepannageStatus.PROPOSALS_RECEIVED;
    return this.repo.save(req);
  }

  // Étape 4 — Sélection artisan → chat ouvert
  async selectArtisan(requestId: string, clientId: string, artisanId: string): Promise<DepannageRequestEntity> {
    const req = await this.findAndCheck(requestId, clientId);
    if (req.status !== DepannageStatus.PROPOSALS_RECEIVED) throw new BadRequestException('Aucune proposition');
    const proposal = req.proposals.find(p => p.artisanId === artisanId);
    if (!proposal) throw new BadRequestException('Artisan introuvable dans les propositions');
    req.artisanId = artisanId;
    req.agreedPriceXof = proposal.priceXof;
    req.status = DepannageStatus.CHAT_OPEN;
    return this.repo.save(req);
  }

  // Étape 5 — Mode (urgent / planifié)
  async chooseMode(
    requestId: string, clientId: string, mode: DepannageMode, scheduledAt?: string,
  ): Promise<DepannageRequestEntity> {
    const req = await this.findAndCheck(requestId, clientId);
    if (req.status !== DepannageStatus.CHAT_OPEN) throw new BadRequestException('Chat non ouvert');
    req.mode = mode;
    if (mode === DepannageMode.URGENT) {
      req.urgencyFeeXof = Math.round(Number(req.agreedPriceXof) * URGENCY_FEE_RATE);
      req.status = DepannageStatus.URGENT_PENDING;
    } else {
      if (!scheduledAt) throw new BadRequestException('Date/heure requise');
      req.scheduledAt = new Date(scheduledAt);
      req.urgencyFeeXof = 0;
      req.status = DepannageStatus.SCHEDULED_CONFIRMED;
    }
    return this.repo.save(req);
  }

  async artisanConfirmUrgent(requestId: string, artisanId: string): Promise<DepannageRequestEntity> {
    const req = await this.repo.findOne({ where: { id: requestId, artisanId } });
    if (!req) throw new NotFoundException();
    if (req.status !== DepannageStatus.URGENT_PENDING) throw new BadRequestException('Statut incorrect');
    req.status = DepannageStatus.URGENT_CONFIRMED;
    return this.repo.save(req);
  }

  // Étape 6 — Escrow
  async reachAgreement(requestId: string, clientId: string): Promise<DepannageRequestEntity> {
    const req = await this.findAndCheck(requestId, clientId);
    const ok = [DepannageStatus.URGENT_CONFIRMED, DepannageStatus.SCHEDULED_CONFIRMED];
    if (!ok.includes(req.status)) throw new BadRequestException('Accord non disponible');
    req.escrowAmountXof = Number(req.agreedPriceXof) + Number(req.urgencyFeeXof);
    req.status = DepannageStatus.AGREEMENT_REACHED;
    return this.repo.save(req);
  }

  async fundEscrow(requestId: string): Promise<DepannageRequestEntity> {
    return this.dataSource.transaction(async manager => {
      const req = await manager.findOne(DepannageRequestEntity, { where: { id: requestId } });
      if (!req) throw new NotFoundException();
      req.escrowStatus = EscrowStatus.FUNDED;
      req.status = DepannageStatus.FUNDS_HELD;
      return manager.save(req);
    });
  }

  async lockIntervention(requestId: string): Promise<DepannageRequestEntity> {
    const req = await this.repo.findOne({ where: { id: requestId } });
    if (!req) throw new NotFoundException();
    if (req.status !== DepannageStatus.FUNDS_HELD) throw new BadRequestException('Fonds non bloqués');
    req.status = DepannageStatus.INTERVENTION_LOCKED;
    if (req.requiredPartIds?.length) {
      req.status = DepannageStatus.PARTS_REQUESTED;
    }
    return this.repo.save(req);
  }

  async completeIntervention(requestId: string, artisanId: string): Promise<DepannageRequestEntity> {
    const req = await this.repo.findOne({ where: { id: requestId, artisanId } });
    if (!req) throw new NotFoundException();
    req.status = DepannageStatus.INTERVENTION_COMPLETED;
    return this.repo.save(req);
  }

  async releasePayment(requestId: string, clientId: string): Promise<DepannageRequestEntity> {
    const req = await this.findAndCheck(requestId, clientId);
    if (req.status !== DepannageStatus.INTERVENTION_COMPLETED) {
      throw new BadRequestException('Intervention non terminée');
    }
    req.escrowStatus = EscrowStatus.RELEASED;
    req.status = DepannageStatus.PAYMENT_RELEASED;
    // TODO: virement CinetPay — artisan reçoit agreedPriceXof, fixAI reçoit urgencyFeeXof
    return this.repo.save(req);
  }

  async dispatchParts(requestId: string): Promise<DepannageRequestEntity> {
    const req = await this.repo.findOne({ where: { id: requestId } });
    if (!req) throw new NotFoundException();
    req.status = DepannageStatus.PARTS_DISPATCHED;
    return this.repo.save(req);
  }

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

  async findNearbyArtisans(lat: number, lng: number, category: ArtisanSpecialty, radiusKm = 10) {
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
      DepannageStatus.FUNDS_HELD, DepannageStatus.INTERVENTION_LOCKED,
      DepannageStatus.INTERVENTION_COMPLETED, DepannageStatus.PAYMENT_RELEASED,
    ];
    if (blocked.includes(req.status)) throw new BadRequestException('Annulation impossible');
    req.status = DepannageStatus.CANCELLED;
    return this.repo.save(req);
  }

  private async findAndCheck(requestId: string, clientId: string): Promise<DepannageRequestEntity> {
    const req = await this.repo.findOne({ where: { id: requestId, clientId } });
    if (!req) throw new NotFoundException('Demande introuvable');
    return req;
  }
}
