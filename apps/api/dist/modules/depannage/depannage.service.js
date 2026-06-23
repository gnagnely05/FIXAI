"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DepannageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepannageService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const depannage_request_entity_1 = require("./entities/depannage-request.entity");
const artisan_entity_1 = require("../artisans/entities/artisan.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const URGENCY_FEE_RATE = 0.15;
let DepannageService = DepannageService_1 = class DepannageService {
    constructor(repo, dataSource) {
        this.repo = repo;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(DepannageService_1.name);
    }
    // Étape 1 — Créer la demande + lancer diagnostic IA en arrière-plan
    async create(clientId, dto) {
        const request = this.repo.create({
            clientId,
            description: dto.description,
            photoUrls: dto.photoUrls ?? [],
            address: dto.address,
            city: dto.city,
            latitude: dto.latitude,
            longitude: dto.longitude,
            status: depannage_request_entity_1.DepannageStatus.DIAGNOSIS_PENDING,
            proposals: [],
        });
        const saved = await this.repo.save(request);
        this.runAiDiagnosis(saved.id, dto.description).catch(e => this.logger.error(`Diagnosis failed for ${saved.id}`, e));
        return saved;
    }
    async runAiDiagnosis(requestId, description) {
        // TODO: appel réel Claude API avec description + photos
        const report = {
            summary: `Diagnostic automatique : "${description.slice(0, 80)}"`,
            estimatedPriceMinXof: 15_000,
            estimatedPriceMaxXof: 50_000,
            recommendedCategory: artisan_entity_1.ArtisanSpecialty.PLOMBERIE,
            generatedAt: new Date().toISOString(),
        };
        await this.repo.update(requestId, {
            diagnosisReport: report,
            status: depannage_request_entity_1.DepannageStatus.DIAGNOSIS_DONE,
        });
    }
    // Étape 1 — Client confirme le devis et ouvre l'appel d'offre
    async confirmQuote(requestId, clientId, category) {
        const req = await this.findAndCheck(requestId, clientId);
        if (req.status !== depannage_request_entity_1.DepannageStatus.DIAGNOSIS_DONE) {
            throw new common_1.BadRequestException('Diagnostic non terminé');
        }
        if (category)
            req.category = category;
        req.status = depannage_request_entity_1.DepannageStatus.QUOTE_CONFIRMED;
        await this.repo.save(req);
        await this.repo.update(requestId, { status: depannage_request_entity_1.DepannageStatus.TENDER_OPEN });
        return this.repo.findOne({ where: { id: requestId } });
    }
    // Étape 3 — Artisan soumet une proposition
    async submitProposal(requestId, artisanId, artisanName, priceXof, estimatedDurationMin) {
        const req = await this.repo.findOne({ where: { id: requestId } });
        if (!req)
            throw new common_1.NotFoundException();
        if (req.status !== depannage_request_entity_1.DepannageStatus.TENDER_OPEN) {
            throw new common_1.BadRequestException('Appel d\'offre non ouvert');
        }
        const proposal = {
            artisanId,
            artisanName,
            priceXof,
            estimatedDurationMin,
            submittedAt: new Date().toISOString(),
        };
        req.proposals = [...(req.proposals ?? []), proposal];
        req.status = depannage_request_entity_1.DepannageStatus.PROPOSALS_RECEIVED;
        return this.repo.save(req);
    }
    // Étape 4 — Sélection artisan → chat ouvert
    async selectArtisan(requestId, clientId, artisanId) {
        const req = await this.findAndCheck(requestId, clientId);
        if (req.status !== depannage_request_entity_1.DepannageStatus.PROPOSALS_RECEIVED) {
            throw new common_1.BadRequestException('Aucune proposition disponible');
        }
        const proposal = req.proposals.find(p => p.artisanId === artisanId);
        if (!proposal)
            throw new common_1.BadRequestException('Artisan introuvable dans les propositions');
        req.artisanId = artisanId;
        req.agreedPriceXof = proposal.priceXof;
        req.status = depannage_request_entity_1.DepannageStatus.CHAT_OPEN;
        return this.repo.save(req);
    }
    // Étape 5 — Mode d'intervention (urgent / planifié)
    async chooseMode(requestId, clientId, mode, scheduledAt) {
        const req = await this.findAndCheck(requestId, clientId);
        if (req.status !== depannage_request_entity_1.DepannageStatus.CHAT_OPEN) {
            throw new common_1.BadRequestException('Chat non ouvert');
        }
        req.mode = mode;
        if (mode === depannage_request_entity_1.DepannageMode.URGENT) {
            req.urgencyFeeXof = Math.round(Number(req.agreedPriceXof) * URGENCY_FEE_RATE);
            req.status = depannage_request_entity_1.DepannageStatus.URGENT_PENDING;
        }
        else {
            if (!scheduledAt)
                throw new common_1.BadRequestException('Date/heure requise pour le mode planifié');
            req.scheduledAt = scheduledAt;
            req.urgencyFeeXof = 0;
            req.status = depannage_request_entity_1.DepannageStatus.SCHEDULED_CONFIRMED;
        }
        return this.repo.save(req);
    }
    // Étape 5 — Artisan confirme son intervention urgente
    async artisanConfirmUrgent(requestId, artisanId) {
        const req = await this.repo.findOne({ where: { id: requestId, artisanId } });
        if (!req)
            throw new common_1.NotFoundException();
        if (req.status !== depannage_request_entity_1.DepannageStatus.URGENT_PENDING) {
            throw new common_1.BadRequestException('Statut incorrect pour cette opération');
        }
        req.status = depannage_request_entity_1.DepannageStatus.URGENT_CONFIRMED;
        return this.repo.save(req);
    }
    // Étape 6a — Accord de prix → calcule le montant escrow total
    async reachAgreement(requestId, clientId) {
        const req = await this.findAndCheck(requestId, clientId);
        const validStatuses = [depannage_request_entity_1.DepannageStatus.URGENT_CONFIRMED, depannage_request_entity_1.DepannageStatus.SCHEDULED_CONFIRMED];
        if (!validStatuses.includes(req.status)) {
            throw new common_1.BadRequestException('Accord non disponible dans ce statut');
        }
        req.escrowAmountXof = Number(req.agreedPriceXof) + Number(req.urgencyFeeXof);
        req.status = depannage_request_entity_1.DepannageStatus.AGREEMENT_REACHED;
        return this.repo.save(req);
    }
    // Étape 6b/6c — Client recharge son compte ; webhook CinetPay appelle cette méthode
    async fundEscrow(requestId, clientId, transactionRef) {
        return this.dataSource.transaction(async (manager) => {
            const req = await manager.findOne(depannage_request_entity_1.DepannageRequestEntity, {
                where: { id: requestId, clientId },
            });
            if (!req)
                throw new common_1.NotFoundException('Demande introuvable');
            const validStatuses = [
                depannage_request_entity_1.DepannageStatus.AGREEMENT_REACHED,
                depannage_request_entity_1.DepannageStatus.PAYMENT_PENDING,
                depannage_request_entity_1.DepannageStatus.ACCOUNT_TOPPED_UP,
            ];
            if (!validStatuses.includes(req.status)) {
                throw new common_1.BadRequestException('Financement impossible dans ce statut');
            }
            this.logger.log(`Escrow funded for ${requestId} — ref: ${transactionRef}`);
            req.escrowStatus = order_entity_1.EscrowStatus.FUNDED;
            req.status = depannage_request_entity_1.DepannageStatus.FUNDS_HELD;
            return manager.save(req);
        });
    }
    // Étape 6c — Verrouiller l'intervention après confirmation des fonds
    async lockIntervention(requestId, requiredPartIds) {
        const req = await this.repo.findOne({ where: { id: requestId } });
        if (!req)
            throw new common_1.NotFoundException();
        if (req.status !== depannage_request_entity_1.DepannageStatus.FUNDS_HELD) {
            throw new common_1.BadRequestException('Les fonds doivent être bloqués avant de verrouiller');
        }
        if (requiredPartIds?.length) {
            req.requiredPartIds = requiredPartIds;
            req.status = depannage_request_entity_1.DepannageStatus.PARTS_REQUESTED;
        }
        else {
            req.status = depannage_request_entity_1.DepannageStatus.INTERVENTION_LOCKED;
        }
        return this.repo.save(req);
    }
    // Étape 7 — Marquer les pièces comme expédiées → déverrouille l'intervention
    async dispatchParts(requestId) {
        const req = await this.repo.findOne({ where: { id: requestId } });
        if (!req)
            throw new common_1.NotFoundException();
        if (req.status !== depannage_request_entity_1.DepannageStatus.PARTS_REQUESTED) {
            throw new common_1.BadRequestException('Aucune pièce en attente d\'expédition');
        }
        req.status = depannage_request_entity_1.DepannageStatus.PARTS_DISPATCHED;
        return this.repo.save(req);
    }
    // Étape 6 — Artisan marque l'intervention comme terminée
    async completeIntervention(requestId, artisanId) {
        const req = await this.repo.findOne({ where: { id: requestId, artisanId } });
        if (!req)
            throw new common_1.NotFoundException();
        const validStatuses = [
            depannage_request_entity_1.DepannageStatus.INTERVENTION_LOCKED,
            depannage_request_entity_1.DepannageStatus.PARTS_DISPATCHED,
        ];
        if (!validStatuses.includes(req.status)) {
            throw new common_1.BadRequestException('Intervention non encore verrouillée');
        }
        req.status = depannage_request_entity_1.DepannageStatus.INTERVENTION_COMPLETED;
        return this.repo.save(req);
    }
    // Étape 6d — Client valide et libère le paiement vers l'artisan
    async releasePayment(requestId, clientId) {
        const req = await this.findAndCheck(requestId, clientId);
        if (req.status !== depannage_request_entity_1.DepannageStatus.INTERVENTION_COMPLETED) {
            throw new common_1.BadRequestException('Intervention non encore terminée');
        }
        req.escrowStatus = order_entity_1.EscrowStatus.RELEASED;
        req.status = depannage_request_entity_1.DepannageStatus.PAYMENT_RELEASED;
        // TODO: déclencher virement CinetPay
        // - artisan reçoit agreedPriceXof (net commission 5%)
        // - fixAI retient urgencyFeeXof + commission 5%
        this.logger.log(`Payment released for ${requestId}: artisan=${req.agreedPriceXof} XOF, urgency=${req.urgencyFeeXof} XOF`);
        return this.repo.save(req);
    }
    // ─── Lecture ────────────────────────────────────────────────────────────────
    async findByClient(clientId) {
        return this.repo.find({ where: { clientId }, order: { createdAt: 'DESC' } });
    }
    async findByArtisan(artisanId) {
        return this.repo.find({ where: { artisanId }, order: { createdAt: 'DESC' } });
    }
    async findOne(id) {
        const req = await this.repo.findOne({ where: { id }, relations: ['client', 'artisan'] });
        if (!req)
            throw new common_1.NotFoundException('Demande introuvable');
        return req;
    }
    // Recherche géographique d'artisans disponibles
    async findNearbyArtisans(category, lat, lng, radiusKm = 20) {
        return this.dataSource.query(`SELECT a.*, (6371 * acos(
        cos(radians($1)) * cos(radians(a.latitude)) *
        cos(radians(a.longitude) - radians($2)) +
        sin(radians($1)) * sin(radians(a.latitude))
      )) AS distance_km
      FROM artisans a
      WHERE a.specialty = $3 AND a.is_available = true AND a.is_verified = true
      HAVING distance_km <= $4
      ORDER BY distance_km ASC LIMIT 20`, [lat, lng, category, radiusKm]);
    }
    async cancel(requestId, clientId) {
        const req = await this.findAndCheck(requestId, clientId);
        const blocked = [
            depannage_request_entity_1.DepannageStatus.FUNDS_HELD,
            depannage_request_entity_1.DepannageStatus.INTERVENTION_LOCKED,
            depannage_request_entity_1.DepannageStatus.PARTS_REQUESTED,
            depannage_request_entity_1.DepannageStatus.PARTS_DISPATCHED,
            depannage_request_entity_1.DepannageStatus.INTERVENTION_COMPLETED,
            depannage_request_entity_1.DepannageStatus.PAYMENT_RELEASED,
        ];
        if (blocked.includes(req.status)) {
            throw new common_1.BadRequestException('Annulation impossible à ce stade');
        }
        req.status = depannage_request_entity_1.DepannageStatus.CANCELLED;
        return this.repo.save(req);
    }
    async findAndCheck(requestId, clientId) {
        const req = await this.repo.findOne({ where: { id: requestId, clientId } });
        if (!req)
            throw new common_1.NotFoundException('Demande introuvable');
        return req;
    }
};
exports.DepannageService = DepannageService;
exports.DepannageService = DepannageService = DepannageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(depannage_request_entity_1.DepannageRequestEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource])
], DepannageService);
//# sourceMappingURL=depannage.service.js.map