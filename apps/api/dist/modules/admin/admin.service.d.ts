import { Repository } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { ArtisanEntity } from '../artisans/entities/artisan.entity';
import { OrderEntity } from '../orders/entities/order.entity';
import { DocumentEntity } from '../documents/entities/document.entity';
import { CommissionConfigEntity } from './entities/commission-config.entity';
import { ProductEntity } from '../catalog/entities/product.entity';
import { VerifyStepDto } from './dto/verify-step.dto';
export declare class AdminService {
    private readonly usersRepo;
    private readonly artisansRepo;
    private readonly ordersRepo;
    private readonly docsRepo;
    private readonly commissionRepo;
    private readonly productsRepo;
    private readonly logger;
    constructor(usersRepo: Repository<UserEntity>, artisansRepo: Repository<ArtisanEntity>, ordersRepo: Repository<OrderEntity>, docsRepo: Repository<DocumentEntity>, commissionRepo: Repository<CommissionConfigEntity>, productsRepo: Repository<ProductEntity>);
    getPendingVerifications(): Promise<{
        users: UserEntity[];
        documents: DocumentEntity[];
    }>;
    verifyStep(dto: VerifyStepDto): Promise<UserEntity>;
    /** Legacy alias kept for backward compatibility */
    verifyUser(userId: string): Promise<UserEntity>;
    rejectUser(userId: string, reason: string): Promise<{
        message: string;
    }>;
    getActiveCommission(): Promise<CommissionConfigEntity>;
    updateCommission(fixaiRate: number, agencyRate: number): Promise<CommissionConfigEntity>;
    getActors(role?: string, status?: string, q?: string): Promise<UserEntity[]>;
    getActorById(id: string): Promise<any>;
    updateActor(id: string, updates: Partial<UserEntity>): Promise<any>;
    deleteActor(id: string): Promise<{
        message: string;
    }>;
    suspendActor(id: string, reason?: string): Promise<any>;
    activateActor(id: string): Promise<any>;
    getProducts(merchantId?: string, merchantType?: string, q?: string): Promise<ProductEntity[]>;
    createProduct(data: Partial<ProductEntity>): Promise<ProductEntity>;
    updateProduct(id: string, data: Partial<ProductEntity>): Promise<ProductEntity>;
    deleteProduct(id: string): Promise<{
        message: string;
    }>;
    seedAdmin(email: string, password: string, firstName: string, lastName: string): Promise<{
        message: string;
        user: any;
    }>;
    getEscrowOverview(): Promise<{
        totalFunded: number;
        totalReleased: number;
        totalRefunded: number;
        pendingEscrow: number;
        orders: OrderEntity[];
    }>;
    getDisputes(): Promise<OrderEntity[]>;
}
//# sourceMappingURL=admin.service.d.ts.map