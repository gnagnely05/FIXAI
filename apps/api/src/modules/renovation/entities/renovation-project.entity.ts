import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { EscrowStatus } from '../../orders/entities/order.entity';

export enum ProjectType {
  CONSTRUCTION = 'CONSTRUCTION',
  RENOVATION    = 'RENOVATION',
  EXTENSION     = 'EXTENSION',
  FINISHING     = 'FINISHING',
  COMBINED      = 'COMBINED', // Rénovation + Décoration
}

/**
 * Flux fonctionnel Rénovation (BTP) :
 * Diagnostic IA → Appel d'offre → Propositions entreprises → Chat → Jalons → Escrow → Livraison
 */
export enum RenovationStatus {
  // Étape 1 — Diagnostic IA
  DIAGNOSIS_PENDING   = 'DIAGNOSIS_PENDING',
  DIAGNOSIS_DONE      = 'DIAGNOSIS_DONE',
  QUOTE_CONFIRMED     = 'QUOTE_CONFIRMED',

  // Étape 2 — Appel d'offre entreprises
  TENDER_OPEN         = 'TENDER_OPEN',

  // Étape 3 — Réponses entreprises
  PROPOSAL_SUBMITTED  = 'PROPOSAL_SUBMITTED',
  PROPOSALS_RECEIVED  = 'PROPOSALS_RECEIVED',

  // Étape 4 — Sélection & mise en relation
  CHAT_OPEN           = 'CHAT_OPEN',

  // Étape 5 — Validation devis final & jalons
  QUOTE_FINALIZED     = 'QUOTE_FINALIZED',
  MILESTONES_AGREED   = 'MILESTONES_AGREED',

  // Étape 6 — Escrow par jalon
  PAYMENT_PENDING     = 'PAYMENT_PENDING',
  FUNDS_HELD          = 'FUNDS_HELD',
  IN_PROGRESS         = 'IN_PROGRESS',
  MILESTONE_COMPLETED = 'MILESTONE_COMPLETED',
  MILESTONE_RELEASED  = 'MILESTONE_RELEASED',

  // Terminaux
  COMPLETED           = 'COMPLETED',
  CANCELLED           = 'CANCELLED',
  DISPUTED            = 'DISPUTED',
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

@Entity('renovation_projects')
export class RenovationProjectEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  clientId: string;

  @Column({ nullable: true })
  companyId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: ProjectType })
  projectType: ProjectType;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  longitude: number;

  @Column({ type: 'simple-array', nullable: true })
  photoUrls: string[];

  @Column({ type: 'enum', enum: RenovationStatus, default: RenovationStatus.DIAGNOSIS_PENDING })
  status: RenovationStatus;

  @Column({ type: 'jsonb', nullable: true })
  diagnosisReport: DiagnosisReport;

  @Column({ type: 'jsonb', default: [] })
  proposals: CompanyProposal[];

  /** Budget indicatif client (XOF entier) */
  @Column({ type: 'bigint', default: 0 })
  budgetXof: number;

  /** Prix final convenu avec l'entreprise (XOF entier) */
  @Column({ type: 'bigint', default: 0 })
  agreedPriceXof: number;

  /** Jalons de paiement */
  @Column({ type: 'jsonb', default: [] })
  milestones: Milestone[];

  /** Escrow total actuellement retenu */
  @Column({ type: 'bigint', default: 0 })
  escrowAmountXof: number;

  @Column({ type: 'enum', enum: EscrowStatus, default: EscrowStatus.NOT_FUNDED })
  escrowStatus: EscrowStatus;

  @Column({ type: 'simple-array', nullable: true })
  progressPhotos: string[];

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'clientId' })
  client: UserEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
