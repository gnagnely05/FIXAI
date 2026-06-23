import { Repository, DataSource } from 'typeorm';
import { Payment, OrderType } from './entities/payment.entity';
import { CommissionConfigEntity } from '../admin/entities/commission-config.entity';
export interface InitiateEscrowDto {
    orderId: string;
    orderType: OrderType;
    amount: number;
    phoneNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
}
export interface EscrowFees {
    totalAmount: number;
    artisanAmount: number;
    commission: number;
    commissionRate: number;
}
export interface CinetPayWebhookPayload {
    cpm_trans_id: string;
    cpm_site_id: string;
    cpm_trans_date: string;
    cpm_amount: string;
    cpm_currency: string;
    signature: string;
    payment_method: string;
    cel_phone_num: string;
    cpm_phone_prefixe: string;
    cpm_language: string;
    cpm_version: string;
    cpm_payment_config: string;
    cpm_page_action: string;
    cpm_custom: string;
    cpm_designation: string;
    cpm_error_message: string;
}
export declare class PaymentsService {
    private readonly paymentRepo;
    private readonly commissionRepo;
    private readonly dataSource;
    private readonly logger;
    private readonly cinetpayApiKey;
    private readonly cinetpaySiteId;
    private readonly cinetpaySecret;
    private readonly cinetpayBaseUrl;
    constructor(paymentRepo: Repository<Payment>, commissionRepo: Repository<CommissionConfigEntity>, dataSource: DataSource);
    private getCommissionRate;
    /**
     * Calculates escrow fees for a given amount using DB-driven commission config.
     */
    calculateFees(amount: number): Promise<EscrowFees>;
    /**
     * Step 1 — Client initiates payment.
     * Creates a Payment record (PENDING), calls CinetPay, returns payment link.
     * Funds are NOT in escrow until webhook confirms (see handleCinetPayWebhook).
     */
    initiateEscrow(dto: InitiateEscrowDto): Promise<{
        paymentId: string;
        paymentLink: string;
    }>;
    /**
     * Step 2 — CinetPay webhook.
     * ⚠️ Verifies HMAC signature FIRST — never trust payload without verification.
     */
    handleCinetPayWebhook(payload: CinetPayWebhookPayload): Promise<void>;
    /**
     * Step 3 — Fund escrow after verified webhook.
     * Uses DB transaction for atomicity.
     */
    fundEscrow(paymentId: string, cinetpayTransactionId: string): Promise<void>;
    /**
     * Step 4 — Release funds to artisan after service validation.
     * Deducts 5% commission. Full audit trail.
     * ⚠️ Actual payout to artisan must be done separately (CinetPay payout API or manual).
     */
    releaseEscrow(paymentId: string, releasedBy: string): Promise<EscrowFees>;
    /**
     * Step 4 (alt) — Refund to client.
     * Full refund — no commission retained.
     * ⚠️ Cannot refund if funds already released to artisan.
     */
    refundEscrow(paymentId: string, refundedBy: string, reason: string): Promise<void>;
    getEscrowStatus(paymentId: string): Promise<Payment>;
    findByOrder(orderId: string): Promise<Payment[]>;
    /**
     * Verifies CinetPay webhook HMAC-SHA256 signature.
     * ⚠️ Throws if invalid — must be called before processing any webhook data.
     */
    private verifyCinetPaySignature;
    private callCinetPay;
    private buildAuditEntry;
}
//# sourceMappingURL=payments.service.d.ts.map