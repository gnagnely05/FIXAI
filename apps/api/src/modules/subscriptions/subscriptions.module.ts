import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionPlanEntity } from './entities/subscription-plan.entity';
import { UserSubscriptionEntity } from './entities/user-subscription.entity';
import { AiUsageLogEntity } from './entities/ai-usage-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionPlanEntity, UserSubscriptionEntity, AiUsageLogEntity])],
  providers: [SubscriptionsService],
  controllers: [SubscriptionsController],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
