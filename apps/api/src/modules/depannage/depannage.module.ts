import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepannageService } from './depannage.service';
import { DepannageController } from './depannage.controller';
import { DepannageRequestEntity } from './entities/depannage-request.entity';
import { ArtisanEntity } from '../artisans/entities/artisan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DepannageRequestEntity, ArtisanEntity])],
  providers: [DepannageService],
  controllers: [DepannageController],
  exports: [DepannageService],
})
export class DepannageModule {}
