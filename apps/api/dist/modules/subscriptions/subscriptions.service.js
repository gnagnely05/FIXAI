"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SubscriptionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const subscription_plan_entity_1 = require("./entities/subscription-plan.entity");
const user_subscription_entity_1 = require("./entities/user-subscription.entity");
const ai_usage_log_entity_1 = require("./entities/ai-usage-log.entity");
let SubscriptionsService = SubscriptionsService_1 = class SubscriptionsService {
    constructor(planRepo, subRepo, usageRepo) {
        this.planRepo = planRepo;
        this.subRepo = subRepo;
        this.usageRepo = usageRepo;
        this.logger = new common_1.Logger(SubscriptionsService_1.name);
    }
    /** Nombre de requêtes IA consommées par l'utilisateur depuis le début du mois. */
    async countMonthlyUsage(userId) {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return this.usageRepo.count({ where: { userId, createdAt: (0, typeorm_2.MoreThanOrEqual)(monthStart) } });
    }
    // ─── Plans (admin) ────────────────────────────────────────────────────────
    async createPlan(dto) {
        return this.planRepo.save(this.planRepo.create(dto));
    }
    async updatePlan(id, dto) {
        await this.planRepo.update(id, dto);
        const plan = await this.planRepo.findOne({ where: { id } });
        if (!plan)
            throw new common_1.NotFoundException('Plan introuvable');
        return plan;
    }
    async listPlans() {
        return this.planRepo.find({ where: { isActive: true }, order: { priceMonthlyXof: 'ASC' } });
    }
    // ─── Subscriptions ────────────────────────────────────────────────────────
    async subscribe(userId, planId, billing, paymentRef) {
        const plan = await this.planRepo.findOne({ where: { id: planId, isActive: true } });
        if (!plan)
            throw new common_1.NotFoundException('Plan introuvable');
        // Cancel any existing active subscription
        await this.subRepo.update({ userId, state: user_subscription_entity_1.SubscriptionState.ACTIVE }, { state: user_subscription_entity_1.SubscriptionState.CANCELLED });
        const now = new Date();
        const expiresAt = new Date(now);
        if (billing === user_subscription_entity_1.SubscriptionBilling.ANNUAL) {
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        }
        else {
            expiresAt.setMonth(expiresAt.getMonth() + 1);
        }
        const sub = this.subRepo.create({
            userId,
            planId,
            billing,
            state: user_subscription_entity_1.SubscriptionState.ACTIVE,
            startsAt: now,
            expiresAt,
            lastResetAt: now,
            paymentRef,
            aiRequestsUsed: 0,
        });
        return this.subRepo.save(sub);
    }
    async cancel(userId) {
        await this.subRepo.update({ userId, state: user_subscription_entity_1.SubscriptionState.ACTIVE }, { state: user_subscription_entity_1.SubscriptionState.CANCELLED });
    }
    async getActiveSub(userId) {
        const sub = await this.subRepo.findOne({
            where: { userId, state: user_subscription_entity_1.SubscriptionState.ACTIVE, expiresAt: (0, typeorm_2.MoreThan)(new Date()) },
            relations: ['plan'],
            order: { createdAt: 'DESC' },
        });
        return sub ?? null;
    }
    // ─── Quota check + consumption ────────────────────────────────────────────
    async checkAiQuota(userId) {
        const sub = await this.getActiveSub(userId);
        // Usage mensuel réel (journal), valable pour abonnés et gratuits
        const used = await this.countMonthlyUsage(userId);
        if (!sub) {
            const freePlan = await this.planRepo.findOne({ where: { name: 'Standard', isActive: true } });
            const limit = freePlan?.aiRequestsPerMonth ?? 5;
            return {
                allowed: limit === 0 || used < limit,
                isPro: false,
                requestsUsed: used,
                requestsLimit: limit,
                plan: freePlan,
            };
        }
        const limit = sub.plan.aiRequestsPerMonth;
        const unlimited = limit === 0;
        return {
            allowed: unlimited || used < limit,
            isPro: true,
            requestsUsed: used,
            requestsLimit: limit,
            plan: sub.plan,
        };
    }
    async consumeAiRequest(userId, service) {
        // Journalise chaque requête facturée (abonnés comme gratuits)
        await this.usageRepo.save(this.usageRepo.create({ userId, service }));
    }
    async assertAiAllowed(userId) {
        const quota = await this.checkAiQuota(userId);
        if (!quota.allowed) {
            throw new common_1.ForbiddenException(`Quota IA dépassé (${quota.requestsUsed}/${quota.requestsLimit} requêtes ce mois). Passez à Pro pour continuer.`);
        }
    }
    // ─── Internal ─────────────────────────────────────────────────────────────
    resetMonthlyQuotaIfNeeded(sub) {
        if (!sub.lastResetAt)
            return;
        const now = new Date();
        const lastReset = new Date(sub.lastResetAt);
        // Reset if we're in a new calendar month since last reset
        if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
            sub.aiRequestsUsed = 0;
            sub.lastResetAt = now;
            // Save happens via consumeAiRequest
        }
    }
    async countFreeMonthlyUsage(_userId) {
        // Free usage is tracked indirectly — for now return 0 (extend with AiUsageLog if needed)
        return 0;
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = SubscriptionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscription_plan_entity_1.SubscriptionPlanEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(user_subscription_entity_1.UserSubscriptionEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(ai_usage_log_entity_1.AiUsageLogEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map