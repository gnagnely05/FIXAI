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
}
//# sourceMappingURL=catalog.service.d.ts.map