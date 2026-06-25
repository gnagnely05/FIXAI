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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const verification_status_enum_1 = require("../../common/enums/verification-status.enum");
let UsersService = class UsersService {
    constructor(usersRepo) {
        this.usersRepo = usersRepo;
    }
    async findById(id) {
        const user = await this.usersRepo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async findByEmail(email) {
        return this.usersRepo.findOne({ where: { email } });
    }
    async updateProfile(id, updates) {
        await this.usersRepo.update(id, updates);
        return this.findById(id);
    }
    async verifyUser(id) {
        await this.usersRepo.update(id, { verificationStatus: verification_status_enum_1.VerificationStatus.ACTIVE });
    }
    async upgradeToPro(id, data) {
        const user = await this.findById(id);
        if (user.role !== user_role_enum_1.UserRole.CLIENT) {
            throw new common_1.ConflictException('Seul un compte client peut activer un espace pro');
        }
        const allowed = [user_role_enum_1.UserRole.ARTISAN, user_role_enum_1.UserRole.AGENCE_HOTE, user_role_enum_1.UserRole.ENTREPRISE_BTP, user_role_enum_1.UserRole.BOUTIQUE, user_role_enum_1.UserRole.QUINCAILLERIE];
        if (!allowed.includes(data.role)) {
            throw new common_1.ConflictException('Type de profil pro invalide');
        }
        const updates = {
            role: data.role,
            verificationStatus: verification_status_enum_1.VerificationStatus.DOCS_SUBMITTED,
        };
        if (data.city)
            updates.city = data.city;
        if (data.btpMode)
            updates.btpMode = data.btpMode;
        if (data.radiusKm)
            updates.radiusKm = data.radiusKm;
        await this.usersRepo.update(id, updates);
        return this.findById(id);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map