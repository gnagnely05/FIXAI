import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { DocumentEntity } from '../documents/entities/document.entity';
export declare class UsersService {
    private readonly usersRepo;
    private readonly docsRepo;
    constructor(usersRepo: Repository<UserEntity>, docsRepo: Repository<DocumentEntity>);
    findById(id: string): Promise<UserEntity>;
    findByEmail(email: string): Promise<UserEntity | null>;
    updateProfile(id: string, updates: Partial<Pick<UserEntity, 'firstName' | 'lastName' | 'avatarUrl' | 'phone' | 'city' | 'address' | 'agencyName' | 'shopName' | 'specialty' | 'description' | 'payoutMethod' | 'payoutNumber'>>): Promise<UserEntity>;
    verifyUser(id: string): Promise<void>;
    upgradeToPro(id: string, data: {
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
//# sourceMappingURL=users.service.d.ts.map