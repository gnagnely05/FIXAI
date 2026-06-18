import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Artisan } from '../../artisans/entities/artisan.entity';

export enum DepannageStep {
  DESCRIPTION = 'DESCRIPTION',
  CATEGORY = 'CATEGORY',
  MODE = 'MODE',
  LOCATION = 'LOCATION',
  ARTISAN_SELECTION = 'ARTISAN_SELECTION',
  PAYMENT = 'PAYMENT',
  CONFIRMATION = 'CONFIRMATION',
}

export enum DepannageMode {
  URGENT = 'URGENT',
  PLANNED = 'PLANNED',
}

export enum DepannageStatus {
  DRAFT = 'DRAFT',
  SEARCHING = 'SEARCHING',
  ARTISAN_ASSIGNED = 'ARTISAN_ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
}

export enum EscrowStatus {
  NOT_FUNDED = 'NOT_FUNDED',
  FUNDED = 'FUNDED',
  RELEASED = 'RELEASED',
  REFUNDED = 'REFUNDED',
  DISPUTED = 'DISPUTED',
}

@Entity('depannage_requests')
export class DepannageRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'client_id' })
  client: User;

  @Column({ name: 'client_id' })
  clientId: string;

  @ManyToOne(() => Artisan, { eager: false, nullable: true })
  @JoinColumn({ name: 'artisan_id' })
  artisan: Artisan | null;

  @Column({ name: 'artisan_id', nullable: true })
  artisanId: string | null;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  category: string;

  @Column({ type: 'enum', enum: DepannageMode, nullable: true })
  mode: DepannageMode | null;

  @Column({ type: 'enum', enum: DepannageStep, default: DepannageStep.DESCRIPTION })
  currentStep: DepannageStep;

  @Column({ type: 'enum', enum: DepannageStatus, default: DepannageStatus.DRAFT })
  status: DepannageStatus;

  @Column({ nullable: true })
  address: string | null;

  @Column({ nullable: true })
  city: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number | null;

  @Column({ type: 'timestamp', nullable: true })
  scheduledAt: Date | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  escrowAmount: number;

  @Column({ type: 'enum', enum: EscrowStatus, default: EscrowStatus.NOT_FUNDED })
  escrowStatus: EscrowStatus;

  /** Extra fee charged for urgent mode (2000 FCFA) */
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  urgencyFee: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
