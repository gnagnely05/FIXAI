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
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("./ai.service");
const decoration_dto_1 = require("./dto/decoration.dto");
const generate_image_dto_1 = require("./dto/generate-image.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let AiController = class AiController {
    constructor(service) {
        this.service = service;
    }
    visualize(req, dto) {
        return this.service.generateDecorationVisualization(req.user.sub, dto);
    }
    generateImage(req, dto) {
        return this.service.generateImage(req.user.sub, dto.prompt, dto.imageUrl);
    }
    analyzeImage(req, dto) {
        return this.service.analyzeImage(req.user.sub, dto.prompt, dto.imageUrl);
    }
    // Pas de guard — accessible sans connexion pour le tunnel de devis
    diagnose(body) {
        return this.service.diagnose(body.serviceType, body.messages, body.imageUrls ?? []);
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('decoration/visualize'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, decoration_dto_1.GenerateDecorationDto]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "visualize", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('generate'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, generate_image_dto_1.GenerateImageDto]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "generateImage", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('analyze'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "analyzeImage", null);
__decorate([
    (0, common_1.Post)('diagnose'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "diagnose", null);
exports.AiController = AiController = __decorate([
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], AiController);
//# sourceMappingURL=ai.controller.js.map