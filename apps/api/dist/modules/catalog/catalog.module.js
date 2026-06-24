"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const catalog_service_1 = require("./catalog.service");
const catalog_controller_1 = require("./catalog.controller");
const product_entity_1 = require("./entities/product.entity");
const product_order_entity_1 = require("./entities/product-order.entity");
const product_orders_service_1 = require("./product-orders.service");
const product_orders_controller_1 = require("./product-orders.controller");
const user_entity_1 = require("../users/entities/user.entity");
const commission_config_entity_1 = require("../admin/entities/commission-config.entity");
let CatalogModule = class CatalogModule {
};
exports.CatalogModule = CatalogModule;
exports.CatalogModule = CatalogModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([product_entity_1.ProductEntity, product_order_entity_1.ProductOrderEntity, user_entity_1.UserEntity, commission_config_entity_1.CommissionConfigEntity])],
        providers: [catalog_service_1.CatalogService, product_orders_service_1.ProductOrdersService],
        controllers: [catalog_controller_1.CatalogController, product_orders_controller_1.ProductOrdersController],
        exports: [catalog_service_1.CatalogService, product_orders_service_1.ProductOrdersService],
    })
], CatalogModule);
//# sourceMappingURL=catalog.module.js.map