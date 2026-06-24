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
    seedAdmin(body: {
        setupSecret: string;
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    }): Promise<{
        message: string;
        user: any;
    }>;
    getCommission(): Promise<import("./entities/commission-config.entity").CommissionConfigEntity>;
    updateCommission(body: {
        fixaiRate: number;
        agencyRate: number;
    }): Promise<import("./entities/commission-config.entity").CommissionConfigEntity>;
    getActors(role?: string, status?: string, q?: string): Promise<import("../users/entities/user.entity").UserEntity[]>;
    getActor(id: string): Promise<any>;
    updateActor(id: string, body: Record<string, any>): Promise<any>;
    deleteActor(id: string): Promise<{
        message: string;
    }>;
    suspendActor(id: string, reason?: string): Promise<any>;
    activateActor(id: string): Promise<any>;
    getProducts(merchantId?: string, merchantType?: string, q?: string): Promise<import("../catalog/entities/product.entity").ProductEntity[]>;
    createProduct(body: Record<string, any>): Promise<import("../catalog/entities/product.entity").ProductEntity>;
    updateProduct(id: string, body: Record<string, any>): Promise<import("../catalog/entities/product.entity").ProductEntity>;
    deleteProduct(id: string): Promise<{
        message: string;
    }>;
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