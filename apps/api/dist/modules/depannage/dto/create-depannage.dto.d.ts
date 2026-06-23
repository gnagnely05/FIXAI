import { ArtisanSpecialty } from '../../artisans/entities/artisan.entity';
import { DepannageMode } from '../entities/depannage-request.entity';
export declare class CreateDepannageDto {
    description: string;
}
export declare class StepCategoryDto {
    category: ArtisanSpecialty;
}
export declare class StepModeDto {
    mode: DepannageMode;
    scheduledAt?: string;
}
export declare class StepLocationDto {
    address: string;
    city: string;
    latitude?: number;
    longitude?: number;
}
export declare class StepArtisanDto {
    artisanId: string;
}
export declare class StepPaymentDto {
    amount: number;
    phoneNumber: string;
}
//# sourceMappingURL=create-depannage.dto.d.ts.map