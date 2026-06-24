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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductOrdersController = void 0;
const common_1 = require("@nestjs/common");
const product_orders_service_1 = require("./product-orders.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let ProductOrdersController = class ProductOrdersController {
    constructor(service) {
        this.service = service;
    }
    create(req, dto) {
        return this.service.create(req.user, dto);
    }
    findMine(req) {
        return this.service.findByClient(req.user.sub);
    }
    findShopOrders(req) {
        return this.service.findByMerchant(req.user.sub);
    }
    getShopStats(req) {
        return this.service.getMerchantStats(req.user.sub);
    }
    findOne(id) {
        return this.service.findById(id);
    }
    triggerEscrow(id, req) {
        return this.service.triggerEscrowAndProcess(id, req.user.sub);
    }
    markReady(id, req) {
        return this.service.markReady(id, req.user.sub);
    }
    markDelivered(id, req) {
        return this.service.markDelivered(id, req.user.sub);
    }
    cancel(id, req) {
        return this.service.cancelOrder(id, req.user.sub);
    }
};
exports.ProductOrdersController = ProductOrdersController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ProductOrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('my'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductOrdersController.prototype, "findMine", null);
__decorate([
    (0, common_1.Get)('shop/mine'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductOrdersController.prototype, "findShopOrders", null);
__decorate([
    (0, common_1.Get)('shop/stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductOrdersController.prototype, "getShopStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductOrdersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/trigger-escrow'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProductOrdersController.prototype, "triggerEscrow", null);
__decorate([
    (0, common_1.Patch)(':id/ready'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProductOrdersController.prototype, "markReady", null);
__decorate([
    (0, common_1.Patch)(':id/delivered'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProductOrdersController.prototype, "markDelivered", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProductOrdersController.prototype, "cancel", null);
exports.ProductOrdersController = ProductOrdersController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('product-orders'),
    __metadata("design:paramtypes", [product_orders_service_1.ProductOrdersService])
], ProductOrdersController);
//# sourceMappingURL=product-orders.controller.js.map