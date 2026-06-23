import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UserEntity } from '../users/entities/user.entity';
import { ArtisanEntity } from '../artisans/entities/artisan.entity';
import { OrderEntity } from '../orders/entities/order.entity';
import { DocumentEntity } from '../documents/entities/document.entity';
import { CommissionConfigEntity } from './entities/commission-config.entity';
import { ProductEntity } from '../catalog/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, ArtisanEntity, OrderEntity, DocumentEntity, CommissionConfigEntity, ProductEntity]),
  ],
  providers: [AdminService],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}
