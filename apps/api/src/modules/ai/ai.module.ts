import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { DevisProService } from './devis-pro.service';
import { DevisProController } from './devis-pro.controller';
import { ReplicateService } from './replicate.service';
import { GeminiService } from './gemini.service';
import { OpenAiImageService } from './openai-image.service';
import { CatalogModule } from '../catalog/catalog.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [CatalogModule, SubscriptionsModule],
  controllers: [AiController, DevisProController],
  providers: [AiService, DevisProService, ReplicateService, GeminiService, OpenAiImageService],
  exports: [AiService, DevisProService, ReplicateService, GeminiService, OpenAiImageService],
})
export class AiModule {}
