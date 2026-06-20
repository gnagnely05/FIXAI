import { User } from './user.types';
export declare enum ArtisanSpecialty {
    PLOMBERIE = "PLOMBERIE",
    ELECTRICITE = "ELECTRICITE",
    MACONNERIE = "MACONNERIE",
    MENUISERIE = "MENUISERIE",
    PEINTURE = "PEINTURE",
    DECORATION = "DECORATION",
    CARRELAGE = "CARRELAGE",
    CLIMATISATION = "CLIMATISATION",
    TOITURE = "TOITURE",
    FERRONNERIE = "FERRONNERIE"
}
export interface ArtisanLocation {
    city: string;
    district: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}
export interface Artisan {
    id: string;
    user: User;
    specialty: ArtisanSpecialty;
    bio: string;
    location: ArtisanLocation;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    isAvailable: boolean;
    yearsOfExperience: number;
    hourlyRate: number;
    portfolioImages: string[];
    createdAt: Date;
    updatedAt: Date;
}
export interface ArtisanSearchFilters {
    specialty?: ArtisanSpecialty;
    city?: string;
    minRating?: number;
    maxHourlyRate?: number;
    isAvailable?: boolean;
    isVerified?: boolean;
}
//# sourceMappingURL=artisan.types.d.ts.map