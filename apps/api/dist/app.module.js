"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const artisans_module_1 = require("./modules/artisans/artisans.module");
const orders_module_1 = require("./modules/orders/orders.module");
const payments_module_1 = require("./modules/payments/payments.module");
const ai_module_1 = require("./modules/ai/ai.module");
const depannage_module_1 = require("./modules/depannage/depannage.module");
const renovation_module_1 = require("./modules/renovation/renovation.module");
const admin_module_1 = require("./modules/admin/admin.module");
const catalog_module_1 = require("./modules/catalog/catalog.module");
const subscriptions_module_1 = require("./modules/subscriptions/subscriptions.module");
const user_entity_1 = require("./modules/users/entities/user.entity");
const artisan_entity_1 = require("./modules/artisans/entities/artisan.entity");
const order_entity_1 = require("./modules/orders/entities/order.entity");
const depannage_request_entity_1 = require("./modules/depannage/entities/depannage-request.entity");
const renovation_project_entity_1 = require("./modules/renovation/entities/renovation-project.entity");
const payment_entity_1 = require("./modules/payments/entities/payment.entity");
const product_entity_1 = require("./modules/catalog/entities/product.entity");
const product_order_entity_1 = require("./modules/catalog/entities/product-order.entity");
const subscription_plan_entity_1 = require("./modules/subscriptions/entities/subscription-plan.entity");
const user_subscription_entity_1 = require("./modules/subscriptions/entities/user-subscription.entity");
const document_entity_1 = require("./modules/documents/entities/document.entity");
const commission_config_entity_1 = require("./modules/admin/entities/commission-config.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
            // Sert l'app Expo web sur / — les routes /api/* restent NestJS
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', '..', '..', 'apps', 'mobile', 'dist'),
                exclude: ['/api/(.*)'],
                serveStaticOptions: { index: false },
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'mysql',
                    host: config.get('DB_HOST', '127.0.0.1'),
                    port: config.get('DB_PORT', 3306),
                    username: config.get('DB_USER', 'root'),
                    password: config.get('DB_PASSWORD', ''),
                    database: config.get('DB_NAME', 'fixai'),
                    entities: [
                        user_entity_1.User, artisan_entity_1.Artisan, order_entity_1.OrderEntity, depannage_request_entity_1.DepannageRequest, renovation_project_entity_1.RenovationProject,
                        payment_entity_1.Payment, product_entity_1.ProductEntity, product_order_entity_1.ProductOrderEntity, subscription_plan_entity_1.SubscriptionPlanEntity,
                        user_subscription_entity_1.UserSubscriptionEntity, document_entity_1.DocumentEntity, commission_config_entity_1.CommissionConfigEntity,
                    ],
                    synchronize: config.get('NODE_ENV') !== 'production',
                    logging: config.get('NODE_ENV') === 'development',
                }),
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            artisans_module_1.ArtisansModule,
            orders_module_1.OrdersModule,
            payments_module_1.PaymentsModule,
            ai_module_1.AiModule,
            depannage_module_1.DepannageModule,
            renovation_module_1.RenovationModule,
            admin_module_1.AdminModule,
            catalog_module_1.CatalogModule,
            subscriptions_module_1.SubscriptionsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map