import { Repository } from 'typeorm';
import { OrderEntity, EscrowStatus } from './entities/order.entity';
import { UserEntity } from '../users/entities/user.entity';
import { ArtisanEntity } from '../artisans/entities/artisan.entity';
export interface CreateOrderData {
    artisanId: string;
    description: string;
    scheduledAt: Date;
    address: string;
    city: string;
    notes?: string;
}
export declare class OrdersService {
    private readonly ordersRepo;
    private readonly artisansRepo;
    constructor(ordersRepo: Repository<OrderEntity>, artisansRepo: Repository<ArtisanEntity>);
    create(client: UserEntity, data: CreateOrderData): Promise<OrderEntity>;
    findByClient(clientId: string): Promise<OrderEntity[]>;
    findByArtisan(artisanId: string): Promise<OrderEntity[]>;
    findById(id: string): Promise<OrderEntity>;
    confirm(orderId: string, artisanUserId: string): Promise<OrderEntity>;
    markInProgress(orderId: string): Promise<OrderEntity>;
    complete(orderId: string, clientId: string): Promise<OrderEntity>;
    cancel(orderId: string, userId: string): Promise<OrderEntity>;
    updateEscrow(orderId: string, amount: number, status: EscrowStatus, transactionId: string): Promise<void>;
}
//# sourceMappingURL=orders.service.d.ts.map