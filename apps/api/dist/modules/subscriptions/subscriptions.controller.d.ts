import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionBilling } from './entities/user-subscription.entity';
export declare class SubscriptionsController {
    private readonly service;
    constructor(service: SubscriptionsService);
    listPlans(): Promise<import("./entities/subscription-plan.entity").SubscriptionPlanEntity[]>;
    createPlan(dto: {
        name: string;
        priceMonthlyXof: number;
        priceAnnualXof: number;
        aiRequestsPerMonth: number;
        devisProMaxFiles: number;
        decorationEnabled: boolean;
        renovationDiagnosisEnabled: boolean;
    }): Promise<import("./entities/subscription-plan.entity").SubscriptionPlanEntity>;
    updatePlan(id: string, dto: Partial<{
        name: string;
        priceMonthlyXof: number;
        priceAnnualXof: number;
        aiRequestsPerMonth: number;
        devisProMaxFiles: number;
        decorationEnabled: boolean;
        renovationDiagnosisEnabled: boolean;
        isActive: boolean;
    }>): Promise<import("./entities/subscription-plan.entity").SubscriptionPlanEntity>;
    getMy(req: {
        user: {
            sub: string;
        };
    }): Promise<import("./entities/user-subscription.entity").UserSubscriptionEntity | null>;
    getMyQuota(req: {
        user: {
            sub: string;
        };
    }): Promise<import("./subscriptions.service").AiQuotaCheck>;
    subscribe(req: {
        user: {
            sub: string;
        };
    }, dto: {
        planId: string;
        billing: SubscriptionBilling;
        paymentRef: string;
    }): Promise<import("./entities/user-subscription.entity").UserSubscriptionEntity>;
    cancel(req: {
        user: {
            sub: string;
        };
    }): Promise<void>;
}
//# sourceMappingURL=subscriptions.controller.d.ts.map