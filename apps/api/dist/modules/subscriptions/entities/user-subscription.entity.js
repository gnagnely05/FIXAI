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
exports.UserSubscriptionEntity = exports.SubscriptionState = exports.SubscriptionBilling = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const subscription_plan_entity_1 = require("./subscription-plan.entity");
var SubscriptionBilling;
(function (SubscriptionBilling) {
    SubscriptionBilling["MONTHLY"] = "MONTHLY";
    SubscriptionBilling["ANNUAL"] = "ANNUAL";
})(SubscriptionBilling || (exports.SubscriptionBilling = SubscriptionBilling = {}));
var SubscriptionState;
(function (SubscriptionState) {
    SubscriptionState["ACTIVE"] = "ACTIVE";
    SubscriptionState["EXPIRED"] = "EXPIRED";
    SubscriptionState["CANCELLED"] = "CANCELLED";
})(SubscriptionState || (exports.SubscriptionState = SubscriptionState = {}));
let UserSubscriptionEntity = class UserSubscriptionEntity {
};
exports.UserSubscriptionEntity = UserSubscriptionEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserSubscriptionEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserSubscriptionEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserSubscriptionEntity.prototype, "planId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: SubscriptionBilling }),
    __metadata("design:type", String)
], UserSubscriptionEntity.prototype, "billing", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: SubscriptionState, default: SubscriptionState.ACTIVE }),
    __metadata("design:type", String)
], UserSubscriptionEntity.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], UserSubscriptionEntity.prototype, "startsAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], UserSubscriptionEntity.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], UserSubscriptionEntity.prototype, "aiRequestsUsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], UserSubscriptionEntity.prototype, "lastResetAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UserSubscriptionEntity.prototype, "paymentRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.UserEntity)
], UserSubscriptionEntity.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => subscription_plan_entity_1.SubscriptionPlanEntity),
    (0, typeorm_1.JoinColumn)({ name: 'planId' }),
    __metadata("design:type", subscription_plan_entity_1.SubscriptionPlanEntity)
], UserSubscriptionEntity.prototype, "plan", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], UserSubscriptionEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], UserSubscriptionEntity.prototype, "updatedAt", void 0);
exports.UserSubscriptionEntity = UserSubscriptionEntity = __decorate([
    (0, typeorm_1.Entity)('user_subscriptions')
], UserSubscriptionEntity);
//# sourceMappingURL=user-subscription.entity.js.map