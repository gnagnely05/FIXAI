"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductOrderEntity = exports.ProductOrderStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const product_entity_1 = require("./product.entity");
var ProductOrderStatus;
(function (ProductOrderStatus) {
    /** Wallet client insuffisant — commande en attente de provisionnement */
    ProductOrderStatus["PENDING_PROVISIONING"] = "PENDING_PROVISIONING";
    /** Wallet provisionné, en attente de validation artisan/devis */
    ProductOrderStatus["PENDING_ARTISAN"] = "PENDING_ARTISAN";
    /** Fonds bloqués en escrow, commande transmise à la boutique */
    ProductOrderStatus["PROCESSING"] = "PROCESSING";
    /** Boutique a préparé la commande — prête au retrait/livraison */
    ProductOrderStatus["READY"] = "READY";
    /** Commande livrée/remise, escrow libéré */
    ProductOrderStatus["DELIVERED"] = "DELIVERED";
    /** Annulée — escrow remboursé si provisionné */
    ProductOrderStatus["CANCELLED"] = "CANCELLED";
})(ProductOrderStatus || (exports.ProductOrderStatus = ProductOrderStatus = {}));
let ProductOrderEntity = class ProductOrderEntity {
};
exports.ProductOrderEntity = ProductOrderEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ProductOrderEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", user_entity_1.UserEntity)
], ProductOrderEntity.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProductOrderEntity.prototype, "linkedServiceOrderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProductOrderEntity.prototype, "linkedDevisProId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProductOrderEntity.prototype, "merchantId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProductOrderEntity.prototype, "merchantName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: product_entity_1.MerchantType }),
    __metadata("design:type", String)
], ProductOrderEntity.prototype, "merchantType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    __metadata("design:type", Array)
], ProductOrderEntity.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ProductOrderEntity.prototype, "totalAmountXof", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', default: 0 }),
    __metadata("design:type", Number)
], ProductOrderEntity.prototype, "commissionAmountXof", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', default: 0 }),
    __metadata("design:type", Number)
], ProductOrderEntity.prototype, "netAmountXof", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ProductOrderStatus, default: ProductOrderStatus.PENDING_PROVISIONING }),
    __metadata("design:type", String)
], ProductOrderEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ProductOrderEntity.prototype, "escrowLocked", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ProductOrderEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ProductOrderEntity.prototype, "deliveredAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ProductOrderEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ProductOrderEntity.prototype, "updatedAt", void 0);
exports.ProductOrderEntity = ProductOrderEntity = __decorate([
    (0, typeorm_1.Entity)('product_orders')
], ProductOrderEntity);
//# sourceMappingURL=product-order.entity.js.map