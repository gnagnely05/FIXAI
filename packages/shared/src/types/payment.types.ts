export enum PaymentProvider {
  CINETPAY = 'CINETPAY',
  ORANGE_MONEY = 'ORANGE_MONEY',
  MTN_MONEY = 'MTN_MONEY',
  WAVE = 'WAVE',
  MOOV_MONEY = 'MOOV_MONEY',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  transactionId?: string;
  phoneNumber: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface InitiatePaymentRequest {
  orderId: string;
  amount: number;
  provider: PaymentProvider;
  phoneNumber: string;
}

export interface PaymentResponse {
  paymentId: string;
  transactionId: string;
  status: PaymentStatus;
  message: string;
}
