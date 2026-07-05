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
exports.DocumentEntity = exports.DocumentStatus = exports.DocumentType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
var DocumentType;
(function (DocumentType) {
    DocumentType["NATIONAL_ID"] = "NATIONAL_ID";
    DocumentType["PASSPORT"] = "PASSPORT";
    DocumentType["SELFIE"] = "SELFIE";
    DocumentType["RCCM"] = "RCCM";
    DocumentType["STATUTS_SOCIETE"] = "STATUTS_SOCIETE";
    DocumentType["ATTESTATION_FISCALE"] = "ATTESTATION_FISCALE";
    DocumentType["CNI_REPRESENTANT"] = "CNI_REPRESENTANT";
    DocumentType["MOBILE_MONEY_PROOF"] = "MOBILE_MONEY_PROOF";
    DocumentType["JUSTIFICATIF_COMPETENCE"] = "JUSTIFICATIF_COMPETENCE";
    DocumentType["BUSINESS_LICENSE"] = "BUSINESS_LICENSE";
    DocumentType["INSURANCE"] = "INSURANCE";
    DocumentType["DIPLOMA"] = "DIPLOMA";
    DocumentType["OTHER"] = "OTHER";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
var DocumentStatus;
(function (DocumentStatus) {
    DocumentStatus["PENDING"] = "PENDING";
    DocumentStatus["APPROVED"] = "APPROVED";
    DocumentStatus["REJECTED"] = "REJECTED";
})(DocumentStatus || (exports.DocumentStatus = DocumentStatus = {}));
let DocumentEntity = class DocumentEntity {
};
exports.DocumentEntity = DocumentEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DocumentEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DocumentEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.UserEntity)
], DocumentEntity.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: DocumentType }),
    __metadata("design:type", String)
], DocumentEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'longtext' }),
    __metadata("design:type", String)
], DocumentEntity.prototype, "fileUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: DocumentStatus, default: DocumentStatus.PENDING }),
    __metadata("design:type", String)
], DocumentEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DocumentEntity.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DocumentEntity.prototype, "uploadedAt", void 0);
exports.DocumentEntity = DocumentEntity = __decorate([
    (0, typeorm_1.Entity)('documents')
], DocumentEntity);
//# sourceMappingURL=document.entity.js.map