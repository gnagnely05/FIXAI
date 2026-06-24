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
exports.CommissionConfigEntity = void 0;
const typeorm_1 = require("typeorm");
let CommissionConfigEntity = class CommissionConfigEntity {
};
exports.CommissionConfigEntity = CommissionConfigEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CommissionConfigEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 0.03 }),
    __metadata("design:type", Number)
], CommissionConfigEntity.prototype, "fixaiRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 0.02 }),
    __metadata("design:type", Number)
], CommissionConfigEntity.prototype, "agencyRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 0.95 }),
    __metadata("design:type", Number)
], CommissionConfigEntity.prototype, "artisanRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 0.05 }),
    __metadata("design:type", Number)
], CommissionConfigEntity.prototype, "storeCommissionRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], CommissionConfigEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CommissionConfigEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CommissionConfigEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CommissionConfigEntity.prototype, "updatedAt", void 0);
exports.CommissionConfigEntity = CommissionConfigEntity = __decorate([
    (0, typeorm_1.Entity)('commission_config')
], CommissionConfigEntity);
//# sourceMappingURL=commission-config.entity.js.map