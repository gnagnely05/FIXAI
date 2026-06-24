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
exports.ArtisansController = void 0;
const common_1 = require("@nestjs/common");
const artisans_service_1 = require("./artisans.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const artisan_entity_1 = require("./entities/artisan.entity");
let ArtisansController = class ArtisansController {
    constructor(artisansService) {
        this.artisansService = artisansService;
    }
    async findAll(specialty, city, minRating, maxHourlyRate, isAvailable, isVerified, page = 1, limit = 20) {
        const query = { specialty, city, minRating, maxHourlyRate, isAvailable, isVerified, page, limit };
        return this.artisansService.findAll(query);
    }
    /** Artisans affiliés à l'agence/BTP connectée */
    async getMyAgencyArtisans(req) {
        return this.artisansService.findByAgency(req.user.sub);
    }
    async getMyAvailability(req) {
        return this.artisansService.getAvailability(req.user.sub);
    }
    async updateMyAvailability(req, body) {
        return this.artisansService.updateAvailabilityByUser(req.user.sub, body);
    }
    async findOne(id) {
        return this.artisansService.findById(id);
    }
    // ─── Règle 1 : agence/BTP gère ses artisans affiliés ────────────────
    /** Valide un artisan affilié (AGENCE_HOTE, ENTREPRISE_BTP ou ADMIN) */
    async validateArtisan(id, req) {
        return this.artisansService.validateAffiliatedArtisan(id, req.user.sub, req.user.role);
    }
    /** Suspend un artisan affilié */
    async suspendArtisan(id, body, req) {
        return this.artisansService.suspendAffiliatedArtisan(id, req.user.sub, req.user.role, body.reason);
    }
    /** Désaffilie (retire) un artisan de l'organisation */
    async removeFromAgency(id, req) {
        return this.artisansService.removeFromAgency(id, req.user.sub, req.user.role);
    }
};
exports.ArtisansController = ArtisansController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('specialty')),
    __param(1, (0, common_1.Query)('city')),
    __param(2, (0, common_1.Query)('minRating')),
    __param(3, (0, common_1.Query)('maxHourlyRate')),
    __param(4, (0, common_1.Query)('isAvailable')),
    __param(5, (0, common_1.Query)('isVerified')),
    __param(6, (0, common_1.Query)('page')),
    __param(7, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number, Boolean, Boolean, Object, Object]),
    __metadata("design:returntype", Promise)
], ArtisansController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my-agency'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ArtisansController.prototype, "getMyAgencyArtisans", null);
__decorate([
    (0, common_1.Get)('availability/me'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ArtisansController.prototype, "getMyAvailability", null);
__decorate([
    (0, common_1.Patch)('availability/me'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ArtisansController.prototype, "updateMyAvailability", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ArtisansController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/validate'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ArtisansController.prototype, "validateArtisan", null);
__decorate([
    (0, common_1.Patch)(':id/suspend'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ArtisansController.prototype, "suspendArtisan", null);
__decorate([
    (0, common_1.Delete)(':id/affiliate'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ArtisansController.prototype, "removeFromAgency", null);
exports.ArtisansController = ArtisansController = __decorate([
    (0, common_1.Controller)('artisans'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [artisans_service_1.ArtisansService])
], ArtisansController);
//# sourceMappingURL=artisans.controller.js.map