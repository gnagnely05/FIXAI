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

  /** Type de service : DEPANNAGE | RENOVATION | DECORATION */
  @Column({ nullable: true })
  serviceType?: string;

  /** True si cette commande est une mission de diagnostic sur place. */
  @Column({ default: false })
  isDiagnostic: boolean;

  /** Frais du diagnostic (déduit du devis final si le client confirme la réparation). */
  @Column({ type: 'int', default: 0 })
  diagnosticFeeXof: number;

  /** Constat rédigé par l'artisan après inspection. */
  @Column({ type: 'text', nullable: true })
  diagnosticResult?: string;

  /** Devis final établi par l'IA à partir du constat de l'artisan. */
  @Column({ type: 'int', nullable: true })
  finalQuoteXof?: number;

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

  /**
   * ID de l'agence/BTP qui gère le litige.
   * Alimenté automatiquement à la mise en DISPUTED depuis l'agencyId de l'artisan.
   * Si null → litige géré par l'admin fixAI.
   */
  @Column({ nullable: true })
  disputeHandlerId?: string;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'disputeHandlerId' })
  disputeHandler?: UserEntity;

  @Column({ type: 'text', nullable: true })
  disputeReason?: string;

  @Column({ type: 'text', nullable: true })
  disputeResolution?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
