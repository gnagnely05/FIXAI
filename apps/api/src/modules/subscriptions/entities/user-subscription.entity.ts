import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { SubscriptionPlanEntity } from './subscription-plan.entity';

export enum SubscriptionBilling {
  MONTHLY = 'MONTHLY',
  ANNUAL  = 'ANNUAL',
}

export enum SubscriptionState {
  ACTIVE    = 'ACTIVE',
  EXPIRED   = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

@Entity('user_subscriptions')
export class UserSubscriptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  planId: string;

  @Column({ type: 'enum', enum: SubscriptionBilling })
  billing: SubscriptionBilling;

  @Column({ type: 'enum', enum: SubscriptionState, default: SubscriptionState.ACTIVE })
  state: SubscriptionState;

  @Column({ type: 'timestamp' })
  startsAt: Date;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  /** Requêtes IA consommées sur la période courante */
  @Column({ default: 0 })
  aiRequestsUsed: number;

  /** Réinitialise à chaque renouvellement */
  @Column({ type: 'timestamp', nullable: true })
  lastResetAt: Date;

  /** Référence paiement CinetPay */
  @Column({ nullable: true })
  paymentRef: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => SubscriptionPlanEntity)
  @JoinColumn({ name: 'planId' })
  plan: SubscriptionPlanEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
