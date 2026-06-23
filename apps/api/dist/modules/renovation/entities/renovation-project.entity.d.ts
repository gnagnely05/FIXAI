import { UserEntity } from '../../users/entities/user.entity';
import { EscrowStatus } from '../../orders/entities/order.entity';
export declare enum ProjectType {
    CONSTRUCTION = "CONSTRUCTION",
    RENOVATION = "RENOVATION",
    EXTENSION = "EXTENSION",
    FINISHING = "FINISHING",
    COMBINED = "COMBINED"
}
/**
 * Flux fonctionnel Rénovation (BTP) :
 * Diagnostic IA → Appel d'offre → Propositions entreprises → Chat → Jalons → Escrow → Livraison
 */
export declare enum RenovationStatus {
    DIAGNOSIS_PENDING = "DIAGNOSIS_PENDING",
    DIAGNOSIS_DONE = "DIAGNOSIS_DONE",
    QUOTE_CONFIRMED = "QUOTE_CONFIRMED",
    TENDER_OPEN = "TENDER_OPEN",
    PROPOSAL_SUBMITTED = "PROPOSAL_SUBMITTED",
    PROPOSALS_RECEIVED = "PROPOSALS_RECEIVED",
    CHAT_OPEN = "CHAT_OPEN",
    QUOTE_FINALIZED = "QUOTE_FINALIZED",
    MILESTONES_AGREED = "MILESTONES_AGREED",
    PAYMENT_PENDING = "PAYMENT_PENDING",
    FUNDS_HELD = "FUNDS_HELD",
    IN_PROGRESS = "IN_PROGRESS",
    MILESTONE_COMPLETED = "MILESTONE_COMPLETED",
    MILESTONE_RELEASED = "MILESTONE_RELEASED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    DISPUTED = "DISPUTED"
}
export interface CompanyProposal {
    companyId: string;
    companyName: string;
    totalPriceXof: number;
    durationDays: number;
    notes?: string;
    submittedAt: string;
}
export interface DiagnosisReport {
    summary: string;
    estimatedPriceMinXof: number;
    estimatedPriceMaxXof: number;
    recommendedProjectType: string;
    keyRisks: string[];
    generatedAt: string;
}
export interface Milestone {
    id: string;
    title: string;
    description: string;
    amountXof: number;
    dueDate: string;
    completedAt?: string;
    releasedAt?: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'RELEASED';
}
export declare class RenovationProjectEntity {
    id: string;
    clientId: string;
    companyId: string;
    title: string;
    description: string;
    projectType: ProjectType;
    address: string;
    city: string;
    latitude: number;
    longitude: number;
    photoUrls: string[];
    status: RenovationStatus;
    diagnosisReport: DiagnosisReport;
    proposals: CompanyProposal[];
    /** Budget indicatif client (XOF entier) */
    budgetXof: number;
    /** Prix final convenu avec l'entreprise (XOF entier) */
    agreedPriceXof: number;
    /** Jalons de paiement */
    milestones: Milestone[];
    /** Escrow total actuellement retenu */
    escrowAmountXof: number;
    escrowStatus: EscrowStatus;
    progressPhotos: string[];
    startDate: Date;
    endDate: Date;
    client: UserEntity;
    createdAt: Date;
    updatedAt: Date;
}
export { RenovationProjectEntity as RenovationProject };
//# sourceMappingURL=renovation-project.entity.d.ts.map