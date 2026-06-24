import { UserEntity } from '../../users/entities/user.entity';
import { ArtisanEntity } from '../../artisans/entities/artisan.entity';
export declare enum OrderStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    DISPUTED = "DISPUTED"
}
export declare enum EscrowStatus {
    NOT_FUNDED = "NOT_FUNDED",
    FUNDED = "FUNDED",
    RELEASED = "RELEASED",
    REFUNDED = "REFUNDED",
    DISPUTED = "DISPUTED"
}
export declare class OrderEntity {
    id: string;
    client: UserEntity;
    artisan: ArtisanEntity;
    description: string;
    status: OrderStatus;
    scheduledAt: Date;
    completedAt?: Date;
    escrowAmount: number;
    escrowStatus: EscrowStatus;
    address: string;
    city: string;
    notes?: string;
    paymentTransactionId?: string;
    /**
     * ID de l'agence/BTP qui gère le litige.
     * Alimenté automatiquement à la mise en DISPUTED depuis l'agencyId de l'artisan.
     * Si null → litige géré par l'admin fixAI.
     */
    disputeHandlerId?: string;
    disputeHandler?: UserEntity;
    disputeReason?: string;
    disputeResolution?: string;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=order.entity.d.ts.map