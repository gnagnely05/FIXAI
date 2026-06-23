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
exports.CatalogService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./entities/product.entity");
let CatalogService = class CatalogService {
    constructor(repo) {
        this.repo = repo;
    }
    async search(dto) {
        const where = { isAvailable: true };
        if (dto.category)
            where.category = dto.category;
        if (dto.merchantType)
            where.merchantType = dto.merchantType;
        if (dto.merchantId)
            where.merchantId = dto.merchantId;
        let query = this.repo.createQueryBuilder('p').where('p.isAvailable = true');
        if (dto.q)
            query = query.andWhere('p.name ILIKE :q', { q: `%${dto.q}%` });
        if (dto.category)
            query = query.andWhere('p.category = :cat', { cat: dto.category });
        if (dto.merchantType)
            query = query.andWhere('p.merchantType = :mt', { mt: dto.merchantType });
        if (dto.merchantId)
            query = query.andWhere('p.merchantId = :mid', { mid: dto.merchantId });
        if (dto.minPrice != null)
            query = query.andWhere('p.priceXof >= :min', { min: dto.minPrice });
        if (dto.maxPrice != null)
            query = query.andWhere('p.priceXof <= :max', { max: dto.maxPrice });
        return query.orderBy('p.name', 'ASC').getMany();
    }
    async findOne(id) {
        const p = await this.repo.findOne({ where: { id } });
        if (!p)
            throw new common_1.NotFoundException('Product not found');
        return p;
    }
    async findByMerchant(merchantId) {
        return this.repo.find({ where: { merchantId, isAvailable: true }, order: { name: 'ASC' } });
    }
    async create(dto) {
        const product = this.repo.create(dto);
        return this.repo.save(product);
    }
    async findBoutiques() {
        return this.repo.find({ where: { merchantType: product_entity_1.MerchantType.BOUTIQUE, isAvailable: true }, order: { name: 'ASC' } });
    }
    async findQuincailleries() {
        return this.repo.find({ where: { merchantType: product_entity_1.MerchantType.QUINCAILLERIE, isAvailable: true }, order: { name: 'ASC' } });
    }
};
exports.CatalogService = CatalogService;
exports.CatalogService = CatalogService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.ProductEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CatalogService);
//# sourceMappingURL=catalog.service.js.map