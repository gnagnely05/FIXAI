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
exports.VerifyStepDto = exports.VerifyAction = void 0;
const class_validator_1 = require("class-validator");
const verification_status_enum_1 = require("../../../common/enums/verification-status.enum");
var VerifyAction;
(function (VerifyAction) {
    VerifyAction["APPROVE"] = "APPROVE";
    VerifyAction["INCOMPLETE"] = "INCOMPLETE";
    VerifyAction["REJECT"] = "REJECT";
})(VerifyAction || (exports.VerifyAction = VerifyAction = {}));
class VerifyStepDto {
}
exports.VerifyStepDto = VerifyStepDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyStepDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(VerifyAction),
    __metadata("design:type", String)
], VerifyStepDto.prototype, "action", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], VerifyStepDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(verification_status_enum_1.VerificationStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], VerifyStepDto.prototype, "targetStatus", void 0);
//# sourceMappingURL=verify-step.dto.js.map