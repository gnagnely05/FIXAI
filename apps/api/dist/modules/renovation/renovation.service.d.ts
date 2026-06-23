import { Repository, DataSource } from 'typeorm';
import { RenovationProjectEntity } from './entities/renovation-project.entity';
export declare class RenovationService {
    private readonly repo;
    private readonly dataSource;
    private readonly logger;
    constructor(repo: Repository<RenovationProjectEntity>, dataSource: DataSource);
    create(clientId: string, dto: {
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
    }): Promise<RenovationProjectEntity>;
    private runAiDiagnosis;
    confirmDiagnosis(projectId: string, clientId: string): Promise<RenovationProjectEntity>;
    submitProposal(projectId: string, companyId: string, companyName: string, totalPriceXof: number, durationDays: number, notes?: string): Promise<RenovationProjectEntity>;
    selectCompany(projectId: string, clientId: string, companyId: string): Promise<RenovationProjectEntity>;
    finalizeQuote(projectId: string, clientId: string, milestones: Array<{
        title: string;
        description: string;
        amountXof: number;
        dueDate: string;
    }>): Promise<RenovationProjectEntity>;
    fundEscrow(projectId: string, clientId: string, amountXof: number, transactionRef: string): Promise<RenovationProjectEntity>;
    startProject(projectId: string, companyId: string): Promise<RenovationProjectEntity>;
    completeMilestone(projectId: string, companyId: string, milestoneId: string, progressPhotoUrls?: string[]): Promise<RenovationProjectEntity>;
    releaseMilestonePayment(projectId: string, clientId: string, milestoneId: string): Promise<RenovationProjectEntity>;
    addProgressPhoto(projectId: string, photoUrl: string): Promise<RenovationProjectEntity>;
    cancel(projectId: string, clientId: string): Promise<RenovationProjectEntity>;
    findByClient(clientId: string): Promise<RenovationProjectEntity[]>;
    findOne(id: string): Promise<RenovationProjectEntity>;
}
//# sourceMappingURL=renovation.service.d.ts.map