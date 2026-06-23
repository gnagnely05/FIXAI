import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
export declare class UsersService {
    private readonly usersRepo;
    constructor(usersRepo: Repository<UserEntity>);
    findById(id: string): Promise<UserEntity>;
    findByEmail(email: string): Promise<UserEntity | null>;
    updateProfile(id: string, updates: Partial<Pick<UserEntity, 'firstName' | 'lastName' | 'avatarUrl'>>): Promise<UserEntity>;
    verifyUser(id: string): Promise<void>;
}
//# sourceMappingURL=users.service.d.ts.map