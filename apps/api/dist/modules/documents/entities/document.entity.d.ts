import { UserEntity } from '../../users/entities/user.entity';
export declare enum DocumentType {
    NATIONAL_ID = "NATIONAL_ID",
    PASSPORT = "PASSPORT",
    SELFIE = "SELFIE",
    RCCM = "RCCM",
    STATUTS_SOCIETE = "STATUTS_SOCIETE",
    ATTESTATION_FISCALE = "ATTESTATION_FISCALE",
    CNI_REPRESENTANT = "CNI_REPRESENTANT",
    MOBILE_MONEY_PROOF = "MOBILE_MONEY_PROOF",
    JUSTIFICATIF_COMPETENCE = "JUSTIFICATIF_COMPETENCE",
    BUSINESS_LICENSE = "BUSINESS_LICENSE",
    INSURANCE = "INSURANCE",
    DIPLOMA = "DIPLOMA",
    OTHER = "OTHER"
}
export declare enum DocumentStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}
export declare class DocumentEntity {
    id: string;
    userId: string;
    user: UserEntity;
    type: DocumentType;
    fileUrl: string;
    status: DocumentStatus;
    rejectionReason?: string;
    uploadedAt: Date;
}
//# sourceMappingURL=document.entity.d.ts.map