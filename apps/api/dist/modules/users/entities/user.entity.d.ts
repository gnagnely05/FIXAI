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