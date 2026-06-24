import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';
import { ProductEntity } from './entities/product.entity';
import { ProductOrderEntity } from './entities/product-order.entity';
import { ProductOrdersService } from './product-orders.service';
import { ProductOrdersController } from './product-orders.controller';
import { UserEntity } from '../users/entities/user.entity';
import { CommissionConfigEntity } from '../admin/entities/commission-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, ProductOrderEntity, UserEntity, CommissionConfigEntity])],
  providers: [CatalogService, ProductOrdersService],
  controllers: [CatalogController, ProductOrdersController],
  exports: [CatalogService, ProductOrdersService],
})
export class CatalogModule {}
