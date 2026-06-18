import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

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
}

export interface AuditLogEntry {
  action: string;
  timestamp: string;
  userId: string | null;
  details: Record<string, unknown>;
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id' })
  orderId: string;

  @Column({ type: 'enum', enum: OrderType })
  orderType: OrderType;

  /** Amount in FCFA (XOF). Stored as integer cents to avoid floating point errors. */
  @Column({ type: 'bigint' })
  amount: number;

  @Column({ default: 'XOF' })
  currency: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  /** CinetPay transaction_id returned after initiation */
  @Column({ name: 'cinetpay_transaction_id', nullable: true })
  cinetpayTransactionId: string | null;

  /** Payment URL to redirect / display to user */
  @Column({ name: 'payment_link', nullable: true, type: 'text' })
  paymentLink: string | null;

  @Column({ name: 'phone_number', nullable: true })
  phoneNumber: string | null;

  @Column({ name: 'released_at', type: 'timestamp', nullable: true })
  releasedAt: Date | null;

  @Column({ name: 'refunded_at', type: 'timestamp', nullable: true })
  refundedAt: Date | null;

  @Column({ name: 'released_by', nullable: true })
  releasedBy: string | null;

  @Column({ name: 'refund_reason', type: 'text', nullable: true })
  refundReason: string | null;

  /** Immutable audit trail — append-only, never mutate existing entries */
  @Column({ name: 'audit_log', type: 'jsonb', default: [] })
  auditLog: AuditLogEntry[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
