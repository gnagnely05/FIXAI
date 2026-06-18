import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ProjectType {
  CONSTRUCTION = 'CONSTRUCTION',
  RENOVATION = 'RENOVATION',
  EXTENSION = 'EXTENSION',
  FINISHING = 'FINISHING',
}

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  QUOTE_REQUESTED = 'QUOTE_REQUESTED',
  QUOTE_RECEIVED = 'QUOTE_RECEIVED',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
}

export enum EscrowStatus {
  NOT_FUNDED = 'NOT_FUNDED',
  FUNDED = 'FUNDED',
  PARTIALLY_RELEASED = 'PARTIALLY_RELEASED',
  RELEASED = 'RELEASED',
  REFUNDED = 'REFUNDED',
  DISPUTED = 'DISPUTED',
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  percentage: number;
  completedAt: string | null;
  paymentReleased: boolean;
}

@Entity('renovation_projects')
export class RenovationProject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'client_id' })
  client: User;

  @Column({ name: 'client_id' })
  clientId: string;

  @Column({ name: 'company_id', nullable: true })
  companyId: string | null;

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

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  budget: number | null;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  quotedAmount: number | null;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date | null;

  @Column({ type: 'enum', enum: ProjectStatus, default: ProjectStatus.DRAFT })
  status: ProjectStatus;

  @Column({ type: 'jsonb', default: [] })
  milestones: Milestone[];

  @Column({ type: 'simple-array', default: '' })
  progressPhotos: string[];

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  escrowAmount: number;

  @Column({ type: 'enum', enum: EscrowStatus, default: EscrowStatus.NOT_FUNDED })
  escrowStatus: EscrowStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
