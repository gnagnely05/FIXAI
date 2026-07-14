import { Repository } from 'typeorm';
import { SubscriptionPlanEntity } from './entities/subscription-plan.entity';
import { UserSubscriptionEntity, SubscriptionBilling } from './entities/user-subscription.entity';
import { AiUsageLogEntity } from './entities/ai-usage-log.entity';
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
    private readonly usageRepo;
    private readonly logger;
    constructor(planRepo: Repository<SubscriptionPlanEntity>, subRepo: Repository<UserSubscriptionEntity>, usageRepo: Repository<AiUsageLogEntity>);
    /** Nombre de requêtes IA consommées par l'utilisateur depuis le début du mois. */
    private countMonthlyUsage;
    createPlan(dto: Partial<SubscriptionPlanEntity>): Promise<SubscriptionPlanEntity>;
    updatePlan(id: string, dto: Partial<SubscriptionPlanEntity>): Promise<SubscriptionPlanEntity>;
    listPlans(): Promise<SubscriptionPlanEntity[]>;
    subscribe(userId: string, planId: string, billing: SubscriptionBilling, paymentRef: string): Promise<UserSubscriptionEntity>;
    cancel(userId: string): Promise<void>;
    getActiveSub(userId: string): Promise<UserSubscriptionEntity | null>;
    checkAiQuota(userId: string): Promise<AiQuotaCheck>;
    consumeAiRequest(userId: string, service?: string): Promise<void>;
    assertAiAllowed(userId: string): Promise<void>;
    private resetMonthlyQuotaIfNeeded;
    private countFreeMonthlyUsage;
}
//# sourceMappingURL=subscriptions.service.d.ts.map