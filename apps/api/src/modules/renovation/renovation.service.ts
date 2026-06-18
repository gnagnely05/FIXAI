import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RenovationProjectEntity, RenovationStatus, Milestone } from './entities/renovation-project.entity';
import { CreateRenovationDto, SubmitQuoteDto, UpdateMilestoneDto } from './dto/create-renovation.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RenovationService {
  private readonly logger = new Logger(RenovationService.name);

  constructor(
    @InjectRepository(RenovationProjectEntity)
    private readonly repo: Repository<RenovationProjectEntity>,
  ) {}

  async create(clientId: string, dto: CreateRenovationDto): Promise<RenovationProjectEntity> {
    const project = this.repo.create({
      clientId,
      ...dto,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      milestones: [],
    });
    return this.repo.save(project);
  }

  async findByClient(clientId: string): Promise<RenovationProjectEntity[]> {
    return this.repo.find({ where: { clientId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<RenovationProjectEntity> {
    const p = await this.repo.findOne({ where: { id }, relations: ['client'] });
    if (!p) throw new NotFoundException('Project not found');
    return p;
  }

  async requestQuote(projectId: string, clientId: string, companyId: string): Promise<RenovationProjectEntity> {
    const project = await this.repo.findOne({ where: { id: projectId, clientId } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.status !== RenovationStatus.DRAFT) throw new BadRequestException('Project is not in DRAFT status');
    project.companyId = companyId;
    project.status = RenovationStatus.QUOTE_REQUESTED;
    this.logger.log(`Quote requested for project ${projectId} from company ${companyId}`);
    return this.repo.save(project);
  }

  async submitQuote(projectId: string, companyId: string, dto: SubmitQuoteDto): Promise<RenovationProjectEntity> {
    const project = await this.repo.findOne({ where: { id: projectId, companyId } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.status !== RenovationStatus.QUOTE_REQUESTED) throw new BadRequestException('Quote not requested');
    project.quotedAmount = dto.quotedAmount;
    project.status = RenovationStatus.QUOTE_RECEIVED;
    return this.repo.save(project);
  }

  async acceptQuote(projectId: string, clientId: string): Promise<RenovationProjectEntity> {
    const project = await this.repo.findOne({ where: { id: projectId, clientId } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.status !== RenovationStatus.QUOTE_RECEIVED) throw new BadRequestException('No quote to accept');
    project.status = RenovationStatus.ACCEPTED;
    return this.repo.save(project);
  }

  async addMilestone(projectId: string, milestone: Omit<Milestone, 'id' | 'status'>): Promise<RenovationProjectEntity> {
    const project = await this.findOne(projectId);
    const newMilestone: Milestone = { ...milestone, id: uuidv4(), status: 'PENDING' };
    project.milestones = [...(project.milestones || []), newMilestone];
    return this.repo.save(project);
  }

  async updateMilestone(projectId: string, dto: UpdateMilestoneDto): Promise<RenovationProjectEntity> {
    const project = await this.findOne(projectId);
    const milestone = project.milestones.find(m => m.id === dto.milestoneId);
    if (!milestone) throw new NotFoundException('Milestone not found');
    milestone.status = dto.status;
    if (dto.status === 'COMPLETED') milestone.completedAt = new Date().toISOString();
    return this.repo.save(project);
  }

  async addProgressPhoto(projectId: string, photoUrl: string): Promise<RenovationProjectEntity> {
    const project = await this.findOne(projectId);
    project.progressPhotos = [...(project.progressPhotos || []), photoUrl];
    return this.repo.save(project);
  }

  async cancel(projectId: string, clientId: string): Promise<RenovationProjectEntity> {
    const project = await this.repo.findOne({ where: { id: projectId, clientId } });
    if (!project) throw new NotFoundException('Project not found');
    if ([RenovationStatus.COMPLETED, RenovationStatus.CANCELLED].includes(project.status)) {
      throw new BadRequestException('Cannot cancel project in current status');
    }
    project.status = RenovationStatus.CANCELLED;
    return this.repo.save(project);
  }
}
