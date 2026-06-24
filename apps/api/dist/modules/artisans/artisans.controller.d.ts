import { ArtisansService } from './artisans.service';
import { ArtisanSpecialty } from './entities/artisan.entity';
interface AuthUser {
    sub: string;
    role: string;
}
export declare class ArtisansController {
    private readonly artisansService;
    constructor(artisansService: ArtisansService);
    findAll(specialty?: ArtisanSpecialty, city?: string, minRating?: number, maxHourlyRate?: number, isAvailable?: boolean, isVerified?: boolean, page?: number, limit?: number): Promise<{
        artisans: import("./entities/artisan.entity").ArtisanEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    /** Artisans affiliés à l'agence/BTP connectée */
    getMyAgencyArtisans(req: {
        user: AuthUser;
    }): Promise<import("./entities/artisan.entity").ArtisanEntity[]>;
    getMyAvailability(req: {
        user: AuthUser;
    }): Promise<{
        isAvailable: boolean;
        availableDays: string[];
        availableSlots: string[];
    }>;
    updateMyAvailability(req: {
        user: AuthUser;
    }, body: {
        isAvailable: boolean;
        availableDays?: string[];
        availableSlots?: string[];
    }): Promise<{
        message: string;
    }>;
    findOne(id: string): Promise<import("./entities/artisan.entity").ArtisanEntity>;
    /** Valide un artisan affilié (AGENCE_HOTE, ENTREPRISE_BTP ou ADMIN) */
    validateArtisan(id: string, req: {
        user: AuthUser;
    }): Promise<{
        message: string;
    }>;
    /** Suspend un artisan affilié */
    suspendArtisan(id: string, body: {
        reason?: string;
    }, req: {
        user: AuthUser;
    }): Promise<{
        message: string;
    }>;
    /** Désaffilie (retire) un artisan de l'organisation */
    removeFromAgency(id: string, req: {
        user: AuthUser;
    }): Promise<{
        message: string;
    }>;
}
export {};
//# sourceMappingURL=artisans.controller.d.ts.map