import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum OrderType {
  DEPANNAGE = 'DEPANNAGE',
  RENOVATION = 'RENOVATION',
  ORDER = 'ORDER',
}

export interface AuditLogEntry {
  action: string;
  timestamp: string;
  userId: string;
  details: Record<string, unknown>;
}

@Entity('payments')
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderId: string;

  @Column({ type: 'enum', enum: OrderType, default: OrderType.DEPANNAGE })
  orderType: OrderType;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: number;

  @Column({ default: 'XOF' })
  currency: string;

  @Column({ default: 'CINETPAY' })
  provider: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ nullable: true })
  transactionId: string;

  @Column({ nullable: true })
  cinetpayTransactionId: string;

  @Column({ type: 'text', nullable: true })
  paymentLink: string;

  @Column()
  phoneNumber: string;

  @Column({ type: 'timestamptz', nullable: true })
  releasedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  refundedAt: Date;

  @Column({ nullable: true })
  releasedBy: string;

  @Column({ type: 'text', nullable: true })
  refundReason: string;

  @Column({ type: 'jsonb', default: [] })
  auditLog: AuditLogEntry[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// Alias for backward compat
export { PaymentEntity as Payment };
