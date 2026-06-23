import { Repository } from 'typeorm';
import { SubscriptionPlanEntity } from './entities/subscription-plan.entity';
import { UserSubscriptionEntity, SubscriptionBilling } from './entities/user-subscription.entity';
export interface AiQuotaCheck {
    allowed: boolean;
    isPro: boolean;
    requestsUsed: number;
    requestsLimit: number;
    plan: SubscriptionPlanEntity | null;
}
export declare class SubscriptionsService {
    private readonly planRepo;
    private readonly subRepo;
    private readonly logger;
    constructor(planRepo: Repository<SubscriptionPlanEntity>, subRepo: Repository<UserSubscriptionEntity>);
    createPlan(dto: Partial<SubscriptionPlanEntity>): Promise<SubscriptionPlanEntity>;
    updatePlan(id: string, dto: Partial<SubscriptionPlanEntity>): Promise<SubscriptionPlanEntity>;
    listPlans(): Promise<SubscriptionPlanEntity[]>;
    subscribe(userId: string, planId: string, billing: SubscriptionBilling, paymentRef: string): Promise<UserSubscriptionEntity>;
    cancel(userId: string): Promise<void>;
    getActiveSub(userId: string): Promise<UserSubscriptionEntity | null>;
    checkAiQuota(userId: string): Promise<AiQuotaCheck>;
    consumeAiRequest(userId: string): Promise<void>;
    assertAiAllowed(userId: string): Promise<void>;
    private resetMonthlyQuotaIfNeeded;
    private countFreeMonthlyUsage;
}
//# sourceMappingURL=subscriptions.service.d.ts.map