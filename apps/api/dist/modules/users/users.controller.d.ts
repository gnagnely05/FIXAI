import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
export declare class UsersController {
    private readonly usersService;
    private readonly logger;
    constructor(usersService: UsersService);
    getProfile(req: {
        user: {
            sub: string;
        };
    }): Promise<UserEntity>;
    updateProfile(req: {
        user: {
            sub: string;
        };
    }, body: Partial<Pick<UserEntity, 'firstName' | 'lastName' | 'avatarUrl' | 'phone' | 'city' | 'address' | 'agencyName' | 'shopName' | 'specialty' | 'description' | 'payoutMethod' | 'payoutNumber'>>): Promise<UserEntity>;
    upgradeToPro(req: {
        user: {
            sub: string;
        };
    }, body: {
        role: UserRole;
        specialty?: string;
        city?: string;
        agencyName?: string;
        shopName?: string;
        address?: string;
        description?: string;
        btpMode?: string;
        radiusKm?: number;
        documents?: Array<{
            type: string;
            url: string;
        }>;
    }): Promise<UserEntity>;
}
//# sourceMappingURL=users.controller.d.ts.map