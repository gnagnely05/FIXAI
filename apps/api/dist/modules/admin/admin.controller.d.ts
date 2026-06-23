import { AdminService } from './admin.service';
import { VerifyStepDto } from './dto/verify-step.dto';
export declare class AdminController {
    private readonly service;
    constructor(service: AdminService);
    getVerifications(): Promise<{
        users: import("../users/entities/user.entity").UserEntity[];
        documents: import("../documents/entities/document.entity").DocumentEntity[];
    }>;
    verifyStep(dto: VerifyStepDto): Promise<import("../users/entities/user.entity").UserEntity>;
    getPendingVerifications(): Promise<{
        users: import("../users/entities/user.entity").UserEntity[];
        documents: import("../documents/entities/document.entity").DocumentEntity[];
    }>;
    verifyUser(userId: string): Promise<import("../users/entities/user.entity").UserEntity>;
    rejectUser(userId: string, reason: string): Promise<{
        message: string;
    }>;
    getCommission(): Promise<import("./entities/commission-config.entity").CommissionConfigEntity>;
    updateCommission(body: {
        fixaiRate: number;
        agencyRate: number;
    }): Promise<import("./entities/commission-config.entity").CommissionConfigEntity>;
    getEscrowOverview(): Promise<{
        totalFunded: number;
        totalReleased: number;
        totalRefunded: number;
        pendingEscrow: number;
        orders: import("../orders/entities/order.entity").OrderEntity[];
    }>;
    getDisputes(): Promise<import("../orders/entities/order.entity").OrderEntity[]>;
}
//# sourceMappingURL=admin.controller.d.ts.map