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
let ArtisansService = class ArtisansService {
    constructor(artisansRepo) {
        this.artisansRepo = artisansRepo;
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
};
exports.ArtisansService = ArtisansService;
exports.ArtisansService = ArtisansService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(artisan_entity_1.ArtisanEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ArtisansService);
//# sourceMappingURL=artisans.service.js.map