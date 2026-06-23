import { Repository } from 'typeorm';
import { ArtisanEntity, ArtisanSpecialty } from './entities/artisan.entity';
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
    constructor(artisansRepo: Repository<ArtisanEntity>);
    findAll(query: ArtisanSearchQuery): Promise<{
        artisans: ArtisanEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<ArtisanEntity>;
    updateAvailability(artisanId: string, isAvailable: boolean): Promise<void>;
    updateRating(artisanId: string, newRating: number, reviewCount: number): Promise<void>;
}
//# sourceMappingURL=artisans.service.d.ts.map