import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UserEntity } from '../users/entities/user.entity';
import { ArtisanEntity } from '../artisans/entities/artisan.entity';
import { OrderEntity } from '../orders/entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, ArtisanEntity, OrderEntity])],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
