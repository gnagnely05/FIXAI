import { IsString, IsEnum, IsOptional, IsNumber, IsDateString, MinLength, IsLatitude, IsLongitude } from 'class-validator';
import { ArtisanSpecialty } from '../../artisans/entities/artisan.entity';
import { DepannageMode } from '../entities/depannage-request.entity';

export class CreateDepannageDto {
  @IsString()
  @MinLength(10)
  description: string;
}

export class StepCategoryDto {
  @IsEnum(ArtisanSpecialty)
  category: ArtisanSpecialty;
}

export class StepModeDto {
  @IsEnum(DepannageMode)
  mode: DepannageMode;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}

export class StepLocationDto {
  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;
}

export class StepArtisanDto {
  @IsString()
  artisanId: string;
}

export class StepPaymentDto {
  @IsNumber()
  amount: number;

  @IsString()
  phoneNumber: string;
}
