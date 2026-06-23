import { Repository } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { ArtisanEntity } from '../artisans/entities/artisan.entity';
import { OrderEntity } from '../orders/entities/order.entity';
import { DocumentEntity } from '../documents/entities/document.entity';
import { CommissionConfigEntity } from './entities/commission-config.entity';
import { VerifyStepDto } from './dto/verify-step.dto';
export declare class AdminService {
    private readonly usersRepo;
    private readonly artisansRepo;
    private readonly ordersRepo;
    private readonly docsRepo;
    private readonly commissionRepo;
    private readonly logger;
    constructor(usersRepo: Repository<UserEntity>, artisansRepo: Repository<ArtisanEntity>, ordersRepo: Repository<OrderEntity>, docsRepo: Repository<DocumentEntity>, commissionRepo: Repository<CommissionConfigEntity>);
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