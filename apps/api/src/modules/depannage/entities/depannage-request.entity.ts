import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { ArtisanEntity, ArtisanSpecialty } from '../../artisans/entities/artisan.entity';
import { EscrowStatus } from '../../orders/entities/order.entity';

export enum DepannageMode {
  URGENT  = 'URGENT',
  PLANNED = 'PLANNED',
}

/**
 * Statuts techniques complets selon le flux fonctionnel fixAI.
 * Chaque valeur correspond à un état précis du parcours client → artisan → paiement.
 */
export enum DepannageStatus {
  // Étape 1 — Diagnostic IA
  DIAGNOSIS_PENDING  = 'DIAGNOSIS_PENDING',
  DIAGNOSIS_DONE     = 'DIAGNOSIS_DONE',
  QUOTE_CONFIRMED    = 'QUOTE_CONFIRMED',

  // Étape 2 — Appel d'offre
  TENDER_OPEN        = 'TENDER_OPEN',

  // Étape 3 — Réponses artisans
  PROPOSAL_SUBMITTED = 'PROPOSAL_SUBMITTED',
  PROPOSALS_RECEIVED = 'PROPOSALS_RECEIVED',

  // Étape 4 — Sélection & mise en relation
  CHAT_OPEN          = 'CHAT_OPEN',

  // Étape 5 — Planification
  URGENT_PENDING     = 'URGENT_PENDING',
  URGENT_CONFIRMED   = 'URGENT_CONFIRMED',
  SCHEDULED_CONFIRMED= 'SCHEDULED_CONFIRMED',

  // Étape 6 — Paiement escrow
  AGREEMENT_REACHED   = 'AGREEMENT_REACHED',
  PAYMENT_PENDING     = 'PAYMENT_PENDING',
  ACCOUNT_TOPPED_UP   = 'ACCOUNT_TOPPED_UP',
  FUNDS_HELD          = 'FUNDS_HELD',
  INTERVENTION_LOCKED = 'INTERVENTION_LOCKED',
  INTERVENTION_COMPLETED = 'INTERVENTION_COMPLETED',
  PAYMENT_RELEASED    = 'PAYMENT_RELEASED',

  // Étape 7 — Pièces boutique
  PARTS_REQUESTED    = 'PARTS_REQUESTED',
  PARTS_DISPATCHED   = 'PARTS_DISPATCHED',

  // Terminaux
  CANCELLED          = 'CANCELLED',
  DISPUTED           = 'DISPUTED',
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

@Entity('depannage_requests')
export class DepannageRequestEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  clientId: string;

  @Column({ nullable: true })
  artisanId: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'simple-array', nullable: true })
  photoUrls: string[];

  @Column({ type: 'enum', enum: ArtisanSpecialty, nullable: true })
  category: ArtisanSpecialty;

  @Column({ type: 'enum', enum: DepannageMode, nullable: true })
  mode: DepannageMode;

  @Column({ type: 'enum', enum: DepannageStatus, default: DepannageStatus.DIAGNOSIS_PENDING })
  status: DepannageStatus;

  @Column({ type: 'timestamptz', nullable: true })
  scheduledAt: Date;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  longitude: number;

  @Column({ type: 'jsonb', nullable: true })
  diagnosisReport: DiagnosisReport;

  @Column({ type: 'jsonb', default: [] })
  proposals: ArtisanProposal[];

  @Column({ type: 'bigint', default: 0 })
  agreedPriceXof: number;

  @Column({ type: 'bigint', default: 0 })
  urgencyFeeXof: number;

  @Column({ type: 'bigint', default: 0 })
  escrowAmountXof: number;

  @Column({ type: 'enum', enum: EscrowStatus, default: EscrowStatus.NOT_FUNDED })
  escrowStatus: EscrowStatus;

  /** Pièces à commander en boutique pour cette intervention */
  @Column({ type: 'simple-array', nullable: true })
  requiredPartIds: string[];

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: 'clientId' })
  client: UserEntity;

  @ManyToOne(() => ArtisanEntity, { nullable: true })
  @JoinColumn({ name: 'artisanId' })
  artisan: ArtisanEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export { DepannageRequestEntity as DepannageRequest };
