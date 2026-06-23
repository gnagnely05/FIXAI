import { IsEmail, IsString, IsEnum, IsOptional, IsArray, IsUrl, MinLength } from 'class-validator';
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

  @IsOptional()
  radiusKm?: number;

  /** Required if role === ENTREPRISE_BTP */
  @IsEnum(BtpMode)
  @IsOptional()
  btpMode?: BtpMode;

  /** Document URLs (KYC) uploaded by the provider */
  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  documentUrls?: string[];
}
