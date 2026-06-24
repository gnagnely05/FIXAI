import { Repository } from 'typeorm';
import { ProductEntity } from './entities/product.entity';
import { SearchCatalogDto, CreateProductDto } from './dto/catalog.dto';
export declare class CatalogService {
    private readonly repo;
    constructor(repo: Repository<ProductEntity>);
    search(dto: SearchCatalogDto): Promise<ProductEntity[]>;
    findOne(id: string): Promise<ProductEntity>;
    findByMerchant(merchantId: string): Promise<ProductEntity[]>;
    create(dto: CreateProductDto): Promise<ProductEntity>;
    findBoutiques(): Promise<ProductEntity[]>;
    findQuincailleries(): Promise<ProductEntity[]>;
    findAllByMerchant(merchantId: string): Promise<ProductEntity[]>;
    update(id: string, merchantId: string, data: Partial<CreateProductDto>): Promise<ProductEntity>;
    setPromoted(id: string, merchantId: string, isPromoted: boolean, promotedUntil?: Date): Promise<ProductEntity>;
    remove(id: string, merchantId: string): Promise<void>;
}
//# sourceMappingURL=catalog.service.d.ts.map