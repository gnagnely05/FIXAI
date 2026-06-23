import { RenovationService } from './renovation.service';
export declare class RenovationController {
    private readonly service;
    constructor(service: RenovationService);
    create(req: {
        user: {
            sub: string;
        };
    }, dto: {
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
    }): Promise<import("./entities/renovation-project.entity").RenovationProjectEntity>;
    confirmDiagnosis(id: string, req: {
        user: {
            sub: string;
        };
    }): Promise<import("./entities/renovation-project.entity").RenovationProjectEntity>;
    submitProposal(id: string, req: {
        user: {
            sub: string;
        };
    }, dto: {
        companyName: string;
        totalPriceXof: number;
        durationDays: number;
        notes?: string;
    }): Promise<import("./entities/renovation-project.entity").RenovationProjectEntity>;
    selectCompany(id: string, req: {
        user: {
            sub: string;
        };
    }, companyId: string): Promise<import("./entities/renovation-project.entity").RenovationProjectEntity>;
    finalizeQuote(id: string, req: {
        user: {
            sub: string;
        };
    }, dto: {
        milestones: Array<{
            title: string;
            description: string;
            amountXof: number;
            dueDate: string;
        }>;
    }): Promise<import("./entities/renovation-project.entity").RenovationProjectEntity>;
    fundEscrow(id: string, req: {
        user: {
            sub: string;
        };
    }, dto: {
        amountXof: number;
        transactionRef: string;
    }): Promise<import("./entities/renovation-project.entity").RenovationProjectEntity>;
    startProject(id: string, req: {
        user: {
            sub: string;
        };
    }): Promise<import("./entities/renovation-project.entity").RenovationProjectEntity>;
    completeMilestone(id: string, milestoneId: string, req: {
        user: {
            sub: string;
        };
    }, dto: {
        progressPhotoUrls?: string[];
    }): Promise<import("./entities/renovation-project.entity").RenovationProjectEntity>;
    releaseMilestonePayment(id: string, milestoneId: string, req: {
        user: {
            sub: string;
        };
    }): Promise<import("./entities/renovation-project.entity").RenovationProjectEntity>;
    addProgressPhoto(id: string, photoUrl: string): Promise<import("./entities/renovation-project.entity").RenovationProjectEntity>;
    cancel(id: string, req: {
        user: {
            sub: string;
        };
    }): Promise<import("./entities/renovation-project.entity").RenovationProjectEntity>;
    findMyProjects(req: {
        user: {
            sub: string;
        };
    }): Promise<import("./entities/renovation-project.entity").RenovationProjectEntity[]>;
    findOne(id: string): Promise<import("./entities/renovation-project.entity").RenovationProjectEntity>;
}
//# sourceMappingURL=renovation.controller.d.ts.map