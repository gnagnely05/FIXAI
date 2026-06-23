import { UserEntity } from '../../users/entities/user.entity';
import { OrderEntity } from '../../orders/entities/order.entity';
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
export declare class ArtisanEntity {
    id: string;
    user: UserEntity;
    specialty: ArtisanSpecialty;
    bio: string;
    city: string;
    district: string;
    latitude: number;
    longitude: number;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    isAvailable: boolean;
    yearsOfExperience: number;
    hourlyRate: number;
    portfolioImages: string[];
    orders: OrderEntity[];
    createdAt: Date;
    updatedAt: Date;
}
export { ArtisanEntity as Artisan };
//# sourceMappingURL=artisan.entity.d.ts.map