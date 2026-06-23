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
    /** Required if role === ENTREPRISE_BTP */
    btpMode?: BtpMode;
    /** Document URLs (KYC) uploaded by the provider */
    documentUrls?: string[];
}
export {};
//# sourceMappingURL=register-provider.dto.d.ts.map