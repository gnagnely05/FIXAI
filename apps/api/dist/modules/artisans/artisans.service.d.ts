import { Repository } from 'typeorm';
import { ArtisanEntity, ArtisanSpecialty } from './entities/artisan.entity';
import { UserEntity } from '../users/entities/user.entity';
export interface ArtisanSearchQuery {
    specialty?: ArtisanSpecialty;
    city?: string;
    minRating?: number;
    maxHourlyRate?: number;
    isAvailable?: boolean;
    isVerified?: boolean;
    page?: number;
    limit?: number;
}
export declare class ArtisansService {
    private readonly artisansRepo;
    private readonly usersRepo;
    constructor(artisansRepo: Repository<ArtisanEntity>, usersRepo: Repository<UserEntity>);
    findAll(query: ArtisanSearchQuery): Promise<{
        artisans: ArtisanEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<ArtisanEntity>;
    updateAvailability(artisanId: string, isAvailable: boolean): Promise<void>;
    updateRating(artisanId: string, newRating: number, reviewCount: number): Promise<void>;
    getAvailability(userId: string): Promise<{
        isAvailable: boolean;
        availableDays: string[];
        availableSlots: string[];
    }>;
    updateAvailabilityByUser(userId: string, data: {
        isAvailable: boolean;
        availableDays?: string[];
        availableSlots?: string[];
    }): Promise<{
        message: string;
    }>;
    findByAgency(agencyUserId: string): Promise<ArtisanEntity[]>;
    private ensureOwnership;
    /** Valide un artisan affilié (passe à ACTIVE) */
    validateAffiliatedArtisan(artisanId: string, requesterUserId: string, requesterRole: string): Promise<{
        message: string;
    }>;
    /** Suspend un artisan affilié */
    suspendAffiliatedArtisan(artisanId: string, requesterUserId: string, requesterRole: string, reason?: string): Promise<{
        message: string;
    }>;
    /** Désaffilie un artisan (retire le lien agencyId) */
    removeFromAgency(artisanId: string, requesterUserId: string, requesterRole: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=artisans.service.d.ts.map