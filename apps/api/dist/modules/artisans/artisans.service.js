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
exports.ArtisansService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const artisan_entity_1 = require("./entities/artisan.entity");
const user_entity_1 = require("../users/entities/user.entity");
const verification_status_enum_1 = require("../../common/enums/verification-status.enum");
let ArtisansService = class ArtisansService {
    constructor(artisansRepo, usersRepo) {
        this.artisansRepo = artisansRepo;
        this.usersRepo = usersRepo;
    }
    async findAll(query) {
        const { page = 1, limit = 20, specialty, city, minRating, maxHourlyRate, isAvailable, isVerified } = query;
        const qb = this.artisansRepo.createQueryBuilder('artisan').leftJoinAndSelect('artisan.user', 'user');
        if (specialty)
            qb.andWhere('artisan.specialty = :specialty', { specialty });
        if (city)
            qb.andWhere('LOWER(artisan.city) LIKE LOWER(:city)', { city: `%${city}%` });
        if (minRating !== undefined)
            qb.andWhere('artisan.rating >= :minRating', { minRating });
        if (maxHourlyRate !== undefined)
            qb.andWhere('artisan.hourlyRate <= :maxHourlyRate', { maxHourlyRate });
        if (isAvailable !== undefined)
            qb.andWhere('artisan.isAvailable = :isAvailable', { isAvailable });
        if (isVerified !== undefined)
            qb.andWhere('artisan.isVerified = :isVerified', { isVerified });
        qb.orderBy('artisan.rating', 'DESC').skip((page - 1) * limit).take(limit);
        const [artisans, total] = await qb.getManyAndCount();
        return { artisans, total, page, limit };
    }
    async findById(id) {
        const artisan = await this.artisansRepo.findOne({ where: { id }, relations: ['user'] });
        if (!artisan)
            throw new common_1.NotFoundException('Artisan not found');
        return artisan;
    }
    async updateAvailability(artisanId, isAvailable) {
        await this.artisansRepo.update(artisanId, { isAvailable });
    }
    async updateRating(artisanId, newRating, reviewCount) {
        await this.artisansRepo.update(artisanId, { rating: newRating, reviewCount });
    }
    async getAvailability(userId) {
        const artisan = await this.artisansRepo.findOne({ where: { user: { id: userId } } });
        if (!artisan)
            return { isAvailable: false, availableDays: [], availableSlots: [] };
        return {
            isAvailable: artisan.isAvailable,
            availableDays: artisan.availableDays ?? [],
            availableSlots: artisan.availableSlots ?? [],
        };
    }
    async updateAvailabilityByUser(userId, data) {
        const artisan = await this.artisansRepo.findOne({ where: { user: { id: userId } } });
        if (!artisan)
            throw new common_1.NotFoundException('Artisan profile not found');
        await this.artisansRepo.update(artisan.id, {
            isAvailable: data.isAvailable,
            ...(data.availableDays !== undefined && { availableDays: data.availableDays }),
            ...(data.availableSlots !== undefined && { availableSlots: data.availableSlots }),
        });
        return { message: 'Availability updated' };
    }
    async findByAgency(agencyUserId) {
        const artisanUsers = await this.usersRepo.find({ where: { agencyId: agencyUserId }, select: ['id'] });
        if (artisanUsers.length === 0)
            return [];
        const userIds = artisanUsers.map(u => u.id);
        return this.artisansRepo
            .createQueryBuilder('artisan')
            .leftJoinAndSelect('artisan.user', 'user')
            .where('user.id IN (:...userIds)', { userIds })
            .getMany();
    }
    // ─── Règle 1 : gestion des artisans affiliés par l'agence/BTP ──────────
    async ensureOwnership(artisanUserId, requesterUserId) {
        const artisanUser = await this.usersRepo.findOne({ where: { id: artisanUserId } });
        if (!artisanUser)
            throw new common_1.NotFoundException('Artisan user not found');
        if (artisanUser.agencyId !== requesterUserId) {
            throw new common_1.ForbiddenException('Cet artisan n\'est pas affilié à votre organisation');
        }
        return artisanUser;
    }
    /** Valide un artisan affilié (passe à ACTIVE) */
    async validateAffiliatedArtisan(artisanId, requesterUserId, requesterRole) {
        const artisan = await this.artisansRepo.findOne({ where: { id: artisanId }, relations: ['user'] });
        if (!artisan)
            throw new common_1.NotFoundException('Artisan not found');
        if (requesterRole !== 'ADMIN') {
            await this.ensureOwnership(artisan.user.id, requesterUserId);
        }
        await this.usersRepo.update(artisan.user.id, {
            verificationStatus: verification_status_enum_1.VerificationStatus.ACTIVE,
        });
        await this.artisansRepo.update(artisanId, { isVerified: true });
        return { message: 'Artisan validé avec succès' };
    }
    /** Suspend un artisan affilié */
    async suspendAffiliatedArtisan(artisanId, requesterUserId, requesterRole, reason) {
        const artisan = await this.artisansRepo.findOne({ where: { id: artisanId }, relations: ['user'] });
        if (!artisan)
            throw new common_1.NotFoundException('Artisan not found');
        if (requesterRole !== 'ADMIN') {
            await this.ensureOwnership(artisan.user.id, requesterUserId);
        }
        await this.usersRepo.update(artisan.user.id, {
            verificationStatus: verification_status_enum_1.VerificationStatus.SUSPENDED,
        });
        await this.artisansRepo.update(artisanId, { isAvailable: false, isVerified: false });
        return { message: `Artisan suspendu${reason ? ` : ${reason}` : ''}` };
    }
    /** Désaffilie un artisan (retire le lien agencyId) */
    async removeFromAgency(artisanId, requesterUserId, requesterRole) {
        const artisan = await this.artisansRepo.findOne({ where: { id: artisanId }, relations: ['user'] });
        if (!artisan)
            throw new common_1.NotFoundException('Artisan not found');
        if (requesterRole !== 'ADMIN') {
            await this.ensureOwnership(artisan.user.id, requesterUserId);
        }
        await this.usersRepo.update(artisan.user.id, { agencyId: null });
        return { message: 'Artisan désaffilié de l\'organisation' };
    }
};
exports.ArtisansService = ArtisansService;
exports.ArtisansService = ArtisansService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(artisan_entity_1.ArtisanEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ArtisansService);
//# sourceMappingURL=artisans.service.js.map