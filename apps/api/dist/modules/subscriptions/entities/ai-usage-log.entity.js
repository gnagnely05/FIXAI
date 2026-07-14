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
exports.AiUsageLogEntity = void 0;
const typeorm_1 = require("typeorm");
/**
 * Journal d'usage IA — une ligne par requête IA facturée au quota
 * (Décoration, Rénovation, Devis Pro). Permet de compter la consommation
 * mensuelle réelle, y compris pour les utilisateurs sans abonnement.
 */
let AiUsageLogEntity = class AiUsageLogEntity {
};
exports.AiUsageLogEntity = AiUsageLogEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AiUsageLogEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AiUsageLogEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AiUsageLogEntity.prototype, "service", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AiUsageLogEntity.prototype, "createdAt", void 0);
exports.AiUsageLogEntity = AiUsageLogEntity = __decorate([
    (0, typeorm_1.Entity)('ai_usage_logs')
], AiUsageLogEntity);
//# sourceMappingURL=ai-usage-log.entity.js.map