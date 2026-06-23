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
exports.Artisan = exports.ArtisanEntity = exports.ArtisanSpecialty = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const order_entity_1 = require("../../orders/entities/order.entity");
var ArtisanSpecialty;
(function (ArtisanSpecialty) {
    ArtisanSpecialty["PLOMBERIE"] = "PLOMBERIE";
    ArtisanSpecialty["ELECTRICITE"] = "ELECTRICITE";
    ArtisanSpecialty["MACONNERIE"] = "MACONNERIE";
    ArtisanSpecialty["MENUISERIE"] = "MENUISERIE";
    ArtisanSpecialty["PEINTURE"] = "PEINTURE";
    ArtisanSpecialty["DECORATION"] = "DECORATION";
    ArtisanSpecialty["CARRELAGE"] = "CARRELAGE";
    ArtisanSpecialty["CLIMATISATION"] = "CLIMATISATION";
    ArtisanSpecialty["TOITURE"] = "TOITURE";
    ArtisanSpecialty["FERRONNERIE"] = "FERRONNERIE";
})(ArtisanSpecialty || (exports.ArtisanSpecialty = ArtisanSpecialty = {}));
let ArtisanEntity = class ArtisanEntity {
};
exports.ArtisanEntity = ArtisanEntity;
exports.Artisan = ArtisanEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ArtisanEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.UserEntity, (user) => user.artisanProfile),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", user_entity_1.UserEntity)
], ArtisanEntity.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ArtisanSpecialty }),
    __metadata("design:type", String)
], ArtisanEntity.prototype, "specialty", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ArtisanEntity.prototype, "bio", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ArtisanEntity.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ArtisanEntity.prototype, "district", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 9, scale: 6, nullable: true }),
    __metadata("design:type", Number)
], ArtisanEntity.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 9, scale: 6, nullable: true }),
    __metadata("design:type", Number)
], ArtisanEntity.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 3, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ArtisanEntity.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], ArtisanEntity.prototype, "reviewCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ArtisanEntity.prototype, "isVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], ArtisanEntity.prototype, "isAvailable", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], ArtisanEntity.prototype, "yearsOfExperience", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', default: 0 }),
    __metadata("design:type", Number)
], ArtisanEntity.prototype, "hourlyRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], ArtisanEntity.prototype, "portfolioImages", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => order_entity_1.OrderEntity, (order) => order.artisan),
    __metadata("design:type", Array)
], ArtisanEntity.prototype, "orders", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ArtisanEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ArtisanEntity.prototype, "updatedAt", void 0);
exports.Artisan = exports.ArtisanEntity = ArtisanEntity = __decorate([
    (0, typeorm_1.Entity)('artisans')
], ArtisanEntity);
//# sourceMappingURL=artisan.entity.js.map