import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtisansService } from './artisans.service';
import { ArtisansController } from './artisans.controller';
import { ArtisanEntity } from './entities/artisan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ArtisanEntity])],
  providers: [ArtisansService],
  controllers: [ArtisansController],
  exports: [ArtisansService],
})
export class ArtisansModule {}
