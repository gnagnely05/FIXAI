import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
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
}
//# sourceMappingURL=users.controller.d.ts.map