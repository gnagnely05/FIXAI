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
    /** Liste des agences / entreprises BTP auxquelles un artisan peut s'affilier. */
    findAgencies(): Promise<Array<{
        id: string;
        name: string;
        city?: string;
        role: string;
    }>>;
    updateProfile(id: string, updates: Partial<Pick<UserEntity, 'firstName' | 'lastName' | 'avatarUrl' | 'phone' | 'city' | 'address' | 'agencyName' | 'shopName' | 'specialty' | 'description' | 'payoutMethod' | 'payoutNumber'>>): Promise<UserEntity>;
    /**
     * Bascule le rôle actif entre CLIENT (compte standard) et un rôle pro déjà
     * activé. Les infos pro (spécialité, nom, documents) restent en base, donc
     * l'utilisateur peut revenir en mode pro sans rien ressaisir.
     */
    switchRole(id: string, role: UserRole): Promise<UserEntity>;
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
        contractAccepted?: boolean;
        agencyId?: string;
    }): Promise<UserEntity>;
}
//# sourceMappingURL=users.service.d.ts.map