import {
  Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, MoreThanOrEqual } from 'typeorm';
import { SubscriptionPlanEntity } from './entities/subscription-plan.entity';
import {
  UserSubscriptionEntity,
  SubscriptionBilling,
  SubscriptionState,
} from './entities/user-subscription.entity';
import { AiUsageLogEntity } from './entities/ai-usage-log.entity';

export interface AiQuotaCheck {
  allowed: boolean;
  isPro: boolean;
  requestsUsed: number;
  requestsLimit: number;
  plan: SubscriptionPlanEntity | null;
}

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    @InjectRepository(SubscriptionPlanEntity)
    private readonly planRepo: Repository<SubscriptionPlanEntity>,
    @InjectRepository(UserSubscriptionEntity)
    private readonly subRepo: Repository<UserSubscriptionEntity>,
    @InjectRepository(AiUsageLogEntity)
    private readonly usageRepo: Repository<AiUsageLogEntity>,
  ) {}

  /** Nombre de requêtes IA consommées par l'utilisateur depuis le début du mois. */
  private async countMonthlyUsage(userId: string): Promise<number> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return this.usageRepo.count({ where: { userId, createdAt: MoreThanOrEqual(monthStart) } });
  }

  // ─── Plans (admin) ────────────────────────────────────────────────────────

  async createPlan(dto: Partial<SubscriptionPlanEntity>): Promise<SubscriptionPlanEntity> {
    return this.planRepo.save(this.planRepo.create(dto));
  }

  async updatePlan(id: string, dto: Partial<SubscriptionPlanEntity>): Promise<SubscriptionPlanEntity> {
    await this.planRepo.update(id, dto);
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Plan introuvable');
    return plan;
  }

  async listPlans(): Promise<SubscriptionPlanEntity[]> {
    return this.planRepo.find({ where: { isActive: true }, order: { priceMonthlyXof: 'ASC' } });
  }

  // ─── Subscriptions ────────────────────────────────────────────────────────

  async subscribe(
    userId: string,
    planId: string,
    billing: SubscriptionBilling,
    paymentRef: string,
  ): Promise<UserSubscriptionEntity> {
    const plan = await this.planRepo.findOne({ where: { id: planId, isActive: true } });
    if (!plan) throw new NotFoundException('Plan introuvable');

    // Cancel any existing active subscription
    await this.subRepo.update(
      { userId, state: SubscriptionState.ACTIVE },
      { state: SubscriptionState.CANCELLED },
    );

    const now = new Date();
    const expiresAt = new Date(now);
    if (billing === SubscriptionBilling.ANNUAL) {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    const sub = this.subRepo.create({
      userId,
      planId,
      billing,
      state: SubscriptionState.ACTIVE,
      startsAt: now,
      expiresAt,
      lastResetAt: now,
      paymentRef,
      aiRequestsUsed: 0,
    });
    return this.subRepo.save(sub);
  }

  async cancel(userId: string): Promise<void> {
    await this.subRepo.update(
      { userId, state: SubscriptionState.ACTIVE },
      { state: SubscriptionState.CANCELLED },
    );
  }

  async getActiveSub(userId: string): Promise<UserSubscriptionEntity | null> {
    const sub = await this.subRepo.findOne({
      where: { userId, state: SubscriptionState.ACTIVE, expiresAt: MoreThan(new Date()) },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });
    return sub ?? null;
  }

  // ─── Quota check + consumption ────────────────────────────────────────────

  async checkAiQuota(userId: string): Promise<AiQuotaCheck> {
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

  async consumeAiRequest(userId: string, service?: string): Promise<void> {
    // Journalise chaque requête facturée (abonnés comme gratuits)
    await this.usageRepo.save(this.usageRepo.create({ userId, service }));
  }

  async assertAiAllowed(userId: string): Promise<void> {
    const quota = await this.checkAiQuota(userId);
    if (!quota.allowed) {
      throw new ForbiddenException(
        `Quota IA dépassé (${quota.requestsUsed}/${quota.requestsLimit} requêtes ce mois). Passez à Pro pour continuer.`,
      );
    }
  }

  // ─── Internal ─────────────────────────────────────────────────────────────

  private resetMonthlyQuotaIfNeeded(sub: UserSubscriptionEntity): void {
    if (!sub.lastResetAt) return;
    const now = new Date();
    const lastReset = new Date(sub.lastResetAt);
    // Reset if we're in a new calendar month since last reset
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      sub.aiRequestsUsed = 0;
      sub.lastResetAt = now;
      // Save happens via consumeAiRequest
    }
  }

  private async countFreeMonthlyUsage(_userId: string): Promise<number> {
    // Free usage is tracked indirectly — for now return 0 (extend with AiUsageLog if needed)
    return 0;
  }
}
