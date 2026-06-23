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
exports.UpdateMilestoneDto = exports.SubmitQuoteDto = exports.CreateRenovationDto = void 0;
const class_validator_1 = require("class-validator");
const renovation_project_entity_1 = require("../entities/renovation-project.entity");
class CreateRenovationDto {
}
exports.CreateRenovationDto = CreateRenovationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    __metadata("design:type", String)
], CreateRenovationDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(20),
    __metadata("design:type", String)
], CreateRenovationDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(renovation_project_entity_1.ProjectType),
    __metadata("design:type", String)
], CreateRenovationDto.prototype, "projectType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRenovationDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRenovationDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateRenovationDto.prototype, "budget", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateRenovationDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateRenovationDto.prototype, "endDate", void 0);
class SubmitQuoteDto {
}
exports.SubmitQuoteDto = SubmitQuoteDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], SubmitQuoteDto.prototype, "quotedAmount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitQuoteDto.prototype, "notes", void 0);
class UpdateMilestoneDto {
}
exports.UpdateMilestoneDto = UpdateMilestoneDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMilestoneDto.prototype, "milestoneId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
    __metadata("design:type", String)
], UpdateMilestoneDto.prototype, "status", void 0);
//# sourceMappingURL=create-renovation.dto.js.map