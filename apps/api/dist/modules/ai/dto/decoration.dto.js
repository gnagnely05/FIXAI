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
exports.GenerateDecorationDto = exports.DecoStyle = exports.RoomType = void 0;
const class_validator_1 = require("class-validator");
var RoomType;
(function (RoomType) {
    RoomType["SALON"] = "SALON";
    RoomType["CHAMBRE"] = "CHAMBRE";
    RoomType["BUREAU"] = "BUREAU";
    RoomType["CUISINE"] = "CUISINE";
    RoomType["SALLE_A_MANGER"] = "SALLE_A_MANGER";
    RoomType["SALLE_DE_BAIN"] = "SALLE_DE_BAIN";
})(RoomType || (exports.RoomType = RoomType = {}));
var DecoStyle;
(function (DecoStyle) {
    DecoStyle["MODERNE_EPURE"] = "MODERNE_EPURE";
    DecoStyle["CHAUD_NATUREL"] = "CHAUD_NATUREL";
    DecoStyle["COLORE_VIVANT"] = "COLORE_VIVANT";
    DecoStyle["CLASSIQUE_ELEGANT"] = "CLASSIQUE_ELEGANT";
})(DecoStyle || (exports.DecoStyle = DecoStyle = {}));
class GenerateDecorationDto {
}
exports.GenerateDecorationDto = GenerateDecorationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateDecorationDto.prototype, "roomPhotoUrl", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(RoomType),
    __metadata("design:type", String)
], GenerateDecorationDto.prototype, "roomType", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], GenerateDecorationDto.prototype, "problems", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(DecoStyle),
    __metadata("design:type", String)
], GenerateDecorationDto.prototype, "style", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], GenerateDecorationDto.prototype, "isTenant", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['SEUL', 'COUPLE', 'FAMILLE', 'FAMILLE_ENFANTS']),
    __metadata("design:type", String)
], GenerateDecorationDto.prototype, "occupants", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['MOINS_100K', '100K_300K', '300K_500K', 'PLUS_500K']),
    __metadata("design:type", String)
], GenerateDecorationDto.prototype, "budget", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], GenerateDecorationDto.prototype, "productIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateDecorationDto.prototype, "keepItemsDescription", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateDecorationDto.prototype, "keepItemsPhotoUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], GenerateDecorationDto.prototype, "isOpenSpace", void 0);
//# sourceMappingURL=decoration.dto.js.map