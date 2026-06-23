import { ProductCategory, MerchantType } from '../entities/product.entity';
export declare class SearchCatalogDto {
    q?: string;
    category?: ProductCategory;
    merchantType?: MerchantType;
    merchantId?: string;
    minPrice?: number;
    maxPrice?: number;
}
export declare class CreateProductDto {
    name: string;
    description?: string;
    category: ProductCategory;
    priceXof: number;
    merchantId: string;
    merchantName: string;
    merchantType: MerchantType;
    imageUrls?: string[];
    unit?: string;
    stock?: number;
}
//# sourceMappingURL=catalog.dto.d.ts.map