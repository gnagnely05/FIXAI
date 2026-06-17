import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrderEntity } from './entities/order.entity';
import { ArtisanEntity } from '../artisans/entities/artisan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, ArtisanEntity])],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
