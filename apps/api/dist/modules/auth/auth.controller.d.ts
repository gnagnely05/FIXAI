import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterProviderDto } from './dto/register-provider.dto';
export declare class AuthController {
    private readonly authService;
    private readonly otpService;
    constructor(authService: AuthService, otpService: OtpService);
    sendOtp(body: {
        phone: string;
    }): Promise<{
        message: string;
    }>;
    verifyOtp(body: {
        phone: string;
        code: string;
    }): Promise<{
        verified: boolean;
    }>;
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            phone?: string;
            firstName: string;
            lastName: string;
            role: import("../../common/enums/user-role.enum").UserRole;
            verificationStatus: import("../../common/enums/verification-status.enum").VerificationStatus;
            btpMode?: import("../../common/enums/btp-mode.enum").BtpMode;
            agencyId?: string;
            agency?: import("../users/entities/user.entity").UserEntity;
            walletBalance: number;
            city?: string;
            specialty?: string;
            agencyName?: string;
            shopName?: string;
            address?: string;
            description?: string;
            payoutMethod?: string;
            payoutNumber?: string;
            radiusKm?: number;
            avatarUrl?: string;
            artisanProfile?: import("../artisans/entities/artisan.entity").ArtisanEntity;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    registerProvider(dto: RegisterProviderDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            phone?: string;
            firstName: string;
            lastName: string;
            role: import("../../common/enums/user-role.enum").UserRole;
            verificationStatus: import("../../common/enums/verification-status.enum").VerificationStatus;
            btpMode?: import("../../common/enums/btp-mode.enum").BtpMode;
            agencyId?: string;
            agency?: import("../users/entities/user.entity").UserEntity;
            walletBalance: number;
            city?: string;
            specialty?: string;
            agencyName?: string;
            shopName?: string;
            address?: string;
            description?: string;
            payoutMethod?: string;
            payoutNumber?: string;
            radiusKm?: number;
            avatarUrl?: string;
            artisanProfile?: import("../artisans/entities/artisan.entity").ArtisanEntity;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            phone?: string;
            firstName: string;
            lastName: string;
            role: import("../../common/enums/user-role.enum").UserRole;
            verificationStatus: import("../../common/enums/verification-status.enum").VerificationStatus;
            btpMode?: import("../../common/enums/btp-mode.enum").BtpMode;
            agencyId?: string;
            agency?: import("../users/entities/user.entity").UserEntity;
            walletBalance: number;
            city?: string;
            specialty?: string;
            agencyName?: string;
            shopName?: string;
            address?: string;
            description?: string;
            payoutMethod?: string;
            payoutNumber?: string;
            radiusKm?: number;
            avatarUrl?: string;
            artisanProfile?: import("../artisans/entities/artisan.entity").ArtisanEntity;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    logout(req: {
        user: {
            sub: string;
        };
    }): Promise<void>;
    refresh(body: {
        userId: string;
        refreshToken: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
}
//# sourceMappingURL=auth.controller.d.ts.map