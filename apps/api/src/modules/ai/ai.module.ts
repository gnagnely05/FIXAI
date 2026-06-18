import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { DevisProService } from './devis-pro.service';
import { DevisProController } from './devis-pro.controller';
import { CatalogModule } from '../catalog/catalog.module';

@Module({
  imports: [CatalogModule],
  controllers: [AiController, DevisProController],
  providers: [AiService, DevisProService],
  exports: [AiService],
})
export class AiModule {}
