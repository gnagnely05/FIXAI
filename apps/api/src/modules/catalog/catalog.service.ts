import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { ProductEntity, MerchantType } from './entities/product.entity';
import { SearchCatalogDto, CreateProductDto } from './dto/catalog.dto';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repo: Repository<ProductEntity>,
  ) {}

  async search(dto: SearchCatalogDto): Promise<ProductEntity[]> {
    const where: FindOptionsWhere<ProductEntity> = { isAvailable: true };
    if (dto.category) where.category = dto.category;
    if (dto.merchantType) where.merchantType = dto.merchantType;
    if (dto.merchantId) where.merchantId = dto.merchantId;

    let query = this.repo.createQueryBuilder('p').where('p.isAvailable = true');
    if (dto.q) query = query.andWhere('p.name ILIKE :q', { q: `%${dto.q}%` });
    if (dto.category) query = query.andWhere('p.category = :cat', { cat: dto.category });
    if (dto.merchantType) query = query.andWhere('p.merchantType = :mt', { mt: dto.merchantType });
    if (dto.merchantId) query = query.andWhere('p.merchantId = :mid', { mid: dto.merchantId });
    if (dto.minPrice != null) query = query.andWhere('p.priceXof >= :min', { min: dto.minPrice });
    if (dto.maxPrice != null) query = query.andWhere('p.priceXof <= :max', { max: dto.maxPrice });
    return query.orderBy('p.name', 'ASC').getMany();
  }

  async findOne(id: string): Promise<ProductEntity> {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  async findByMerchant(merchantId: string): Promise<ProductEntity[]> {
    return this.repo.find({ where: { merchantId, isAvailable: true }, order: { name: 'ASC' } });
  }

  async create(dto: CreateProductDto): Promise<ProductEntity> {
    const product = this.repo.create(dto);
    return this.repo.save(product);
  }

  async findBoutiques(): Promise<ProductEntity[]> {
    return this.repo.find({ where: { merchantType: MerchantType.BOUTIQUE, isAvailable: true }, order: { name: 'ASC' } });
  }

  async findQuincailleries(): Promise<ProductEntity[]> {
    return this.repo.find({ where: { merchantType: MerchantType.QUINCAILLERIE, isAvailable: true }, order: { name: 'ASC' } });
  }
}
