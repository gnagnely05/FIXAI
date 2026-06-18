import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { EscrowStatus } from '../../orders/entities/order.entity';

export enum ProjectType {
  CONSTRUCTION = 'CONSTRUCTION',
  RENOVATION = 'RENOVATION',
  EXTENSION = 'EXTENSION',
  FINISHING = 'FINISHING',
}

export enum RenovationStatus {
  DRAFT = 'DRAFT',
  QUOTE_REQUESTED = 'QUOTE_REQUESTED',
  QUOTE_RECEIVED = 'QUOTE_RECEIVED',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completedAt?: string;
  amount: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
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

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  budget: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  quotedAmount: number;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'enum', enum: RenovationStatus, default: RenovationStatus.DRAFT })
  status: RenovationStatus;

  @Column({ type: 'jsonb', default: [] })
  milestones: Milestone[];

  @Column({ type: 'simple-array', nullable: true })
  progressPhotos: string[];

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  escrowAmount: number;

  @Column({ type: 'enum', enum: EscrowStatus, default: EscrowStatus.NOT_FUNDED })
  escrowStatus: EscrowStatus;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'clientId' })
  client: UserEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
