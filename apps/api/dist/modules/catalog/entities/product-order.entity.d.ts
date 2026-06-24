import { UserEntity } from '../../users/entities/user.entity';
import { MerchantType } from './product.entity';
export declare enum ProductOrderStatus {
    /** Wallet client insuffisant — commande en attente de provisionnement */
    PENDING_PROVISIONING = "PENDING_PROVISIONING",
    /** Wallet provisionné, en attente de validation artisan/devis */
    PENDING_ARTISAN = "PENDING_ARTISAN",
    /** Fonds bloqués en escrow, commande transmise à la boutique */
    PROCESSING = "PROCESSING",
    /** Boutique a préparé la commande — prête au retrait/livraison */
    READY = "READY",
    /** Commande livrée/remise, escrow libéré */
    DELIVERED = "DELIVERED",
    /** Annulée — escrow remboursé si provisionné */
    CANCELLED = "CANCELLED"
}
export interface ProductOrderItem {
    productId: string;
    name: string;
    unit?: string;
    qty: number;
    unitPriceXof: number;
    subtotalXof: number;
}
export declare class ProductOrderEntity {
    id: string;
    client: UserEntity;
    /**
     * Prestation liée (commande de service existante).
     * NULL seulement si linkedDevisProId est renseigné.
     */
    linkedServiceOrderId?: string;
    /**
     * Devis Pro validé lié (exception e-commerce sans prestation).
     * NULL seulement si linkedServiceOrderId est renseigné.
     */
    linkedDevisProId?: string;
    merchantId: string;
    merchantName: string;
    merchantType: MerchantType;
    /** Items JSON : [{productId, name, unit, qty, unitPriceXof, subtotalXof}] */
    items: ProductOrderItem[];
    /** Montant total des produits en XOF */
    totalAmountXof: number;
    /** Commission FixAI prélevée (storeCommissionRate × totalAmountXof) */
    commissionAmountXof: number;
    /** Montant net reversé au marchand */
    netAmountXof: number;
    status: ProductOrderStatus;
    /** true quand les fonds sont bloqués en escrow côté platform */
    escrowLocked: boolean;
    notes?: string;
    deliveredAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=product-order.entity.d.ts.map