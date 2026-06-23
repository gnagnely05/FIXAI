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
exports.DevisProController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const devis_pro_service_1 = require("./devis-pro.service");
let DevisProController = class DevisProController {
    constructor(service) {
        this.service = service;
    }
    analyze(req, dto) {
        if (!dto.files?.length || dto.files.length > 3) {
            throw new common_1.BadRequestException('Fournissez 1 à 3 images de devis');
        }
        const files = dto.files.map(f => ({
            base64: f.base64,
            mimeType: f.mimeType,
            name: f.name,
        }));
        return this.service.analyzeQuoteFiles(req.user.sub, files);
    }
};
exports.DevisProController = DevisProController;
__decorate([
    (0, common_1.Post)('analyze'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], DevisProController.prototype, "analyze", null);
exports.DevisProController = DevisProController = __decorate([
    (0, common_1.Controller)('devis-pro'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [devis_pro_service_1.DevisProService])
], DevisProController);
//# sourceMappingURL=devis-pro.controller.js.map