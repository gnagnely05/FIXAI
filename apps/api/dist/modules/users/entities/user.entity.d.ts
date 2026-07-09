import { UserRole } from '../../../common/enums/user-role.enum';
import { VerificationStatus } from '../../../common/enums/verification-status.enum';
import { BtpMode } from '../../../common/enums/btp-mode.enum';
import { ArtisanEntity } from '../../artisans/entities/artisan.entity';
export declare class UserEntity {
    id: string;
    email: string;
    phone?: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    verificationStatus: VerificationStatus;
    /** For ENTREPRISE_BTP: operating mode */
    btpMode?: BtpMode;
    /** For ARTISAN: the agency they are affiliated with */
    agencyId?: string;
    agency?: UserEntity;
    /** Wallet balance in XOF (used for escrow top-up) */
    walletBalance: number;
    city?: string;
    /** For ARTISAN: main specialty (ELECTRICITE, PLOMBERIE, …) */
    specialty?: string;
    /** For AGENCE_HOTE / ENTREPRISE_BTP: business name */
    agencyName?: string;
    /** For BOUTIQUE / QUINCAILLERIE: establishment name */
    shopName?: string;
    /** Physical address / intervention address */
    address?: string;
    /** Free-text description of the pro activity */
    description?: string;
    /** Payout account — mobile money operator (ORANGE_MONEY, MTN, MOOV, WAVE) */
    payoutMethod?: string;
    /** Payout account — phone number receiving the money */
    payoutNumber?: string;
    /** Date d'acceptation du contrat professionnel (null = non accepté) */
    proContractAcceptedAt?: Date;
    /** Service radius in km (for artisans/agencies) */
    radiusKm?: number;
    avatarUrl?: string;
    refreshToken?: string;
    artisanProfile?: ArtisanEntity;
    createdAt: Date;
    updatedAt: Date;
}
export { UserEntity as User };
//# sourceMappingURL=user.entity.d.ts.map