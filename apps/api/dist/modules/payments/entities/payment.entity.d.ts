export declare enum PaymentStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}
export declare enum OrderType {
    DEPANNAGE = "DEPANNAGE",
    RENOVATION = "RENOVATION",
    ORDER = "ORDER"
}
export interface AuditLogEntry {
    action: string;
    timestamp: string;
    userId: string | null;
    details: Record<string, unknown>;
}
export declare class PaymentEntity {
    id: string;
    orderId: string;
    orderType: OrderType;
    amount: number;
    currency: string;
    provider: string;
    status: PaymentStatus;
    transactionId: string;
    cinetpayTransactionId: string;
    paymentLink: string;
    phoneNumber: string;
    releasedAt: Date;
    refundedAt: Date;
    releasedBy: string;
    refundReason: string;
    auditLog: AuditLogEntry[];
    createdAt: Date;
    updatedAt: Date;
}
export { PaymentEntity as Payment };
//# sourceMappingURL=payment.entity.d.ts.map