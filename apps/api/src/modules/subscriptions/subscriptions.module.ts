import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionPlanEntity } from './entities/subscription-plan.entity';
import { UserSubscriptionEntity } from './entities/user-subscription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionPlanEntity, UserSubscriptionEntity])],
  providers: [SubscriptionsService],
  controllers: [SubscriptionsController],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
