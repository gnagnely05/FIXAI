import {
  Injectable, BadRequestException, NotFoundException,
  Logger, InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { createHmac } from 'crypto';
import { Payment, PaymentStatus, OrderType, AuditLogEntry } from './entities/payment.entity';
import { CommissionConfigEntity } from '../admin/entities/commission-config.entity';

// ⚠️ ZONE CRITIQUE — Toute modification de ce fichier doit être relue et validée par un humain
//    avant déploiement en production. Chaque changement affecte de l'argent réel.

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

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  private readonly cinetpayApiKey = process.env.CINETPAY_API_KEY!;
  private readonly cinetpaySiteId = process.env.CINETPAY_SITE_ID!;
  private readonly cinetpaySecret = process.env.CINETPAY_SECRET!;
  private readonly cinetpayBaseUrl = process.env.CINETPAY_BASE_URL ?? 'https://api-checkout.cinetpay.com/v2';

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(CommissionConfigEntity)
    private readonly commissionRepo: Repository<CommissionConfigEntity>,
    private readonly dataSource: DataSource,
  ) {}

  private async getCommissionRate(): Promise<number> {
    const config = await this.commissionRepo.findOne({ where: { isActive: true } });
    return config?.fixaiRate ?? 0.03;
  }

  /**
   * Calculates escrow fees for a given amount using DB-driven commission config.
   */
  async calculateFees(amount: number): Promise<EscrowFees> {
    const rate = await this.getCommissionRate();
    const commission = Math.round(amount * rate);
    return {
      totalAmount: amount,
      artisanAmount: amount - commission,
      commission,
      commissionRate: rate,
    };
  }

  /**
   * Step 1 — Client initiates payment.
   * Creates a Payment record (PENDING), calls CinetPay, returns payment link.
   * Funds are NOT in escrow until webhook confirms (see handleCinetPayWebhook).
   */
  async initiateEscrow(dto: InitiateEscrowDto): Promise<{ paymentId: string; paymentLink: string }> {
    if (dto.amount < 100) throw new BadRequestException('Montant minimum: 100 FCFA');
    if (dto.amount > 10_000_000) throw new BadRequestException('Montant maximum: 10 000 000 FCFA');

    const payment = this.paymentRepo.create({
      orderId: dto.orderId,
      orderType: dto.orderType,
      amount: dto.amount,
      currency: 'XOF',
      status: PaymentStatus.PENDING,
      phoneNumber: dto.phoneNumber,
      auditLog: [this.buildAuditEntry('INITIATION_REQUESTED', null, { amount: dto.amount })],
    });
    await this.paymentRepo.save(payment);

    try {
      const cinetpayResponse = await this.callCinetPay('/payment', {
        apikey: this.cinetpayApiKey,
        site_id: this.cinetpaySiteId,
        transaction_id: payment.id,
        amount: dto.amount,
        currency: 'XOF',
        alternative_currency: '',
        description: `FixAI escrow ${dto.orderType} #${dto.orderId}`,
        customer_id: dto.orderId,
        customer_name: dto.customerName,
        customer_surname: '',
        customer_email: dto.customerEmail,
        customer_phone_number: dto.customerPhone,
        customer_address: 'Abidjan, CI',
        customer_city: 'Abidjan',
        customer_country: 'CI',
        customer_state: 'CI',
        customer_zip_code: '00000',
        notify_url: `${process.env.API_BASE_URL}/payments/webhook`,
        return_url: `${process.env.APP_BASE_URL}/payment-result`,
        channels: 'ALL',
        metadata: JSON.stringify({ paymentId: payment.id }),
        lang: 'fr',
        invoice_data: {},
      });

      if (cinetpayResponse.code !== '201') {
        throw new Error(`CinetPay: ${cinetpayResponse.message}`);
      }

      const paymentLink: string = cinetpayResponse.data.payment_url;
      payment.cinetpayTransactionId = payment.id;
      payment.paymentLink = paymentLink;
      payment.status = PaymentStatus.PROCESSING;
      payment.auditLog = [...payment.auditLog, this.buildAuditEntry('CINETPAY_LINK_GENERATED', null, { paymentLink })];
      await this.paymentRepo.save(payment);

      this.logger.log(`Escrow initiated: paymentId=${payment.id}, amount=${dto.amount} XOF`);
      return { paymentId: payment.id, paymentLink };
    } catch (error: unknown) {
      payment.status = PaymentStatus.FAILED;
      payment.auditLog = [...payment.auditLog, this.buildAuditEntry('INITIATION_FAILED', null, { error: String(error) })];
      await this.paymentRepo.save(payment);
      this.logger.error(`Escrow initiation failed for order ${dto.orderId}: ${String(error)}`);
      throw new InternalServerErrorException('Impossible d\'initier le paiement. Veuillez réessayer.');
    }
  }

  /**
   * Step 2 — CinetPay webhook.
   * ⚠️ Verifies HMAC signature FIRST — never trust payload without verification.
   */
  async handleCinetPayWebhook(payload: CinetPayWebhookPayload): Promise<void> {
    this.verifyCinetPaySignature(payload);

    const payment = await this.paymentRepo.findOne({ where: { id: payload.cpm_trans_id } });
    if (!payment) {
      this.logger.warn(`Webhook for unknown payment: ${payload.cpm_trans_id}`);
      return;
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      this.logger.log(`Duplicate webhook ignored: ${payment.id}`);
      return;
    }

    const paidAmount = parseInt(payload.cpm_amount, 10);
    const paymentSucceeded = payload.cpm_error_message === 'SUCCES' || payload.cpm_error_message === '';

    if (paymentSucceeded) {
      if (paidAmount < payment.amount) {
        this.logger.error(`Amount mismatch: expected ${payment.amount}, got ${paidAmount}. paymentId=${payment.id}`);
        payment.status = PaymentStatus.FAILED;
        payment.auditLog = [...payment.auditLog, this.buildAuditEntry('WEBHOOK_AMOUNT_MISMATCH', null, { expected: payment.amount, received: paidAmount })];
        await this.paymentRepo.save(payment);
        return;
      }
      await this.fundEscrow(payment.id, payload.cpm_trans_id);
    } else {
      payment.status = PaymentStatus.FAILED;
      payment.auditLog = [...payment.auditLog, this.buildAuditEntry('PAYMENT_FAILED_WEBHOOK', null, { errorMessage: payload.cpm_error_message })];
      await this.paymentRepo.save(payment);
    }
  }

  /**
   * Step 3 — Fund escrow after verified webhook.
   * Uses DB transaction for atomicity.
   */
  async fundEscrow(paymentId: string, cinetpayTransactionId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const payment = await manager.findOne(Payment, { where: { id: paymentId } });
      if (!payment) throw new NotFoundException(`Payment ${paymentId} not found`);

      if (payment.status !== PaymentStatus.PROCESSING && payment.status !== PaymentStatus.PENDING) {
        this.logger.warn(`fundEscrow on ${payment.status} payment: ${paymentId}`);
        return;
      }

      payment.status = PaymentStatus.COMPLETED;
      payment.cinetpayTransactionId = cinetpayTransactionId;
      payment.auditLog = [...payment.auditLog, this.buildAuditEntry('ESCROW_FUNDED', null, { cinetpayTransactionId })];
      await manager.save(payment);
    });
    this.logger.log(`Escrow funded: paymentId=${paymentId}`);
  }

  /**
   * Step 4 — Release funds to artisan after service validation.
   * Deducts 5% commission. Full audit trail.
   * ⚠️ Actual payout to artisan must be done separately (CinetPay payout API or manual).
   */
  async releaseEscrow(paymentId: string, releasedBy: string): Promise<EscrowFees> {
    const fees = await this.dataSource.transaction(async (manager) => {
      const payment = await manager.findOne(Payment, { where: { id: paymentId } });
      if (!payment) throw new NotFoundException();

      if (payment.status !== PaymentStatus.COMPLETED) {
        throw new BadRequestException(`Impossible de libérer: état actuel ${payment.status} (COMPLETED requis)`);
      }
      if (payment.releasedAt) {
        throw new BadRequestException('Fonds déjà libérés');
      }

      const calculatedFees = await this.calculateFees(payment.amount);
      payment.releasedAt = new Date();
      payment.releasedBy = releasedBy;
      payment.auditLog = [...payment.auditLog, this.buildAuditEntry('ESCROW_RELEASED', releasedBy, { artisanAmount: calculatedFees.artisanAmount, commission: calculatedFees.commission })];
      await manager.save(payment);
      return calculatedFees;
    });

    this.logger.log(`Escrow released: paymentId=${paymentId}, artisanAmount=${fees.artisanAmount}, by=${releasedBy}`);
    // TODO: déclencher le virement vers l'artisan via CinetPay payout API
    return fees;
  }

  /**
   * Step 4 (alt) — Refund to client.
   * Full refund — no commission retained.
   * ⚠️ Cannot refund if funds already released to artisan.
   */
  async refundEscrow(paymentId: string, refundedBy: string, reason: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const payment = await manager.findOne(Payment, { where: { id: paymentId } });
      if (!payment) throw new NotFoundException();

      if (payment.status !== PaymentStatus.COMPLETED) {
        throw new BadRequestException(`Impossible de rembourser: état ${payment.status}`);
      }
      if (payment.refundedAt) throw new BadRequestException('Déjà remboursé');
      if (payment.releasedAt) throw new BadRequestException('Impossible de rembourser: fonds déjà libérés vers l\'artisan');

      payment.status = PaymentStatus.REFUNDED;
      payment.refundedAt = new Date();
      payment.refundReason = reason;
      payment.auditLog = [...payment.auditLog, this.buildAuditEntry('ESCROW_REFUNDED', refundedBy, { reason, amount: payment.amount })];
      await manager.save(payment);
    });

    this.logger.log(`Escrow refunded: paymentId=${paymentId}, reason=${reason}`);
    // TODO: déclencher le remboursement via CinetPay refund API
  }

  async getEscrowStatus(paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException();
    return payment;
  }

  async findByOrder(orderId: string): Promise<Payment[]> {
    return this.paymentRepo.find({ where: { orderId }, order: { createdAt: 'DESC' } });
  }

  /**
   * Verifies CinetPay webhook HMAC-SHA256 signature.
   * ⚠️ Throws if invalid — must be called before processing any webhook data.
   */
  private verifyCinetPaySignature(payload: CinetPayWebhookPayload): void {
    const dataToSign = [
      payload.cpm_amount,
      payload.cpm_currency,
      payload.cpm_payment_config,
      payload.cpm_trans_date,
      payload.cpm_trans_id,
      payload.cpm_version,
      this.cinetpayApiKey,
    ].join('');

    const expected = createHmac('sha256', this.cinetpaySecret).update(dataToSign).digest('hex');

    if (expected !== payload.signature) {
      this.logger.error(`Invalid webhook signature for transaction ${payload.cpm_trans_id}`);
      throw new BadRequestException('Signature de webhook invalide');
    }
  }

  private async callCinetPay(endpoint: string, body: Record<string, unknown>): Promise<any> {
    const response = await fetch(`${this.cinetpayBaseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`CinetPay HTTP ${response.status}: ${await response.text()}`);
    return response.json();
  }

  private buildAuditEntry(action: string, userId: string | null, details: Record<string, unknown>): AuditLogEntry {
    return { action, timestamp: new Date().toISOString(), userId, details };
  }
}
