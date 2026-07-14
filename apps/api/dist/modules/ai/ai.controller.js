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
var AiController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("./ai.service");
const decoration_dto_1 = require("./dto/decoration.dto");
const generate_image_dto_1 = require("./dto/generate-image.dto");
const diagnose_dto_1 = require("./dto/diagnose.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let AiController = AiController_1 = class AiController {
    constructor(service) {
        this.service = service;
        this.logger = new common_1.Logger(AiController_1.name);
    }
    visualize(req, dto) {
        return this.service.generateDecorationVisualization(req.user.sub, dto);
    }
    generateImage(req, dto) {
        return this.service.generateImage(req.user.sub, dto.prompt);
    }
    analyzeImage(req, dto) {
        return this.service.analyzeImage(req.user.sub, dto.prompt, dto.imageUrl);
    }
    health() {
        return {
            status: 'ok',
            build: 'v2-pro-activation',
            hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY,
            timestamp: new Date().toISOString(),
        };
    }
    /** Auto-test OpenRouter — renvoie la réponse réelle ou l'erreur exacte. */
    selftest() {
        return this.service.pingOpenRouter();
    }
    /** Auto-test génération d'image. */
    selftestImage() {
        return this.service.pingOpenRouterImage();
    }
    // Rénovation — connexion obligatoire + consomme le quota IA
    renovationQuote(req, dto) {
        return this.service.diagnoseRenovation(req.user.sub, dto.messages, dto.imageUrls ?? [], dto.clientTurns ?? 4);
    }
    // Réparation (dépannage) : connexion requise (portefeuille/paiement) mais
    // SANS quota IA — le diagnostic reste gratuit.
    async diagnose(dto) {
        try {
            return await this.service.diagnose(dto.serviceType, dto.messages, dto.imageUrls ?? [], dto.clientTurns ?? 1);
        }
        catch (err) {
            this.logger.error('[diagnose] Unexpected error:', err);
            const serviceType = dto.serviceType ?? 'DEPANNAGE';
            const priceMap = {
                DEPANNAGE: [15000, 60000],
                RENOVATION: [150000, 800000],
                DECORATION: [80000, 400000],
            };
            const [min, max] = priceMap[serviceType] ?? [15000, 60000];
            return {
                summary: "J'ai bien reçu votre demande. Je prépare une analyse.",
                detectedIssue: `Demande de ${serviceType.toLowerCase()} — analyse en cours`,
                question: "Pour affiner le devis, pouvez-vous préciser l'urgence de votre besoin ?",
                options: ["C'est urgent (< 24h)", "Dans la semaine", "Pas pressé — je planifie"],
                estimatedPriceMinXof: min,
                estimatedPriceMaxXof: max,
            };
        }
    }
    // Route unifiée génération d'image — provider: "flux" | "gpt"
    generateByProvider(req, body) {
        return this.service.generateImageByProvider(req.user.sub, body.prompt);
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
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AiController.prototype, "health", null);
__decorate([
    (0, common_1.Get)('selftest'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AiController.prototype, "selftest", null);
__decorate([
    (0, common_1.Get)('selftest-image'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AiController.prototype, "selftestImage", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('renovation-quote'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, diagnose_dto_1.DiagnoseDto]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "renovationQuote", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('diagnose'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [diagnose_dto_1.DiagnoseDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "diagnose", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('image'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "generateByProvider", null);
exports.AiController = AiController = AiController_1 = __decorate([
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], AiController);
//# sourceMappingURL=ai.controller.js.map