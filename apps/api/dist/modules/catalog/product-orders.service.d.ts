import { Repository } from 'typeorm';
import { ProductOrderEntity } from './entities/product-order.entity';
import { ProductEntity } from './entities/product.entity';
import { UserEntity } from '../users/entities/user.entity';
import { CommissionConfigEntity } from '../admin/entities/commission-config.entity';
export interface CreateProductOrderDto {
    items: Array<{
        productId: string;
        qty: number;
    }>;
    merchantId: string;
    notes?: string;
    linkedServiceOrderId?: string;
    linkedDevisProId?: string;
}
export declare class ProductOrdersService {
    private readonly poRepo;
    private readonly productRepo;
    private readonly userRepo;
    private readonly commissionRepo;
    constructor(poRepo: Repository<ProductOrderEntity>, productRepo: Repository<ProductEntity>, userRepo: Repository<UserEntity>, commissionRepo: Repository<CommissionConfigEntity>);
    private getCommissionRate;
    /**
     * Règle 1 : une commande doit être liée à un service OU à un devis pro validé.
     */
    create(client: UserEntity, dto: CreateProductOrderDto): Promise<ProductOrderEntity>;
    /**
     * Règle 2 : déclenché quand wallet est plein ET artisan/devis validé.
     * Bloque les fonds en escrow et passe en PROCESSING (commande envoyée à la boutique).
     */
    triggerEscrowAndProcess(orderId: string, requesterUserId: string): Promise<ProductOrderEntity>;
    /** Boutique marque la commande comme prête */
    markReady(orderId: string, merchantUserId: string): Promise<ProductOrderEntity>;
    /** Client ou boutique confirme la livraison — libère l'escrow */
    markDelivered(orderId: string, requesterUserId: string): Promise<ProductOrderEntity>;
    cancelOrder(orderId: string, requesterUserId: string): Promise<ProductOrderEntity>;
    findByClient(clientId: string): Promise<ProductOrderEntity[]>;
    findByMerchant(merchantId: string): Promise<ProductOrderEntity[]>;
    findById(id: string): Promise<ProductOrderEntity>;
    /** Stats pour le dashboard marchant */
    getMerchantStats(merchantId: string): Promise<{
        activeProducts: number;
        promotedProducts: number;
        toProcess: number;
        ready: number;
        totalRevenue: number;
    }>;
}
//# sourceMappingURL=product-orders.service.d.ts.map