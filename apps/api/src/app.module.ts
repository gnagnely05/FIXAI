import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ArtisansModule } from './modules/artisans/artisans.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AiModule } from './modules/ai/ai.module';
import { DepannageModule } from './modules/depannage/depannage.module';
import { RenovationModule } from './modules/renovation/renovation.module';
import { AdminModule } from './modules/admin/admin.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { User } from './modules/users/entities/user.entity';
import { Artisan } from './modules/artisans/entities/artisan.entity';
import { OrderEntity } from './modules/orders/entities/order.entity';
import { DepannageRequest } from './modules/depannage/entities/depannage-request.entity';
import { RenovationProject } from './modules/renovation/entities/renovation-project.entity';
import { Payment } from './modules/payments/entities/payment.entity';
import { ProductEntity } from './modules/catalog/entities/product.entity';
import { SubscriptionPlanEntity } from './modules/subscriptions/entities/subscription-plan.entity';
import { UserSubscriptionEntity } from './modules/subscriptions/entities/user-subscription.entity';
import { DocumentEntity } from './modules/documents/entities/document.entity';
import { CommissionConfigEntity } from './modules/admin/entities/commission-config.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', '127.0.0.1'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USER', 'root'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_NAME', 'fixai'),
        entities: [User, Artisan, OrderEntity, DepannageRequest, RenovationProject, Payment, ProductEntity, SubscriptionPlanEntity, UserSubscriptionEntity, DocumentEntity, CommissionConfigEntity],
        synchronize: config.get<string>('NODE_ENV') !== 'production',
        logging: config.get<string>('NODE_ENV') === 'development',
      }),
    }),
    AuthModule,
    UsersModule,
    ArtisansModule,
    OrdersModule,
    PaymentsModule,
    AiModule,
    DepannageModule,
    RenovationModule,
    AdminModule,
    CatalogModule,
    SubscriptionsModule,
  ],
})
export class AppModule {}
