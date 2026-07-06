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
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let OrdersController = class OrdersController {
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async create(req, body) {
        return this.ordersService.create(req.user, body);
    }
    /** Le client réserve un diagnostic sur place (problème complexe). */
    async createDiagnostic(req, body) {
        return this.ordersService.createDiagnostic(req.user, body);
    }
    /** Missions de diagnostic ouvertes, visibles par les artisans. */
    async availableDiagnostics(city) {
        return this.ordersService.findAvailableDiagnostics(city);
    }
    /** Un artisan accepte une mission de diagnostic. */
    async acceptDiagnostic(id, req) {
        return this.ordersService.acceptDiagnostic(id, req.user.sub);
    }
    async getMyOrders(req) {
        const { sub, role } = req.user;
        if (role === 'ARTISAN')
            return this.ordersService.findByArtisanUserId(sub);
        if (role === 'AGENCE_HOTE' || role === 'ENTREPRISE_BTP')
            return this.ordersService.findByAgency(sub);
        return this.ordersService.findByClient(sub);
    }
    /** Litiges dont l'agence/BTP connectée est gestionnaire */
    async getMyDisputes(req) {
        return this.ordersService.findDisputesByHandler(req.user.sub);
    }
    async findOne(id) {
        return this.ordersService.findById(id);
    }
    /**
     * Règle 3 : AGENCE_HOTE bloquée — ForbiddenException renvoyée par le service.
     * Seuls ARTISAN et ENTREPRISE_BTP peuvent confirmer.
     */
    async confirm(id, req) {
        return this.ordersService.confirm(id, req.user.sub, req.user.role);
    }
    async complete(id, req) {
        return this.ordersService.complete(id, req.user.sub);
    }
    async cancel(id, req) {
        return this.ordersService.cancel(id, req.user.sub);
    }
    async updateStatus(id, body, req) {
        return this.ordersService.updateStatus(id, body.status, req.user.sub);
    }
    /**
     * Règle 3 : AGENCE_HOTE → assigne sans confirmer (artisan doit confirmer ensuite).
     * ENTREPRISE_BTP → assigne + confirme directement.
     */
    async assign(id, body, req) {
        return this.ordersService.assignArtisan(id, body.artisanId, req.user.sub, req.user.role);
    }
    /** Règle 2 : ouverture d'un litige — auto-assignation du gestionnaire */
    async openDispute(id, body, req) {
        return this.ordersService.openDispute(id, req.user.sub, body.reason);
    }
    /** Règle 2 : résolution d'un litige par l'agence/BTP ou l'admin */
    async resolveDispute(id, body, req) {
        return this.ordersService.resolveDispute(id, req.user.sub, req.user.role, body.outcome, body.resolution);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('diagnostic'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "createDiagnostic", null);
__decorate([
    (0, common_1.Get)('diagnostics/available'),
    __param(0, (0, common_1.Query)('city')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "availableDiagnostics", null);
__decorate([
    (0, common_1.Patch)(':id/accept-diagnostic'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "acceptDiagnostic", null);
__decorate([
    (0, common_1.Get)('my'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getMyOrders", null);
__decorate([
    (0, common_1.Get)('disputes/mine'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getMyDisputes", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/confirm'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "confirm", null);
__decorate([
    (0, common_1.Patch)(':id/complete'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "complete", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "cancel", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/assign'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "assign", null);
__decorate([
    (0, common_1.Patch)(':id/dispute'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "openDispute", null);
__decorate([
    (0, common_1.Patch)(':id/resolve-dispute'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "resolveDispute", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.Controller)('orders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map