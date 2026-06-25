import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
export declare class UsersController {
    private readonly usersService;
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
    }, body: Partial<Pick<UserEntity, 'firstName' | 'lastName' | 'avatarUrl'>>): Promise<UserEntity>;
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
        btpMode?: string;
        radiusKm?: number;
    }): Promise<UserEntity>;
}
//# sourceMappingURL=users.controller.d.ts.map