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
exports.RenovationProject = exports.RenovationProjectEntity = exports.RenovationStatus = exports.ProjectType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const order_entity_1 = require("../../orders/entities/order.entity");
var ProjectType;
(function (ProjectType) {
    ProjectType["CONSTRUCTION"] = "CONSTRUCTION";
    ProjectType["RENOVATION"] = "RENOVATION";
    ProjectType["EXTENSION"] = "EXTENSION";
    ProjectType["FINISHING"] = "FINISHING";
    ProjectType["COMBINED"] = "COMBINED";
})(ProjectType || (exports.ProjectType = ProjectType = {}));
/**
 * Flux fonctionnel Rénovation (BTP) :
 * Diagnostic IA → Appel d'offre → Propositions entreprises → Chat → Jalons → Escrow → Livraison
 */
var RenovationStatus;
(function (RenovationStatus) {
    // Étape 1 — Diagnostic IA
    RenovationStatus["DIAGNOSIS_PENDING"] = "DIAGNOSIS_PENDING";
    RenovationStatus["DIAGNOSIS_DONE"] = "DIAGNOSIS_DONE";
    RenovationStatus["QUOTE_CONFIRMED"] = "QUOTE_CONFIRMED";
    // Étape 2 — Appel d'offre entreprises
    RenovationStatus["TENDER_OPEN"] = "TENDER_OPEN";
    // Étape 3 — Réponses entreprises
    RenovationStatus["PROPOSAL_SUBMITTED"] = "PROPOSAL_SUBMITTED";
    RenovationStatus["PROPOSALS_RECEIVED"] = "PROPOSALS_RECEIVED";
    // Étape 4 — Sélection & mise en relation
    RenovationStatus["CHAT_OPEN"] = "CHAT_OPEN";
    // Étape 5 — Validation devis final & jalons
    RenovationStatus["QUOTE_FINALIZED"] = "QUOTE_FINALIZED";
    RenovationStatus["MILESTONES_AGREED"] = "MILESTONES_AGREED";
    // Étape 6 — Escrow par jalon
    RenovationStatus["PAYMENT_PENDING"] = "PAYMENT_PENDING";
    RenovationStatus["FUNDS_HELD"] = "FUNDS_HELD";
    RenovationStatus["IN_PROGRESS"] = "IN_PROGRESS";
    RenovationStatus["MILESTONE_COMPLETED"] = "MILESTONE_COMPLETED";
    RenovationStatus["MILESTONE_RELEASED"] = "MILESTONE_RELEASED";
    // Terminaux
    RenovationStatus["COMPLETED"] = "COMPLETED";
    RenovationStatus["CANCELLED"] = "CANCELLED";
    RenovationStatus["DISPUTED"] = "DISPUTED";
})(RenovationStatus || (exports.RenovationStatus = RenovationStatus = {}));
let RenovationProjectEntity = class RenovationProjectEntity {
};
exports.RenovationProjectEntity = RenovationProjectEntity;
exports.RenovationProject = RenovationProjectEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RenovationProjectEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RenovationProjectEntity.prototype, "clientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RenovationProjectEntity.prototype, "companyId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RenovationProjectEntity.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], RenovationProjectEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ProjectType }),
    __metadata("design:type", String)
], RenovationProjectEntity.prototype, "projectType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RenovationProjectEntity.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RenovationProjectEntity.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 9, scale: 6, nullable: true }),
    __metadata("design:type", Number)
], RenovationProjectEntity.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 9, scale: 6, nullable: true }),
    __metadata("design:type", Number)
], RenovationProjectEntity.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], RenovationProjectEntity.prototype, "photoUrls", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: RenovationStatus, default: RenovationStatus.DIAGNOSIS_PENDING }),
    __metadata("design:type", String)
], RenovationProjectEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], RenovationProjectEntity.prototype, "diagnosisReport", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', default: [] }),
    __metadata("design:type", Array)
], RenovationProjectEntity.prototype, "proposals", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', default: 0 }),
    __metadata("design:type", Number)
], RenovationProjectEntity.prototype, "budgetXof", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', default: 0 }),
    __metadata("design:type", Number)
], RenovationProjectEntity.prototype, "agreedPriceXof", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', default: [] }),
    __metadata("design:type", Array)
], RenovationProjectEntity.prototype, "milestones", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', default: 0 }),
    __metadata("design:type", Number)
], RenovationProjectEntity.prototype, "escrowAmountXof", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: order_entity_1.EscrowStatus, default: order_entity_1.EscrowStatus.NOT_FUNDED }),
    __metadata("design:type", String)
], RenovationProjectEntity.prototype, "escrowStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], RenovationProjectEntity.prototype, "progressPhotos", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], RenovationProjectEntity.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], RenovationProjectEntity.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity),
    (0, typeorm_1.JoinColumn)({ name: 'clientId' }),
    __metadata("design:type", user_entity_1.UserEntity)
], RenovationProjectEntity.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RenovationProjectEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], RenovationProjectEntity.prototype, "updatedAt", void 0);
exports.RenovationProject = exports.RenovationProjectEntity = RenovationProjectEntity = __decorate([
    (0, typeorm_1.Entity)('renovation_projects')
], RenovationProjectEntity);
//# sourceMappingURL=renovation-project.entity.js.map