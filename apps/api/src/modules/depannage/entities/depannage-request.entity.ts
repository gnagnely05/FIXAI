import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { ArtisanEntity, ArtisanSpecialty } from '../../artisans/entities/artisan.entity';
import { OrderStatus, EscrowStatus } from '../../orders/entities/order.entity';

export enum DepannageMode {
  URGENT = 'URGENT',
  PLANNED = 'PLANNED',
}

export enum DepannageStep {
  DESCRIPTION = 'DESCRIPTION',
  CATEGORY = 'CATEGORY',
  MODE = 'MODE',
  LOCATION = 'LOCATION',
  ARTISAN_SELECTION = 'ARTISAN_SELECTION',
  PAYMENT = 'PAYMENT',
  CONFIRMATION = 'CONFIRMATION',
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

  @Column({ type: 'enum', enum: ArtisanSpecialty, nullable: true })
  category: ArtisanSpecialty;

  @Column({ type: 'enum', enum: DepannageMode, nullable: true })
  mode: DepannageMode;

  @Column({ type: 'enum', enum: DepannageStep, default: DepannageStep.DESCRIPTION })
  currentStep: DepannageStep;

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

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  escrowAmount: number;

  @Column({ type: 'enum', enum: EscrowStatus, default: EscrowStatus.NOT_FUNDED })
  escrowStatus: EscrowStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  urgencyFee: number;

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
