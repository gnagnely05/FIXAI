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
exports.StepPaymentDto = exports.StepArtisanDto = exports.StepLocationDto = exports.StepModeDto = exports.StepCategoryDto = exports.CreateDepannageDto = void 0;
const class_validator_1 = require("class-validator");
const artisan_entity_1 = require("../../artisans/entities/artisan.entity");
const depannage_request_entity_1 = require("../entities/depannage-request.entity");
class CreateDepannageDto {
}
exports.CreateDepannageDto = CreateDepannageDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    __metadata("design:type", String)
], CreateDepannageDto.prototype, "description", void 0);
class StepCategoryDto {
}
exports.StepCategoryDto = StepCategoryDto;
__decorate([
    (0, class_validator_1.IsEnum)(artisan_entity_1.ArtisanSpecialty),
    __metadata("design:type", String)
], StepCategoryDto.prototype, "category", void 0);
class StepModeDto {
}
exports.StepModeDto = StepModeDto;
__decorate([
    (0, class_validator_1.IsEnum)(depannage_request_entity_1.DepannageMode),
    __metadata("design:type", String)
], StepModeDto.prototype, "mode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], StepModeDto.prototype, "scheduledAt", void 0);
class StepLocationDto {
}
exports.StepLocationDto = StepLocationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StepLocationDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StepLocationDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsLatitude)(),
    __metadata("design:type", Number)
], StepLocationDto.prototype, "latitude", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsLongitude)(),
    __metadata("design:type", Number)
], StepLocationDto.prototype, "longitude", void 0);
class StepArtisanDto {
}
exports.StepArtisanDto = StepArtisanDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StepArtisanDto.prototype, "artisanId", void 0);
class StepPaymentDto {
}
exports.StepPaymentDto = StepPaymentDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StepPaymentDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StepPaymentDto.prototype, "phoneNumber", void 0);
//# sourceMappingURL=create-depannage.dto.js.map