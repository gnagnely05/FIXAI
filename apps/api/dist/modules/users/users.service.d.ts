import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
export declare class UsersService {
    private readonly usersRepo;
    constructor(usersRepo: Repository<UserEntity>);
    findById(id: string): Promise<UserEntity>;
    findByEmail(email: string): Promise<UserEntity | null>;
    updateProfile(id: string, updates: Partial<Pick<UserEntity, 'firstName' | 'lastName' | 'avatarUrl'>>): Promise<UserEntity>;
    verifyUser(id: string): Promise<void>;
    upgradeToPro(id: string, data: {
        role: UserRole;
        city?: string;
        btpMode?: string;
        radiusKm?: number;
    }): Promise<UserEntity>;
}
//# sourceMappingURL=users.service.d.ts.map