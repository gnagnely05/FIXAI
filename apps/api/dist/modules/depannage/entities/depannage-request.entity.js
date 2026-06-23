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
exports.DepannageRequest = exports.DepannageRequestEntity = exports.DepannageStatus = exports.DepannageMode = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const artisan_entity_1 = require("../../artisans/entities/artisan.entity");
const order_entity_1 = require("../../orders/entities/order.entity");
var DepannageMode;
(function (DepannageMode) {
    DepannageMode["URGENT"] = "URGENT";
    DepannageMode["PLANNED"] = "PLANNED";
})(DepannageMode || (exports.DepannageMode = DepannageMode = {}));
/**
 * Statuts techniques complets selon le flux fonctionnel fixAI.
 * Chaque valeur correspond à un état précis du parcours client → artisan → paiement.
 */
var DepannageStatus;
(function (DepannageStatus) {
    // Étape 1 — Diagnostic IA
    DepannageStatus["DIAGNOSIS_PENDING"] = "DIAGNOSIS_PENDING";
    DepannageStatus["DIAGNOSIS_DONE"] = "DIAGNOSIS_DONE";
    DepannageStatus["QUOTE_CONFIRMED"] = "QUOTE_CONFIRMED";
    // Étape 2 — Appel d'offre
    DepannageStatus["TENDER_OPEN"] = "TENDER_OPEN";
    // Étape 3 — Réponses artisans
    DepannageStatus["PROPOSAL_SUBMITTED"] = "PROPOSAL_SUBMITTED";
    DepannageStatus["PROPOSALS_RECEIVED"] = "PROPOSALS_RECEIVED";
    // Étape 4 — Sélection & mise en relation
    DepannageStatus["CHAT_OPEN"] = "CHAT_OPEN";
    // Étape 5 — Planification
    DepannageStatus["URGENT_PENDING"] = "URGENT_PENDING";
    DepannageStatus["URGENT_CONFIRMED"] = "URGENT_CONFIRMED";
    DepannageStatus["SCHEDULED_CONFIRMED"] = "SCHEDULED_CONFIRMED";
    // Étape 6 — Paiement escrow
    DepannageStatus["AGREEMENT_REACHED"] = "AGREEMENT_REACHED";
    DepannageStatus["PAYMENT_PENDING"] = "PAYMENT_PENDING";
    DepannageStatus["ACCOUNT_TOPPED_UP"] = "ACCOUNT_TOPPED_UP";
    DepannageStatus["FUNDS_HELD"] = "FUNDS_HELD";
    DepannageStatus["INTERVENTION_LOCKED"] = "INTERVENTION_LOCKED";
    DepannageStatus["INTERVENTION_COMPLETED"] = "INTERVENTION_COMPLETED";
    DepannageStatus["PAYMENT_RELEASED"] = "PAYMENT_RELEASED";
    // Étape 7 — Pièces boutique
    DepannageStatus["PARTS_REQUESTED"] = "PARTS_REQUESTED";
    DepannageStatus["PARTS_DISPATCHED"] = "PARTS_DISPATCHED";
    // Terminaux
    DepannageStatus["CANCELLED"] = "CANCELLED";
    DepannageStatus["DISPUTED"] = "DISPUTED";
})(DepannageStatus || (exports.DepannageStatus = DepannageStatus = {}));
let DepannageRequestEntity = class DepannageRequestEntity {
};
exports.DepannageRequestEntity = DepannageRequestEntity;
exports.DepannageRequest = DepannageRequestEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DepannageRequestEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DepannageRequestEntity.prototype, "clientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DepannageRequestEntity.prototype, "artisanId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], DepannageRequestEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], DepannageRequestEntity.prototype, "photoUrls", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: artisan_entity_1.ArtisanSpecialty, nullable: true }),
    __metadata("design:type", String)
], DepannageRequestEntity.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: DepannageMode, nullable: true }),
    __metadata("design:type", String)
], DepannageRequestEntity.prototype, "mode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: DepannageStatus, default: DepannageStatus.DIAGNOSIS_PENDING }),
    __metadata("design:type", String)
], DepannageRequestEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], DepannageRequestEntity.prototype, "scheduledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DepannageRequestEntity.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DepannageRequestEntity.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 9, scale: 6, nullable: true }),
    __metadata("design:type", Number)
], DepannageRequestEntity.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 9, scale: 6, nullable: true }),
    __metadata("design:type", Number)
], DepannageRequestEntity.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], DepannageRequestEntity.prototype, "diagnosisReport", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', default: [] }),
    __metadata("design:type", Array)
], DepannageRequestEntity.prototype, "proposals", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', default: 0 }),
    __metadata("design:type", Number)
], DepannageRequestEntity.prototype, "agreedPriceXof", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', default: 0 }),
    __metadata("design:type", Number)
], DepannageRequestEntity.prototype, "urgencyFeeXof", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', default: 0 }),
    __metadata("design:type", Number)
], DepannageRequestEntity.prototype, "escrowAmountXof", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: order_entity_1.EscrowStatus, default: order_entity_1.EscrowStatus.NOT_FUNDED }),
    __metadata("design:type", String)
], DepannageRequestEntity.prototype, "escrowStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], DepannageRequestEntity.prototype, "requiredPartIds", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'clientId' }),
    __metadata("design:type", user_entity_1.UserEntity)
], DepannageRequestEntity.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => artisan_entity_1.ArtisanEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'artisanId' }),
    __metadata("design:type", artisan_entity_1.ArtisanEntity)
], DepannageRequestEntity.prototype, "artisan", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DepannageRequestEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], DepannageRequestEntity.prototype, "updatedAt", void 0);
exports.DepannageRequest = exports.DepannageRequestEntity = DepannageRequestEntity = __decorate([
    (0, typeorm_1.Entity)('depannage_requests')
], DepannageRequestEntity);
//# sourceMappingURL=depannage-request.entity.js.map