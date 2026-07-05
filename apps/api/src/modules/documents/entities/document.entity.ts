import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

export enum DocumentType {
  NATIONAL_ID              = 'NATIONAL_ID',
  PASSPORT                 = 'PASSPORT',
  SELFIE                   = 'SELFIE',
  RCCM                     = 'RCCM',
  STATUTS_SOCIETE          = 'STATUTS_SOCIETE',
  ATTESTATION_FISCALE      = 'ATTESTATION_FISCALE',
  CNI_REPRESENTANT         = 'CNI_REPRESENTANT',
  MOBILE_MONEY_PROOF       = 'MOBILE_MONEY_PROOF',
  JUSTIFICATIF_COMPETENCE  = 'JUSTIFICATIF_COMPETENCE',
  BUSINESS_LICENSE         = 'BUSINESS_LICENSE',
  INSURANCE                = 'INSURANCE',
  DIPLOMA                  = 'DIPLOMA',
  OTHER                    = 'OTHER',
}

export enum DocumentStatus {
  PENDING  = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('documents')
export class DocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ type: 'enum', enum: DocumentType })
  type: DocumentType;

  // Peut contenir une URL OU une image encodée en base64 (data URI) —
  // longtext car aucun stockage objet n'est configuré.
  @Column({ type: 'longtext' })
  fileUrl: string;

  @Column({ type: 'enum', enum: DocumentStatus, default: DocumentStatus.PENDING })
  status: DocumentStatus;

  @Column({ nullable: true })
  rejectionReason?: string;

  @CreateDateColumn()
  uploadedAt: Date;
}
