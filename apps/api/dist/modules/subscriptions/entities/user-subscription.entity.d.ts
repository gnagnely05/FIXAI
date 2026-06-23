import { UserEntity } from '../../users/entities/user.entity';
import { SubscriptionPlanEntity } from './subscription-plan.entity';
export declare enum SubscriptionBilling {
    MONTHLY = "MONTHLY",
    ANNUAL = "ANNUAL"
}
export declare enum SubscriptionState {
    ACTIVE = "ACTIVE",
    EXPIRED = "EXPIRED",
    CANCELLED = "CANCELLED"
}
export declare class UserSubscriptionEntity {
    id: string;
    userId: string;
    planId: string;
    billing: SubscriptionBilling;
    state: SubscriptionState;
    startsAt: Date;
    expiresAt: Date;
    /** Requêtes IA consommées sur la période courante */
    aiRequestsUsed: number;
    /** Réinitialise à chaque renouvellement */
    lastResetAt: Date;
    /** Référence paiement CinetPay */
    paymentRef: string;
    user: UserEntity;
    plan: SubscriptionPlanEntity;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=user-subscription.entity.d.ts.map