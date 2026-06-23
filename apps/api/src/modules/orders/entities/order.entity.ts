import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { ArtisanEntity } from '../../artisans/entities/artisan.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
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

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn()
  client: UserEntity;

  @ManyToOne(() => ArtisanEntity, (artisan) => artisan.orders)
  @JoinColumn()
  artisan: ArtisanEntity;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'timestamp' })
  scheduledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  escrowAmount: number;

  @Column({ type: 'enum', enum: EscrowStatus, default: EscrowStatus.NOT_FUNDED })
  escrowStatus: EscrowStatus;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ nullable: true })
  paymentTransactionId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
