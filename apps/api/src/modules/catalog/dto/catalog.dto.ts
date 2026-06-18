import { IsEnum, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductCategory, MerchantType } from '../entities/product.entity';

export class SearchCatalogDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @IsOptional()
  @IsEnum(MerchantType)
  merchantType?: MerchantType;

  @IsOptional()
  @IsString()
  merchantId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPrice?: number;
}

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ProductCategory)
  category: ProductCategory;

  @IsInt()
  @Min(0)
  priceXof: number;

  @IsString()
  merchantId: string;

  @IsString()
  merchantName: string;

  @IsEnum(MerchantType)
  merchantType: MerchantType;

  @IsOptional()
  @IsString({ each: true })
  imageUrls?: string[];

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;
}
