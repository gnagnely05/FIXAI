import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { DevisProService } from './devis-pro.service';
import { DevisProController } from './devis-pro.controller';
import { ReplicateService } from './replicate.service';
import { OpenRouterService } from './openrouter.service';
import { CatalogModule } from '../catalog/catalog.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [CatalogModule, SubscriptionsModule],
  controllers: [AiController, DevisProController],
  providers: [AiService, DevisProService, ReplicateService, OpenRouterService],
  exports: [AiService, DevisProService, ReplicateService, OpenRouterService],
})
export class AiModule {}
