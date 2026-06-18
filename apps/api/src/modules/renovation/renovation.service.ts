import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RenovationProject, ProjectStatus, Milestone } from './entities/renovation-project.entity';
import { v4 as uuidv4 } from 'uuid';

export class CreateProjectDto {
  title: string;
  description: string;
  projectType: string;
  address: string;
  city: string;
  budget?: number;
  startDate?: string;
  endDate?: string;
}

export class SubmitQuoteDto {
  quotedAmount: number;
  milestones: Omit<Milestone, 'id' | 'completedAt' | 'paymentReleased'>[];
  startDate: string;
  endDate: string;
}

@Injectable()
export class RenovationService {
  constructor(
    @InjectRepository(RenovationProject)
    private readonly repo: Repository<RenovationProject>,
  ) {}

  async create(clientId: string, dto: CreateProjectDto): Promise<RenovationProject> {
    const project = this.repo.create({
      clientId,
      title: dto.title,
      description: dto.description,
      projectType: dto.projectType as any,
      address: dto.address,
      city: dto.city,
      budget: dto.budget ?? null,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      status: ProjectStatus.DRAFT,
    });
    return this.repo.save(project);
  }

  async requestQuote(projectId: string, clientId: string, companyId: string): Promise<RenovationProject> {
    const project = await this.getOwnedProject(projectId, clientId);
    if (project.status !== ProjectStatus.DRAFT) {
      throw new BadRequestException('Le projet doit être en état DRAFT pour demander un devis');
    }
    project.companyId = companyId;
    project.status = ProjectStatus.QUOTE_REQUESTED;
    return this.repo.save(project);
  }

  async submitQuote(projectId: string, companyId: string, dto: SubmitQuoteDto): Promise<RenovationProject> {
    const project = await this.repo.findOne({ where: { id: projectId, companyId } });
    if (!project) throw new NotFoundException();
    if (project.status !== ProjectStatus.QUOTE_REQUESTED) {
      throw new BadRequestException('Le devis ne peut être soumis qu\'après demande du client');
    }

    const totalPercentage = dto.milestones.reduce((sum, m) => sum + m.percentage, 0);
    if (totalPercentage !== 100) {
      throw new BadRequestException('La somme des pourcentages des jalons doit être 100%');
    }

    project.quotedAmount = dto.quotedAmount;
    project.startDate = new Date(dto.startDate);
    project.endDate = new Date(dto.endDate);
    project.milestones = dto.milestones.map((m) => ({
      id: uuidv4(),
      ...m,
      completedAt: null,
      paymentReleased: false,
    }));
    project.status = ProjectStatus.QUOTE_RECEIVED;
    return this.repo.save(project);
  }

  async acceptQuote(projectId: string, clientId: string): Promise<RenovationProject> {
    const project = await this.getOwnedProject(projectId, clientId);
    if (project.status !== ProjectStatus.QUOTE_RECEIVED) {
      throw new BadRequestException('Aucun devis à accepter');
    }
    project.status = ProjectStatus.ACCEPTED;
    return this.repo.save(project);
  }

  async completeMilestone(projectId: string, companyId: string, milestoneId: string): Promise<RenovationProject> {
    const project = await this.repo.findOne({ where: { id: projectId, companyId } });
    if (!project) throw new NotFoundException();

    const milestone = project.milestones.find((m) => m.id === milestoneId);
    if (!milestone) throw new NotFoundException('Jalon introuvable');
    if (milestone.completedAt) throw new BadRequestException('Jalon déjà complété');

    milestone.completedAt = new Date().toISOString();
    project.milestones = [...project.milestones];
    return this.repo.save(project);
  }

  async findByClient(clientId: string): Promise<RenovationProject[]> {
    return this.repo.find({ where: { clientId }, order: { createdAt: 'DESC' } });
  }

  async findByCompany(companyId: string): Promise<RenovationProject[]> {
    return this.repo.find({ where: { companyId }, order: { createdAt: 'DESC' } });
  }

  private async getOwnedProject(projectId: string, clientId: string): Promise<RenovationProject> {
    const project = await this.repo.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException();
    if (project.clientId !== clientId) throw new ForbiddenException();
    return project;
  }
}
