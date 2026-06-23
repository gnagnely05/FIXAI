import { UserEntity } from '../../users/entities/user.entity';
import { ArtisanEntity, ArtisanSpecialty } from '../../artisans/entities/artisan.entity';
import { EscrowStatus } from '../../orders/entities/order.entity';
export declare enum DepannageMode {
    URGENT = "URGENT",
    PLANNED = "PLANNED"
}
/**
 * Statuts techniques complets selon le flux fonctionnel fixAI.
 * Chaque valeur correspond à un état précis du parcours client → artisan → paiement.
 */
export declare enum DepannageStatus {
    DIAGNOSIS_PENDING = "DIAGNOSIS_PENDING",
    DIAGNOSIS_DONE = "DIAGNOSIS_DONE",
    QUOTE_CONFIRMED = "QUOTE_CONFIRMED",
    TENDER_OPEN = "TENDER_OPEN",
    PROPOSAL_SUBMITTED = "PROPOSAL_SUBMITTED",
    PROPOSALS_RECEIVED = "PROPOSALS_RECEIVED",
    CHAT_OPEN = "CHAT_OPEN",
    URGENT_PENDING = "URGENT_PENDING",
    URGENT_CONFIRMED = "URGENT_CONFIRMED",
    SCHEDULED_CONFIRMED = "SCHEDULED_CONFIRMED",
    AGREEMENT_REACHED = "AGREEMENT_REACHED",
    PAYMENT_PENDING = "PAYMENT_PENDING",
    ACCOUNT_TOPPED_UP = "ACCOUNT_TOPPED_UP",
    FUNDS_HELD = "FUNDS_HELD",
    INTERVENTION_LOCKED = "INTERVENTION_LOCKED",
    INTERVENTION_COMPLETED = "INTERVENTION_COMPLETED",
    PAYMENT_RELEASED = "PAYMENT_RELEASED",
    PARTS_REQUESTED = "PARTS_REQUESTED",
    PARTS_DISPATCHED = "PARTS_DISPATCHED",
    CANCELLED = "CANCELLED",
    DISPUTED = "DISPUTED"
}
export interface ArtisanProposal {
    artisanId: string;
    artisanName: string;
    priceXof: number;
    estimatedDurationMin: number;
    submittedAt: string;
}
export interface DiagnosisReport {
    summary: string;
    estimatedPriceMinXof: number;
    estimatedPriceMaxXof: number;
    recommendedCategory: string;
    generatedAt: string;
}
export declare class DepannageRequestEntity {
    id: string;
    clientId: string;
    artisanId: string;
    description: string;
    photoUrls: string[];
    category: ArtisanSpecialty;
    mode: DepannageMode;
    status: DepannageStatus;
    scheduledAt: Date;
    address: string;
    city: string;
    latitude: number;
    longitude: number;
    diagnosisReport: DiagnosisReport;
    proposals: ArtisanProposal[];
    agreedPriceXof: number;
    urgencyFeeXof: number;
    escrowAmountXof: number;
    escrowStatus: EscrowStatus;
    /** Pièces à commander en boutique pour cette intervention */
    requiredPartIds: string[];
    client: UserEntity;
    artisan: ArtisanEntity;
    createdAt: Date;
    updatedAt: Date;
}
export { DepannageRequestEntity as DepannageRequest };
//# sourceMappingURL=depannage-request.entity.d.ts.map