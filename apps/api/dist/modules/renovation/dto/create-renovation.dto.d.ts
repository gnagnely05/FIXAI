import { ProjectType } from '../entities/renovation-project.entity';
export declare class CreateRenovationDto {
    title: string;
    description: string;
    projectType: ProjectType;
    address: string;
    city: string;
    budget: number;
    startDate?: string;
    endDate?: string;
}
export declare class SubmitQuoteDto {
    quotedAmount: number;
    notes?: string;
}
export declare class UpdateMilestoneDto {
    milestoneId: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}
//# sourceMappingURL=create-renovation.dto.d.ts.map