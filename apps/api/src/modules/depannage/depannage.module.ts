import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepannageRequest } from './entities/depannage-request.entity';
import { DepannageService } from './depannage.service';
import { DepannageController } from './depannage.controller';
import { Artisan } from '../artisans/entities/artisan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DepannageRequest, Artisan])],
  controllers: [DepannageController],
  providers: [DepannageService],
  exports: [DepannageService],
})
export class DepannageModule {}
