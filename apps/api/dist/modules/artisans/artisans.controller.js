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
    async findOne(id) {
        return this.artisansService.findById(id);
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
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ArtisansController.prototype, "findOne", null);
exports.ArtisansController = ArtisansController = __decorate([
    (0, common_1.Controller)('artisans'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [artisans_service_1.ArtisansService])
], ArtisansController);
//# sourceMappingURL=artisans.controller.js.map