import { IsEmail, IsString, IsEnum, IsOptional, IsArray, IsNumber, MinLength } from 'class-validator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { BtpMode } from '../../../common/enums/btp-mode.enum';

const PROVIDER_ROLES = [
  UserRole.ARTISAN,
  UserRole.AGENCE_HOTE,
  UserRole.ENTREPRISE_BTP,
  UserRole.BOUTIQUE,
  UserRole.QUINCAILLERIE,
] as const;

export class RegisterProviderDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(PROVIDER_ROLES)
  role: (typeof PROVIDER_ROLES)[number];

  @IsString()
  @IsOptional()
  city?: string;

  @IsNumber()
  @IsOptional()
  radiusKm?: number;

  @IsEnum(BtpMode)
  @IsOptional()
  btpMode?: BtpMode;

  // Artisan
  @IsString()
  @IsOptional()
  specialty?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsNumber()
  @IsOptional()
  yearsOfExperience?: number;

  @IsNumber()
  @IsOptional()
  hourlyRate?: number;

  @IsString()
  @IsOptional()
  mobileMoneyNumber?: string;

  // Agence / Entreprise BTP
  @IsString()
  @IsOptional()
  agencyName?: string;

  @IsString()
  @IsOptional()
  description?: string;

  // Boutique / Quincaillerie
  @IsString()
  @IsOptional()
  shopName?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  catalogCategories?: string[];

  // Documents KYC: array of { type, url }
  @IsArray()
  @IsOptional()
  documents?: { type: string; url: string }[];
}
