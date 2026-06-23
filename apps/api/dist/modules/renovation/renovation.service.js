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
var RenovationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenovationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const renovation_project_entity_1 = require("./entities/renovation-project.entity");
const order_entity_1 = require("../orders/entities/order.entity");
let RenovationService = RenovationService_1 = class RenovationService {
    constructor(repo, dataSource) {
        this.repo = repo;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(RenovationService_1.name);
    }
    // Étape 1 — Créer le projet + lancer diagnostic IA
    async create(clientId, dto) {
        const project = this.repo.create({
            clientId,
            title: dto.title,
            description: dto.description,
            projectType: dto.projectType,
            address: dto.address,
            city: dto.city,
            latitude: dto.latitude,
            longitude: dto.longitude,
            photoUrls: dto.photoUrls ?? [],
            budgetXof: dto.budgetXof ?? 0,
            startDate: dto.startDate ? new Date(dto.startDate) : undefined,
            endDate: dto.endDate ? new Date(dto.endDate) : undefined,
            status: renovation_project_entity_1.RenovationStatus.DIAGNOSIS_PENDING,
            proposals: [],
            milestones: [],
        });
        const saved = await this.repo.save(project);
        this.runAiDiagnosis(saved.id, dto.description).catch(e => this.logger.error(`Renovation diagnosis failed for ${saved.id}`, e));
        return saved;
    }
    async runAiDiagnosis(projectId, description) {
        // TODO: appel réel Claude API avec description + photos
        const report = {
            summary: `Analyse IA du projet : ${description.slice(0, 100)}`,
            estimatedPriceMinXof: 500_000,
            estimatedPriceMaxXof: 2_000_000,
            recommendedProjectType: 'RENOVATION',
            keyRisks: ['Délai d\'exécution', 'Qualité des matériaux'],
            generatedAt: new Date().toISOString(),
        };
        await this.repo.update(projectId, {
            diagnosisReport: report,
            status: renovation_project_entity_1.RenovationStatus.DIAGNOSIS_DONE,
        });
        this.logger.log(`Renovation diagnosis done for ${projectId}`);
    }
    // Étape 1 — Client valide le diagnostic → ouvre l'appel d'offre
    async confirmDiagnosis(projectId, clientId) {
        const project = await this.repo.findOne({ where: { id: projectId, clientId } });
        if (!project)
            throw new common_1.NotFoundException('Projet introuvable');
        if (project.status !== renovation_project_entity_1.RenovationStatus.DIAGNOSIS_DONE) {
            throw new common_1.BadRequestException('Le diagnostic IA n\'est pas encore disponible');
        }
        project.status = renovation_project_entity_1.RenovationStatus.QUOTE_CONFIRMED;
        await this.repo.save(project);
        project.status = renovation_project_entity_1.RenovationStatus.TENDER_OPEN;
        return this.repo.save(project);
    }
    // Étape 3 — Entreprise soumet une proposition
    async submitProposal(projectId, companyId, companyName, totalPriceXof, durationDays, notes) {
        const project = await this.repo.findOne({ where: { id: projectId } });
        if (!project)
            throw new common_1.NotFoundException('Projet introuvable');
        if (project.status !== renovation_project_entity_1.RenovationStatus.TENDER_OPEN) {
            throw new common_1.BadRequestException('L\'appel d\'offre n\'est pas ouvert');
        }
        const proposal = {
            companyId,
            companyName,
            totalPriceXof,
            durationDays,
            notes,
            submittedAt: new Date().toISOString(),
        };
        project.proposals = [...(project.proposals ?? []), proposal];
        project.status = renovation_project_entity_1.RenovationStatus.PROPOSAL_SUBMITTED;
        return this.repo.save(project);
    }
    // Étape 4 — Client choisit une entreprise (ouvre le chat)
    async selectCompany(projectId, clientId, companyId) {
        const project = await this.repo.findOne({ where: { id: projectId, clientId } });
        if (!project)
            throw new common_1.NotFoundException('Projet introuvable');
        if (![renovation_project_entity_1.RenovationStatus.PROPOSAL_SUBMITTED, renovation_project_entity_1.RenovationStatus.PROPOSALS_RECEIVED].includes(project.status)) {
            throw new common_1.BadRequestException('Aucune proposition disponible');
        }
        const chosen = project.proposals.find(p => p.companyId === companyId);
        if (!chosen)
            throw new common_1.BadRequestException('Proposition introuvable');
        project.companyId = companyId;
        project.agreedPriceXof = chosen.totalPriceXof;
        project.status = renovation_project_entity_1.RenovationStatus.CHAT_OPEN;
        return this.repo.save(project);
    }
    // Étape 5 — Devis final + définition des jalons
    async finalizeQuote(projectId, clientId, milestones) {
        const project = await this.repo.findOne({ where: { id: projectId, clientId } });
        if (!project)
            throw new common_1.NotFoundException('Projet introuvable');
        if (project.status !== renovation_project_entity_1.RenovationStatus.CHAT_OPEN) {
            throw new common_1.BadRequestException('Le chat doit être ouvert pour finaliser le devis');
        }
        const total = milestones.reduce((s, m) => s + m.amountXof, 0);
        if (total !== Number(project.agreedPriceXof)) {
            throw new common_1.BadRequestException('La somme des jalons doit égaler le prix convenu');
        }
        project.milestones = milestones.map(m => ({
            ...m,
            id: (0, uuid_1.v4)(),
            status: 'PENDING',
        }));
        project.status = renovation_project_entity_1.RenovationStatus.MILESTONES_AGREED;
        return this.repo.save(project);
    }
    // Étape 6 — Client alimente l'escrow (premier jalon ou total)
    async fundEscrow(projectId, clientId, amountXof, transactionRef) {
        const project = await this.repo.findOne({ where: { id: projectId, clientId } });
        if (!project)
            throw new common_1.NotFoundException('Projet introuvable');
        if (project.status !== renovation_project_entity_1.RenovationStatus.MILESTONES_AGREED) {
            throw new common_1.BadRequestException('Les jalons doivent être validés avant le paiement');
        }
        return this.dataSource.transaction(async (manager) => {
            project.escrowAmountXof = amountXof;
            project.escrowStatus = order_entity_1.EscrowStatus.FUNDED;
            project.status = renovation_project_entity_1.RenovationStatus.FUNDS_HELD;
            // TODO: appel CinetPay hold funds — RELECTURE HUMAINE REQUISE avant production
            this.logger.warn(`[ESCROW] Fund renovation ${projectId} — ref: ${transactionRef} — HUMAN REVIEW REQUIRED`);
            return manager.save(project);
        });
    }
    // Étape 6 — Lancer le chantier
    async startProject(projectId, companyId) {
        const project = await this.repo.findOne({ where: { id: projectId, companyId } });
        if (!project)
            throw new common_1.NotFoundException('Projet introuvable');
        if (project.status !== renovation_project_entity_1.RenovationStatus.FUNDS_HELD) {
            throw new common_1.BadRequestException('Les fonds doivent être bloqués pour démarrer');
        }
        project.status = renovation_project_entity_1.RenovationStatus.IN_PROGRESS;
        return this.repo.save(project);
    }
    // Étape 6 — Marquer un jalon comme complété
    async completeMilestone(projectId, companyId, milestoneId, progressPhotoUrls) {
        const project = await this.repo.findOne({ where: { id: projectId, companyId } });
        if (!project)
            throw new common_1.NotFoundException('Projet introuvable');
        const milestone = project.milestones.find(m => m.id === milestoneId);
        if (!milestone)
            throw new common_1.NotFoundException('Jalon introuvable');
        if (milestone.status !== 'PENDING' && milestone.status !== 'IN_PROGRESS') {
            throw new common_1.BadRequestException('Jalon déjà complété');
        }
        milestone.status = 'COMPLETED';
        milestone.completedAt = new Date().toISOString();
        if (progressPhotoUrls?.length) {
            project.progressPhotos = [...(project.progressPhotos ?? []), ...progressPhotoUrls];
        }
        project.status = renovation_project_entity_1.RenovationStatus.MILESTONE_COMPLETED;
        return this.repo.save(project);
    }
    // Étape 6 — Client libère le paiement du jalon
    async releaseMilestonePayment(projectId, clientId, milestoneId) {
        const project = await this.repo.findOne({ where: { id: projectId, clientId } });
        if (!project)
            throw new common_1.NotFoundException('Projet introuvable');
        const milestone = project.milestones.find(m => m.id === milestoneId);
        if (!milestone)
            throw new common_1.NotFoundException('Jalon introuvable');
        if (milestone.status !== 'COMPLETED')
            throw new common_1.BadRequestException('Le jalon doit être complété');
        return this.dataSource.transaction(async (manager) => {
            milestone.status = 'RELEASED';
            milestone.releasedAt = new Date().toISOString();
            // TODO: CinetPay transfer to company — RELECTURE HUMAINE REQUISE avant production
            this.logger.warn(`[ESCROW] Release milestone ${milestoneId} for project ${projectId} — HUMAN REVIEW REQUIRED`);
            const allReleased = project.milestones.every(m => m.status === 'RELEASED');
            if (allReleased) {
                project.status = renovation_project_entity_1.RenovationStatus.COMPLETED;
                project.escrowStatus = order_entity_1.EscrowStatus.RELEASED;
            }
            else {
                project.status = renovation_project_entity_1.RenovationStatus.MILESTONE_RELEASED;
            }
            return manager.save(project);
        });
    }
    // Ajouter une photo de progression
    async addProgressPhoto(projectId, photoUrl) {
        const project = await this.findOne(projectId);
        project.progressPhotos = [...(project.progressPhotos ?? []), photoUrl];
        return this.repo.save(project);
    }
    async cancel(projectId, clientId) {
        const project = await this.repo.findOne({ where: { id: projectId, clientId } });
        if (!project)
            throw new common_1.NotFoundException('Projet introuvable');
        if ([renovation_project_entity_1.RenovationStatus.COMPLETED, renovation_project_entity_1.RenovationStatus.CANCELLED].includes(project.status)) {
            throw new common_1.BadRequestException('Impossible d\'annuler dans l\'état actuel');
        }
        project.status = renovation_project_entity_1.RenovationStatus.CANCELLED;
        return this.repo.save(project);
    }
    async findByClient(clientId) {
        return this.repo.find({ where: { clientId }, order: { createdAt: 'DESC' } });
    }
    async findOne(id) {
        const p = await this.repo.findOne({ where: { id }, relations: ['client'] });
        if (!p)
            throw new common_1.NotFoundException('Projet introuvable');
        return p;
    }
};
exports.RenovationService = RenovationService;
exports.RenovationService = RenovationService = RenovationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(renovation_project_entity_1.RenovationProjectEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource])
], RenovationService);
//# sourceMappingURL=renovation.service.js.map