import { ArtisansService } from './artisans.service';
import { ArtisanSpecialty } from './entities/artisan.entity';
export declare class ArtisansController {
    private readonly artisansService;
    constructor(artisansService: ArtisansService);
    findAll(specialty?: ArtisanSpecialty, city?: string, minRating?: number, maxHourlyRate?: number, isAvailable?: boolean, isVerified?: boolean, page?: number, limit?: number): Promise<{
        artisans: import("./entities/artisan.entity").ArtisanEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<import("./entities/artisan.entity").ArtisanEntity>;
}
//# sourceMappingURL=artisans.controller.d.ts.map