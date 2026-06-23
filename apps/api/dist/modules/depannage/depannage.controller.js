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
exports.DepannageController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const depannage_service_1 = require("./depannage.service");
const artisan_entity_1 = require("../artisans/entities/artisan.entity");
let DepannageController = class DepannageController {
    constructor(service) {
        this.service = service;
    }
    // Étape 1 — Créer la demande (lancement diagnostic IA en arrière-plan)
    create(req, dto) {
        return this.service.create(req.user.sub, dto);
    }
    // Étape 1 — Client confirme le devis IA et ouvre l'appel d'offre
    confirmQuote(id, req, category) {
        return this.service.confirmQuote(id, req.user.sub, category);
    }
    // Étape 3 — Artisan soumet une proposition
    submitProposal(id, req, dto) {
        return this.service.submitProposal(id, req.user.sub, dto.artisanName, dto.priceXof, dto.estimatedDurationMin);
    }
    // Étape 4 — Client choisit un artisan (ouvre le chat)
    selectArtisan(id, req, artisanId) {
        return this.service.selectArtisan(id, req.user.sub, artisanId);
    }
    // Étape 5 — Client choisit le mode d'intervention
    chooseMode(id, req, dto) {
        return this.service.chooseMode(id, req.user.sub, dto.mode, dto.scheduledAt ? new Date(dto.scheduledAt) : undefined);
    }
    // Étape 5 — Artisan confirme l'intervention urgente
    artisanConfirmUrgent(id, req) {
        return this.service.artisanConfirmUrgent(id, req.user.sub);
    }
    // Étape 6a — Accord de prix (calcule montant escrow)
    reachAgreement(id, req) {
        return this.service.reachAgreement(id, req.user.sub);
    }
    // Étape 6b/6c — Client alimente l'escrow (déclenché par webhook paiement)
    fundEscrow(id, req, transactionRef) {
        return this.service.fundEscrow(id, req.user.sub, transactionRef);
    }
    // Étape 6c — Verrouiller l'intervention (fonds confirmés)
    lockIntervention(id, requiredPartIds) {
        return this.service.lockIntervention(id, requiredPartIds);
    }
    // Étape 6 — Artisan complète l'intervention
    completeIntervention(id, req) {
        return this.service.completeIntervention(id, req.user.sub);
    }
    // Étape 6d — Client libère le paiement
    releasePayment(id, req) {
        return this.service.releasePayment(id, req.user.sub);
    }
    // Étape 7 — Marquer les pièces comme envoyées (boutique partenaire)
    dispatchParts(id) {
        return this.service.dispatchParts(id);
    }
    // ─── Lecture ──────────────────────────────────────────────────────────────
    findNearby(category, lat, lng, radius) {
        return this.service.findNearbyArtisans(category, parseFloat(lat), parseFloat(lng), radius ? parseFloat(radius) : 20);
    }
    findMyRequests(req) {
        return this.service.findByClient(req.user.sub);
    }
    findArtisanRequests(req) {
        return this.service.findByArtisan(req.user.sub);
    }
    findOne(id) {
        return this.service.findOne(id);
    }
};
exports.DepannageController = DepannageController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], DepannageController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/confirm-quote'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], DepannageController.prototype, "confirmQuote", null);
__decorate([
    (0, common_1.Post)(':id/proposals'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], DepannageController.prototype, "submitProposal", null);
__decorate([
    (0, common_1.Patch)(':id/select-artisan'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)('artisanId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], DepannageController.prototype, "selectArtisan", null);
__decorate([
    (0, common_1.Patch)(':id/choose-mode'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], DepannageController.prototype, "chooseMode", null);
__decorate([
    (0, common_1.Patch)(':id/artisan-confirm-urgent'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DepannageController.prototype, "artisanConfirmUrgent", null);
__decorate([
    (0, common_1.Patch)(':id/reach-agreement'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DepannageController.prototype, "reachAgreement", null);
__decorate([
    (0, common_1.Patch)(':id/fund-escrow'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)('transactionRef')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], DepannageController.prototype, "fundEscrow", null);
__decorate([
    (0, common_1.Patch)(':id/lock-intervention'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('requiredPartIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", void 0)
], DepannageController.prototype, "lockIntervention", null);
__decorate([
    (0, common_1.Patch)(':id/complete-intervention'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DepannageController.prototype, "completeIntervention", null);
__decorate([
    (0, common_1.Patch)(':id/release-payment'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DepannageController.prototype, "releasePayment", null);
__decorate([
    (0, common_1.Patch)(':id/dispatch-parts'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DepannageController.prototype, "dispatchParts", null);
__decorate([
    (0, common_1.Get)('nearby-artisans'),
    __param(0, (0, common_1.Query)('category')),
    __param(1, (0, common_1.Query)('lat')),
    __param(2, (0, common_1.Query)('lng')),
    __param(3, (0, common_1.Query)('radius')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], DepannageController.prototype, "findNearby", null);
__decorate([
    (0, common_1.Get)('my-requests'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DepannageController.prototype, "findMyRequests", null);
__decorate([
    (0, common_1.Get)('artisan-requests'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DepannageController.prototype, "findArtisanRequests", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DepannageController.prototype, "findOne", null);
exports.DepannageController = DepannageController = __decorate([
    (0, common_1.Controller)('depannage'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [depannage_service_1.DepannageService])
], DepannageController);
//# sourceMappingURL=depannage.controller.js.map