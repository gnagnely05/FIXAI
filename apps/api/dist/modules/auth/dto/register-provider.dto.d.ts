import { UserRole } from '../../../common/enums/user-role.enum';
import { BtpMode } from '../../../common/enums/btp-mode.enum';
declare const PROVIDER_ROLES: readonly [UserRole.ARTISAN, UserRole.AGENCE_HOTE, UserRole.ENTREPRISE_BTP, UserRole.BOUTIQUE, UserRole.QUINCAILLERIE];
export declare class RegisterProviderDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: (typeof PROVIDER_ROLES)[number];
    city?: string;
    radiusKm?: number;
    btpMode?: BtpMode;
    specialty?: string;
    bio?: string;
    yearsOfExperience?: number;
    hourlyRate?: number;
    mobileMoneyNumber?: string;
    agencyName?: string;
    description?: string;
    shopName?: string;
    address?: string;
    catalogCategories?: string[];
    documents?: {
        type: string;
        url: string;
    }[];
}
export {};
//# sourceMappingURL=register-provider.dto.d.ts.map