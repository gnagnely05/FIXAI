import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
  RenovationProjectEntity,
  RenovationStatus,
  CompanyProposal,
  DiagnosisReport,
  Milestone,
} from './entities/renovation-project.entity';
import { EscrowStatus } from '../orders/entities/order.entity';

@Injectable()
export class RenovationService {
  private readonly logger = new Logger(RenovationService.name);

  constructor(
    @InjectRepository(RenovationProjectEntity)
    private readonly repo: Repository<RenovationProjectEntity>,
    private readonly dataSource: DataSource,
  ) {}

  // Étape 1 — Créer le projet + lancer diagnostic IA
  async create(
    clientId: string,
    dto: {
      title: string;
      description: string;
      projectType: string;
      address: string;
      city: string;
      latitude?: number;
      longitude?: number;
      photoUrls?: string[];
      budgetXof?: number;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<RenovationProjectEntity> {
    const project = this.repo.create({
      clientId,
      title: dto.title,
      description: dto.description,
      projectType: dto.projectType as any,
      address: dto.address,
      city: dto.city,
      latitude: dto.latitude,
      longitude: dto.longitude,
      photoUrls: dto.photoUrls ?? [],
      budgetXof: dto.budgetXof ?? 0,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      status: RenovationStatus.DIAGNOSIS_PENDING,
      proposals: [],
      milestones: [],
    });
    const saved = await this.repo.save(project);
    this.runAiDiagnosis(saved.id, dto.description).catch(e =>
      this.logger.error(`Renovation diagnosis failed for ${saved.id}`, e),
    );
    return saved;
  }

  private async runAiDiagnosis(projectId: string, description: string): Promise<void> {
    // TODO: appel réel Claude API avec description + photos
    const report: DiagnosisReport = {
      summary: `Analyse IA du projet : ${description.slice(0, 100)}`,
      estimatedPriceMinXof: 500_000,
      estimatedPriceMaxXof: 2_000_000,
      recommendedProjectType: 'RENOVATION',
      keyRisks: ['Délai d\'exécution', 'Qualité des matériaux'],
      generatedAt: new Date().toISOString(),
    };
    await this.repo.update(projectId, {
      diagnosisReport: report,
      status: RenovationStatus.DIAGNOSIS_DONE,
    });
    this.logger.log(`Renovation diagnosis done for ${projectId}`);
  }

  // Étape 1 — Client valide le diagnostic → ouvre l'appel d'offre
  async confirmDiagnosis(projectId: string, clientId: string): Promise<RenovationProjectEntity> {
    const project = await this.repo.findOne({ where: { id: projectId, clientId } });
    if (!project) throw new NotFoundException('Projet introuvable');
    if (project.status !== RenovationStatus.DIAGNOSIS_DONE) {
      throw new BadRequestException('Le diagnostic IA n\'est pas encore disponible');
    }
    project.status = RenovationStatus.QUOTE_CONFIRMED;
    await this.repo.save(project);
    project.status = RenovationStatus.TENDER_OPEN;
    return this.repo.save(project);
  }

  // Étape 3 — Entreprise soumet une proposition
  async submitProposal(
    projectId: string,
    companyId: string,
    companyName: string,
    totalPriceXof: number,
    durationDays: number,
    notes?: string,
  ): Promise<RenovationProjectEntity> {
    const project = await this.repo.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Projet introuvable');
    if (project.status !== RenovationStatus.TENDER_OPEN) {
      throw new BadRequestException('L\'appel d\'offre n\'est pas ouvert');
    }
    const proposal: CompanyProposal = {
      companyId,
      companyName,
      totalPriceXof,
      durationDays,
      notes,
      submittedAt: new Date().toISOString(),
    };
    project.proposals = [...(project.proposals ?? []), proposal];
    project.status = RenovationStatus.PROPOSAL_SUBMITTED;
    return this.repo.save(project);
  }

  // Étape 4 — Client choisit une entreprise (ouvre le chat)
  async selectCompany(
    projectId: string,
    clientId: string,
    companyId: string,
  ): Promise<RenovationProjectEntity> {
    const project = await this.repo.findOne({ where: { id: projectId, clientId } });
    if (!project) throw new NotFoundException('Projet introuvable');
    if (![RenovationStatus.PROPOSAL_SUBMITTED, RenovationStatus.PROPOSALS_RECEIVED].includes(project.status)) {
      throw new BadRequestException('Aucune proposition disponible');
    }
    const chosen = project.proposals.find(p => p.companyId === companyId);
    if (!chosen) throw new BadRequestException('Proposition introuvable');
    project.companyId = companyId;
    project.agreedPriceXof = chosen.totalPriceXof;
    project.status = RenovationStatus.CHAT_OPEN;
    return this.repo.save(project);
  }

  // Étape 5 — Devis final + définition des jalons
  async finalizeQuote(
    projectId: string,
    clientId: string,
    milestones: Array<{ title: string; description: string; amountXof: number; dueDate: string }>,
  ): Promise<RenovationProjectEntity> {
    const project = await this.repo.findOne({ where: { id: projectId, clientId } });
    if (!project) throw new NotFoundException('Projet introuvable');
    if (project.status !== RenovationStatus.CHAT_OPEN) {
      throw new BadRequestException('Le chat doit être ouvert pour finaliser le devis');
    }
    const total = milestones.reduce((s, m) => s + m.amountXof, 0);
    if (total !== Number(project.agreedPriceXof)) {
      throw new BadRequestException('La somme des jalons doit égaler le prix convenu');
    }
    project.milestones = milestones.map(m => ({
      ...m,
      id: uuidv4(),
      status: 'PENDING' as const,
    }));
    project.status = RenovationStatus.MILESTONES_AGREED;
    return this.repo.save(project);
  }

  // Étape 6 — Client alimente l'escrow (premier jalon ou total)
  async fundEscrow(
    projectId: string,
    clientId: string,
    amountXof: number,
    transactionRef: string,
  ): Promise<RenovationProjectEntity> {
    const project = await this.repo.findOne({ where: { id: projectId, clientId } });
    if (!project) throw new NotFoundException('Projet introuvable');
    if (project.status !== RenovationStatus.MILESTONES_AGREED) {
      throw new BadRequestException('Les jalons doivent être validés avant le paiement');
    }

    return this.dataSource.transaction(async manager => {
      project.escrowAmountXof = amountXof;
      project.escrowStatus = EscrowStatus.FUNDED;
      project.status = RenovationStatus.FUNDS_HELD;
      // TODO: appel CinetPay hold funds — RELECTURE HUMAINE REQUISE avant production
      this.logger.warn(`[ESCROW] Fund renovation ${projectId} — ref: ${transactionRef} — HUMAN REVIEW REQUIRED`);
      return manager.save(project);
    });
  }

  // Étape 6 — Lancer le chantier
  async startProject(projectId: string, companyId: string): Promise<RenovationProjectEntity> {
    const project = await this.repo.findOne({ where: { id: projectId, companyId } });
    if (!project) throw new NotFoundException('Projet introuvable');
    if (project.status !== RenovationStatus.FUNDS_HELD) {
      throw new BadRequestException('Les fonds doivent être bloqués pour démarrer');
    }
    project.status = RenovationStatus.IN_PROGRESS;
    return this.repo.save(project);
  }

  // Étape 6 — Marquer un jalon comme complété
  async completeMilestone(
    projectId: string,
    companyId: string,
    milestoneId: string,
    progressPhotoUrls?: string[],
  ): Promise<RenovationProjectEntity> {
    const project = await this.repo.findOne({ where: { id: projectId, companyId } });
    if (!project) throw new NotFoundException('Projet introuvable');
    const milestone = project.milestones.find(m => m.id === milestoneId);
    if (!milestone) throw new NotFoundException('Jalon introuvable');
    if (milestone.status !== 'PENDING' && milestone.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Jalon déjà complété');
    }
    milestone.status = 'COMPLETED';
    milestone.completedAt = new Date().toISOString();
    if (progressPhotoUrls?.length) {
      project.progressPhotos = [...(project.progressPhotos ?? []), ...progressPhotoUrls];
    }
    project.status = RenovationStatus.MILESTONE_COMPLETED;
    return this.repo.save(project);
  }

  // Étape 6 — Client libère le paiement du jalon
  async releaseMilestonePayment(
    projectId: string,
    clientId: string,
    milestoneId: string,
  ): Promise<RenovationProjectEntity> {
    const project = await this.repo.findOne({ where: { id: projectId, clientId } });
    if (!project) throw new NotFoundException('Projet introuvable');
    const milestone = project.milestones.find(m => m.id === milestoneId);
    if (!milestone) throw new NotFoundException('Jalon introuvable');
    if (milestone.status !== 'COMPLETED') throw new BadRequestException('Le jalon doit être complété');

    return this.dataSource.transaction(async manager => {
      milestone.status = 'RELEASED';
      milestone.releasedAt = new Date().toISOString();
      // TODO: CinetPay transfer to company — RELECTURE HUMAINE REQUISE avant production
      this.logger.warn(`[ESCROW] Release milestone ${milestoneId} for project ${projectId} — HUMAN REVIEW REQUIRED`);

      const allReleased = project.milestones.every(m => m.status === 'RELEASED');
      if (allReleased) {
        project.status = RenovationStatus.COMPLETED;
        project.escrowStatus = EscrowStatus.RELEASED;
      } else {
        project.status = RenovationStatus.MILESTONE_RELEASED;
      }
      return manager.save(project);
    });
  }

  // Ajouter une photo de progression
  async addProgressPhoto(projectId: string, photoUrl: string): Promise<RenovationProjectEntity> {
    const project = await this.findOne(projectId);
    project.progressPhotos = [...(project.progressPhotos ?? []), photoUrl];
    return this.repo.save(project);
  }

  async cancel(projectId: string, clientId: string): Promise<RenovationProjectEntity> {
    const project = await this.repo.findOne({ where: { id: projectId, clientId } });
    if (!project) throw new NotFoundException('Projet introuvable');
    if ([RenovationStatus.COMPLETED, RenovationStatus.CANCELLED].includes(project.status)) {
      throw new BadRequestException('Impossible d\'annuler dans l\'état actuel');
    }
    project.status = RenovationStatus.CANCELLED;
    return this.repo.save(project);
  }

  async findByClient(clientId: string): Promise<RenovationProjectEntity[]> {
    return this.repo.find({ where: { clientId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<RenovationProjectEntity> {
    const p = await this.repo.findOne({ where: { id }, relations: ['client'] });
    if (!p) throw new NotFoundException('Projet introuvable');
    return p;
  }
}
