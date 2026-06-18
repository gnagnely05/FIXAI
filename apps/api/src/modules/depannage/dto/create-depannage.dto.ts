import { IsString, IsEnum, IsOptional, IsNumber, IsDateString, MinLength } from 'class-validator';
import { DepannageMode } from '../entities/depannage-request.entity';

export class CreateDepannageDto {
  @IsString()
  @MinLength(20, { message: 'Décrivez le problème en au moins 20 caractères' })
  description: string;
}

export class SetCategoryDto {
  @IsString()
  category: string;
}

export class SetModeDto {
  @IsEnum(DepannageMode)
  mode: DepannageMode;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}

export class SetLocationDto {
  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class SelectArtisanDto {
  @IsString()
  artisanId: string;
}
