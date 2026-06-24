"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcryptjs"));
const user_entity_1 = require("../users/entities/user.entity");
const document_entity_1 = require("../documents/entities/document.entity");
const verification_status_enum_1 = require("../../common/enums/verification-status.enum");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
let AuthService = class AuthService {
    constructor(usersRepo, docsRepo, jwtService) {
        this.usersRepo = usersRepo;
        this.docsRepo = docsRepo;
        this.jwtService = jwtService;
    }
    async registerProvider(dto) {
        const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
        if (existing)
            throw new common_1.ConflictException('Email already registered');
        if (dto.role === user_role_enum_1.UserRole.ENTREPRISE_BTP && !dto.btpMode) {
            throw new common_1.BadRequestException('btpMode is required for ENTREPRISE_BTP');
        }
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const initialStatus = this.getInitialStatus(dto.role, dto.documents);
        const user = this.usersRepo.create({
            email: dto.email,
            phone: dto.phone,
            passwordHash,
            firstName: dto.firstName,
            lastName: dto.lastName,
            role: dto.role,
            city: dto.city,
            radiusKm: dto.radiusKm,
            btpMode: dto.btpMode,
            verificationStatus: initialStatus,
        });
        await this.usersRepo.save(user);
        if (dto.documents?.length) {
            const docs = dto.documents.map(({ type, url }) => this.docsRepo.create({
                userId: user.id,
                type: (document_entity_1.DocumentType[type] ?? document_entity_1.DocumentType.OTHER),
                fileUrl: url,
            }));
            await this.docsRepo.save(docs);
        }
        const tokens = await this.generateTokens(user);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return { user: this.sanitizeUser(user), ...tokens };
    }
    async register(dto) {
        const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
        if (existing) {
            throw new common_1.ConflictException('Email already registered');
        }
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const user = this.usersRepo.create({ ...dto, passwordHash });
        await this.usersRepo.save(user);
        const tokens = await this.generateTokens(user);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return { user: this.sanitizeUser(user), ...tokens };
    }
    async login(dto) {
        const user = await this.usersRepo.findOne({ where: { email: dto.email } });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const tokens = await this.generateTokens(user);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return { user: this.sanitizeUser(user), ...tokens };
    }
    async logout(userId) {
        await this.usersRepo.update(userId, { refreshToken: undefined });
    }
    async refreshTokens(userId, refreshToken) {
        const user = await this.usersRepo.findOne({ where: { id: userId } });
        if (!user?.refreshToken) {
            throw new common_1.UnauthorizedException('Access denied');
        }
        const tokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!tokenValid) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const tokens = await this.generateTokens(user);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }
    async generateTokens(user) {
        const payload = { sub: user.id, email: user.email, role: user.role };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, { expiresIn: '15m' }),
            this.jwtService.signAsync(payload, { expiresIn: '7d', secret: process.env.JWT_REFRESH_SECRET }),
        ]);
        return { accessToken, refreshToken };
    }
    async updateRefreshToken(userId, refreshToken) {
        const hashed = await bcrypt.hash(refreshToken, 10);
        await this.usersRepo.update(userId, { refreshToken: hashed });
    }
    getInitialStatus(role, documents) {
        const hasDocs = documents && documents.length > 0;
        switch (role) {
            case user_role_enum_1.UserRole.BOUTIQUE:
                return verification_status_enum_1.VerificationStatus.SHOP_REGISTERED;
            case user_role_enum_1.UserRole.QUINCAILLERIE:
                return verification_status_enum_1.VerificationStatus.HARDWARE_REGISTERED;
            case user_role_enum_1.UserRole.AGENCE_HOTE:
            case user_role_enum_1.UserRole.ENTREPRISE_BTP:
                return hasDocs ? verification_status_enum_1.VerificationStatus.DOCS_SUBMITTED : verification_status_enum_1.VerificationStatus.REGISTERED;
            case user_role_enum_1.UserRole.ARTISAN:
                return hasDocs ? verification_status_enum_1.VerificationStatus.DOCS_SUBMITTED : verification_status_enum_1.VerificationStatus.REGISTERED;
            default:
                return verification_status_enum_1.VerificationStatus.REGISTERED;
        }
    }
    sanitizeUser(user) {
        const { passwordHash, refreshToken, ...safe } = user;
        return safe;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(document_entity_1.DocumentEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map