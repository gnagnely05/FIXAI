import { CatalogService } from './catalog.service';
import { SearchCatalogDto, CreateProductDto } from './dto/catalog.dto';
export declare class CatalogController {
    private readonly service;
    constructor(service: CatalogService);
    search(dto: SearchCatalogDto): Promise<import("./entities/product.entity").ProductEntity[]>;
    boutiques(): Promise<import("./entities/product.entity").ProductEntity[]>;
    quincailleries(): Promise<import("./entities/product.entity").ProductEntity[]>;
    findOne(id: string): Promise<import("./entities/product.entity").ProductEntity>;
    create(dto: CreateProductDto): Promise<import("./entities/product.entity").ProductEntity>;
}
//# sourceMappingURL=catalog.controller.d.ts.map