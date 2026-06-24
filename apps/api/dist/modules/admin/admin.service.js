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
var AdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcryptjs"));
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const artisan_entity_1 = require("../artisans/entities/artisan.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const document_entity_1 = require("../documents/entities/document.entity");
const commission_config_entity_1 = require("./entities/commission-config.entity");
const product_entity_1 = require("../catalog/entities/product.entity");
const verification_status_enum_1 = require("../../common/enums/verification-status.enum");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const verify_step_dto_1 = require("./dto/verify-step.dto");
/** Automatic next status after APPROVE for each current status */
const APPROVE_TRANSITIONS = {
    [verification_status_enum_1.VerificationStatus.REGISTERED]: verification_status_enum_1.VerificationStatus.DOCS_SUBMITTED,
    [verification_status_enum_1.VerificationStatus.DOCS_SUBMITTED]: verification_status_enum_1.VerificationStatus.PENDING_VERIFICATION,
    [verification_status_enum_1.VerificationStatus.PENDING_VERIFICATION]: verification_status_enum_1.VerificationStatus.IDENTITY_VERIFIED,
    [verification_status_enum_1.VerificationStatus.IDENTITY_VERIFIED]: verification_status_enum_1.VerificationStatus.AFFILIATION_REQUESTED,
    [verification_status_enum_1.VerificationStatus.AFFILIATION_REQUESTED]: verification_status_enum_1.VerificationStatus.ACTIVE,
};
let AdminService = AdminService_1 = class AdminService {
    constructor(usersRepo, artisansRepo, ordersRepo, docsRepo, commissionRepo, productsRepo) {
        this.usersRepo = usersRepo;
        this.artisansRepo = artisansRepo;
        this.ordersRepo = ordersRepo;
        this.docsRepo = docsRepo;
        this.commissionRepo = commissionRepo;
        this.productsRepo = productsRepo;
        this.logger = new common_1.Logger(AdminService_1.name);
    }
    async getPendingVerifications() {
        const [users, documents] = await Promise.all([
            this.usersRepo.find({
                where: [
                    { verificationStatus: verification_status_enum_1.VerificationStatus.DOCS_SUBMITTED },
                    { verificationStatus: verification_status_enum_1.VerificationStatus.PENDING_VERIFICATION },
                    { verificationStatus: verification_status_enum_1.VerificationStatus.IDENTITY_VERIFIED },
                    { verificationStatus: verification_status_enum_1.VerificationStatus.AFFILIATION_REQUESTED },
                ],
            }),
            this.docsRepo.find({
                where: { status: document_entity_1.DocumentStatus.PENDING },
                relations: ['user'],
            }),
        ]);
        return { users, documents };
    }
    async verifyStep(dto) {
        const user = await this.usersRepo.findOne({ where: { id: dto.userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (dto.action === verify_step_dto_1.VerifyAction.REJECT) {
            user.verificationStatus = verification_status_enum_1.VerificationStatus.REJECTED;
            this.logger.warn(`Admin rejected user ${dto.userId}: ${dto.reason ?? 'no reason'}`);
            return this.usersRepo.save(user);
        }
        if (dto.action === verify_step_dto_1.VerifyAction.INCOMPLETE) {
            user.verificationStatus = verification_status_enum_1.VerificationStatus.DOCS_SUBMITTED;
            this.logger.log(`Admin marked user ${dto.userId} as incomplete`);
            return this.usersRepo.save(user);
        }
        // APPROVE
        const next = dto.targetStatus ?? APPROVE_TRANSITIONS[user.verificationStatus];
        if (!next) {
            throw new common_1.BadRequestException(`No valid approval transition from ${user.verificationStatus}`);
        }
        user.verificationStatus = next;
        this.logger.log(`Admin approved user ${dto.userId}: ${user.verificationStatus} → ${next}`);
        return this.usersRepo.save(user);
    }
    /** Legacy alias kept for backward compatibility */
    async verifyUser(userId) {
        return this.verifyStep({ userId, action: verify_step_dto_1.VerifyAction.APPROVE });
    }
    async rejectUser(userId, reason) {
        await this.verifyStep({ userId, action: verify_step_dto_1.VerifyAction.REJECT, reason });
        return { message: `User ${userId} rejected. Reason: ${reason}` };
    }
    // ── Commission config ──────────────────────────────────────────────
    async getActiveCommission() {
        const config = await this.commissionRepo.findOne({ where: { isActive: true } });
        if (!config) {
            // Bootstrap default if missing
            const def = this.commissionRepo.create({ fixaiRate: 0.03, agencyRate: 0.02, artisanRate: 0.95, isActive: true });
            return this.commissionRepo.save(def);
        }
        return config;
    }
    async updateCommission(fixaiRate, agencyRate) {
        if (fixaiRate + agencyRate >= 1) {
            throw new common_1.BadRequestException('fixaiRate + agencyRate must be < 1');
        }
        const existing = await this.getActiveCommission();
        existing.fixaiRate = fixaiRate;
        existing.agencyRate = agencyRate;
        existing.artisanRate = Math.round((1 - fixaiRate - agencyRate) * 1e10) / 1e10;
        this.logger.log(`Commission updated: fixai=${fixaiRate}, agency=${agencyRate}, artisan=${existing.artisanRate}`);
        return this.commissionRepo.save(existing);
    }
    // ── Escrow / orders overview ───────────────────────────────────────
    // ── Actors CRUD ──────────────────────────────────────────────────────
    async getActors(role, status, q) {
        const qb = this.usersRepo.createQueryBuilder('u')
            .where('u.role != :admin', { admin: 'ADMIN' });
        if (role)
            qb.andWhere('u.role = :role', { role });
        if (status)
            qb.andWhere('u.verificationStatus = :status', { status });
        if (q)
            qb.andWhere('(u.firstName ILIKE :q OR u.lastName ILIKE :q OR u.email ILIKE :q)', { q: `%${q}%` });
        qb.orderBy('u.createdAt', 'DESC');
        const users = await qb.getMany();
        return users.map(({ passwordHash, refreshToken, ...safe }) => safe);
    }
    async getActorById(id) {
        const user = await this.usersRepo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const { passwordHash, refreshToken, ...safe } = user;
        const docs = await this.docsRepo.find({ where: { userId: id } });
        return { ...safe, documents: docs };
    }
    async updateActor(id, updates) {
        const forbidden = ['passwordHash', 'refreshToken', 'id', 'email'];
        forbidden.forEach(k => delete updates[k]);
        await this.usersRepo.update(id, updates);
        return this.getActorById(id);
    }
    async deleteActor(id) {
        const user = await this.usersRepo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        await this.usersRepo.delete(id);
        this.logger.warn(`Admin deleted user ${id} (${user.email})`);
        return { message: `User ${user.email} deleted` };
    }
    async suspendActor(id, reason) {
        await this.usersRepo.update(id, { verificationStatus: verification_status_enum_1.VerificationStatus.SUSPENDED });
        this.logger.warn(`Admin suspended user ${id}: ${reason ?? 'no reason'}`);
        return this.getActorById(id);
    }
    async activateActor(id) {
        await this.usersRepo.update(id, { verificationStatus: verification_status_enum_1.VerificationStatus.ACTIVE });
        return this.getActorById(id);
    }
    // ── Products CRUD ─────────────────────────────────────────────────────
    async getProducts(merchantId, merchantType, q) {
        const qb = this.productsRepo.createQueryBuilder('p');
        if (merchantId)
            qb.andWhere('p.merchantId = :merchantId', { merchantId });
        if (merchantType)
            qb.andWhere('p.merchantType = :merchantType', { merchantType });
        if (q)
            qb.andWhere('p.name ILIKE :q', { q: `%${q}%` });
        return qb.orderBy('p.createdAt', 'DESC').getMany();
    }
    async createProduct(data) {
        const product = this.productsRepo.create(data);
        return this.productsRepo.save(product);
    }
    async updateProduct(id, data) {
        const product = await this.productsRepo.findOne({ where: { id } });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        Object.assign(product, data);
        return this.productsRepo.save(product);
    }
    async deleteProduct(id) {
        const product = await this.productsRepo.findOne({ where: { id } });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        await this.productsRepo.delete(id);
        return { message: `Product "${product.name}" deleted` };
    }
    // ── Seed admin ────────────────────────────────────────────────────────
    async seedAdmin(email, password, firstName, lastName) {
        const existing = await this.usersRepo.findOne({ where: { email } });
        if (existing)
            throw new common_1.ConflictException('Email already registered');
        const passwordHash = await bcrypt.hash(password, 12);
        const admin = this.usersRepo.create({
            email,
            passwordHash,
            firstName,
            lastName,
            role: user_role_enum_1.UserRole.ADMIN,
            verificationStatus: verification_status_enum_1.VerificationStatus.ACTIVE,
        });
        await this.usersRepo.save(admin);
        this.logger.log(`Admin account created: ${email}`);
        const { passwordHash: _, refreshToken: __, ...safe } = admin;
        return { message: 'Admin account created successfully', user: safe };
    }
    async getEscrowOverview() {
        const orders = await this.ordersRepo.find({ relations: ['client', 'artisan'] });
        const funded = orders.filter(o => o.escrowStatus === order_entity_1.EscrowStatus.FUNDED);
        const released = orders.filter(o => o.escrowStatus === order_entity_1.EscrowStatus.RELEASED);
        const refunded = orders.filter(o => o.escrowStatus === order_entity_1.EscrowStatus.REFUNDED);
        return {
            totalFunded: funded.reduce((s, o) => s + Number(o.escrowAmount), 0),
            totalReleased: released.reduce((s, o) => s + Number(o.escrowAmount), 0),
            totalRefunded: refunded.reduce((s, o) => s + Number(o.escrowAmount), 0),
            pendingEscrow: funded.reduce((s, o) => s + Number(o.escrowAmount), 0),
            orders,
        };
    }
    async getDisputes() {
        return this.ordersRepo.find({
            where: { status: order_entity_1.OrderStatus.DISPUTED },
            relations: ['client', 'artisan'],
            order: { createdAt: 'DESC' },
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = AdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(artisan_entity_1.ArtisanEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(document_entity_1.DocumentEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(commission_config_entity_1.CommissionConfigEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(product_entity_1.ProductEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminService);
//# sourceMappingURL=admin.service.js.map