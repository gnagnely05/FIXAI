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
exports.RegisterProviderDto = void 0;
const class_validator_1 = require("class-validator");
const user_role_enum_1 = require("../../../common/enums/user-role.enum");
const btp_mode_enum_1 = require("../../../common/enums/btp-mode.enum");
const PROVIDER_ROLES = [
    user_role_enum_1.UserRole.ARTISAN,
    user_role_enum_1.UserRole.AGENCE_HOTE,
    user_role_enum_1.UserRole.ENTREPRISE_BTP,
    user_role_enum_1.UserRole.BOUTIQUE,
    user_role_enum_1.UserRole.QUINCAILLERIE,
];
class RegisterProviderDto {
}
exports.RegisterProviderDto = RegisterProviderDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], RegisterProviderDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], RegisterProviderDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterProviderDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterProviderDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterProviderDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(PROVIDER_ROLES),
    __metadata("design:type", Object)
], RegisterProviderDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterProviderDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], RegisterProviderDto.prototype, "radiusKm", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(btp_mode_enum_1.BtpMode),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterProviderDto.prototype, "btpMode", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUrl)({}, { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], RegisterProviderDto.prototype, "documentUrls", void 0);
//# sourceMappingURL=register-provider.dto.js.map