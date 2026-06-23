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
exports.RenovationController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const renovation_service_1 = require("./renovation.service");
let RenovationController = class RenovationController {
    constructor(service) {
        this.service = service;
    }
    // Étape 1 — Créer le projet (lance le diagnostic IA en arrière-plan)
    create(req, dto) {
        return this.service.create(req.user.sub, dto);
    }
    // Étape 1 — Client valide le diagnostic → ouvre l'appel d'offre
    confirmDiagnosis(id, req) {
        return this.service.confirmDiagnosis(id, req.user.sub);
    }
    // Étape 3 — Entreprise soumet une proposition
    submitProposal(id, req, dto) {
        return this.service.submitProposal(id, req.user.sub, dto.companyName, dto.totalPriceXof, dto.durationDays, dto.notes);
    }
    // Étape 4 — Client choisit une entreprise (ouvre le chat)
    selectCompany(id, req, companyId) {
        return this.service.selectCompany(id, req.user.sub, companyId);
    }
    // Étape 5 — Finalisation devis + jalons
    finalizeQuote(id, req, dto) {
        return this.service.finalizeQuote(id, req.user.sub, dto.milestones);
    }
    // Étape 6 — Client alimente l'escrow
    fundEscrow(id, req, dto) {
        return this.service.fundEscrow(id, req.user.sub, dto.amountXof, dto.transactionRef);
    }
    // Étape 6 — Entreprise démarre le chantier
    startProject(id, req) {
        return this.service.startProject(id, req.user.sub);
    }
    // Étape 6 — Entreprise complète un jalon
    completeMilestone(id, milestoneId, req, dto) {
        return this.service.completeMilestone(id, req.user.sub, milestoneId, dto.progressPhotoUrls);
    }
    // Étape 6 — Client libère le paiement du jalon
    releaseMilestonePayment(id, milestoneId, req) {
        return this.service.releaseMilestonePayment(id, req.user.sub, milestoneId);
    }
    addProgressPhoto(id, photoUrl) {
        return this.service.addProgressPhoto(id, photoUrl);
    }
    cancel(id, req) {
        return this.service.cancel(id, req.user.sub);
    }
    findMyProjects(req) {
        return this.service.findByClient(req.user.sub);
    }
    findOne(id) {
        return this.service.findOne(id);
    }
};
exports.RenovationController = RenovationController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], RenovationController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/confirm-diagnosis'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RenovationController.prototype, "confirmDiagnosis", null);
__decorate([
    (0, common_1.Post)(':id/proposals'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], RenovationController.prototype, "submitProposal", null);
__decorate([
    (0, common_1.Patch)(':id/select-company'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], RenovationController.prototype, "selectCompany", null);
__decorate([
    (0, common_1.Patch)(':id/finalize-quote'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], RenovationController.prototype, "finalizeQuote", null);
__decorate([
    (0, common_1.Patch)(':id/fund-escrow'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], RenovationController.prototype, "fundEscrow", null);
__decorate([
    (0, common_1.Patch)(':id/start'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RenovationController.prototype, "startProject", null);
__decorate([
    (0, common_1.Patch)(':id/milestones/:milestoneId/complete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('milestoneId')),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], RenovationController.prototype, "completeMilestone", null);
__decorate([
    (0, common_1.Patch)(':id/milestones/:milestoneId/release'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('milestoneId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], RenovationController.prototype, "releaseMilestonePayment", null);
__decorate([
    (0, common_1.Post)(':id/progress-photos'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('photoUrl')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RenovationController.prototype, "addProgressPhoto", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RenovationController.prototype, "cancel", null);
__decorate([
    (0, common_1.Get)('my-projects'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RenovationController.prototype, "findMyProjects", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RenovationController.prototype, "findOne", null);
exports.RenovationController = RenovationController = __decorate([
    (0, common_1.Controller)('renovation'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [renovation_service_1.RenovationService])
], RenovationController);
//# sourceMappingURL=renovation.controller.js.map