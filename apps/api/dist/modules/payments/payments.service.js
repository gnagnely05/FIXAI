"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const payment_entity_1 = require("./entities/payment.entity");
const commission_config_entity_1 = require("../admin/entities/commission-config.entity");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(paymentRepo, commissionRepo, dataSource) {
        this.paymentRepo = paymentRepo;
        this.commissionRepo = commissionRepo;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(PaymentsService_1.name);
        this.cinetpayApiKey = process.env.CINETPAY_API_KEY;
        this.cinetpaySiteId = process.env.CINETPAY_SITE_ID;
        this.cinetpaySecret = process.env.CINETPAY_SECRET;
        this.cinetpayBaseUrl = process.env.CINETPAY_BASE_URL ?? 'https://api-checkout.cinetpay.com/v2';
    }
    async getCommissionRate() {
        const config = await this.commissionRepo.findOne({ where: { isActive: true } });
        return config?.fixaiRate ?? 0.03;
    }
    /**
     * Calculates escrow fees for a given amount using DB-driven commission config.
     */
    async calculateFees(amount) {
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
    async initiateEscrow(dto) {
        if (dto.amount < 100)
            throw new common_1.BadRequestException('Montant minimum: 100 FCFA');
        if (dto.amount > 10_000_000)
            throw new common_1.BadRequestException('Montant maximum: 10 000 000 FCFA');
        const payment = this.paymentRepo.create({
            orderId: dto.orderId,
            orderType: dto.orderType,
            amount: dto.amount,
            currency: 'XOF',
            status: payment_entity_1.PaymentStatus.PENDING,
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
            const paymentLink = cinetpayResponse.data.payment_url;
            payment.cinetpayTransactionId = payment.id;
            payment.paymentLink = paymentLink;
            payment.status = payment_entity_1.PaymentStatus.PROCESSING;
            payment.auditLog = [...payment.auditLog, this.buildAuditEntry('CINETPAY_LINK_GENERATED', null, { paymentLink })];
            await this.paymentRepo.save(payment);
            this.logger.log(`Escrow initiated: paymentId=${payment.id}, amount=${dto.amount} XOF`);
            return { paymentId: payment.id, paymentLink };
        }
        catch (error) {
            payment.status = payment_entity_1.PaymentStatus.FAILED;
            payment.auditLog = [...payment.auditLog, this.buildAuditEntry('INITIATION_FAILED', null, { error: String(error) })];
            await this.paymentRepo.save(payment);
            this.logger.error(`Escrow initiation failed for order ${dto.orderId}: ${String(error)}`);
            throw new common_1.InternalServerErrorException('Impossible d\'initier le paiement. Veuillez réessayer.');
        }
    }
    /**
     * Step 2 — CinetPay webhook.
     * ⚠️ Verifies HMAC signature FIRST — never trust payload without verification.
     */
    async handleCinetPayWebhook(payload) {
        this.verifyCinetPaySignature(payload);
        const payment = await this.paymentRepo.findOne({ where: { id: payload.cpm_trans_id } });
        if (!payment) {
            this.logger.warn(`Webhook for unknown payment: ${payload.cpm_trans_id}`);
            return;
        }
        if (payment.status === payment_entity_1.PaymentStatus.COMPLETED) {
            this.logger.log(`Duplicate webhook ignored: ${payment.id}`);
            return;
        }
        const paidAmount = parseInt(payload.cpm_amount, 10);
        const paymentSucceeded = payload.cpm_error_message === 'SUCCES' || payload.cpm_error_message === '';
        if (paymentSucceeded) {
            if (paidAmount < payment.amount) {
                this.logger.error(`Amount mismatch: expected ${payment.amount}, got ${paidAmount}. paymentId=${payment.id}`);
                payment.status = payment_entity_1.PaymentStatus.FAILED;
                payment.auditLog = [...payment.auditLog, this.buildAuditEntry('WEBHOOK_AMOUNT_MISMATCH', null, { expected: payment.amount, received: paidAmount })];
                await this.paymentRepo.save(payment);
                return;
            }
            await this.fundEscrow(payment.id, payload.cpm_trans_id);
        }
        else {
            payment.status = payment_entity_1.PaymentStatus.FAILED;
            payment.auditLog = [...payment.auditLog, this.buildAuditEntry('PAYMENT_FAILED_WEBHOOK', null, { errorMessage: payload.cpm_error_message })];
            await this.paymentRepo.save(payment);
        }
    }
    /**
     * Step 3 — Fund escrow after verified webhook.
     * Uses DB transaction for atomicity.
     */
    async fundEscrow(paymentId, cinetpayTransactionId) {
        await this.dataSource.transaction(async (manager) => {
            const payment = await manager.findOne(payment_entity_1.Payment, { where: { id: paymentId } });
            if (!payment)
                throw new common_1.NotFoundException(`Payment ${paymentId} not found`);
            if (payment.status !== payment_entity_1.PaymentStatus.PROCESSING && payment.status !== payment_entity_1.PaymentStatus.PENDING) {
                this.logger.warn(`fundEscrow on ${payment.status} payment: ${paymentId}`);
                return;
            }
            payment.status = payment_entity_1.PaymentStatus.COMPLETED;
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
    async releaseEscrow(paymentId, releasedBy) {
        const fees = await this.dataSource.transaction(async (manager) => {
            const payment = await manager.findOne(payment_entity_1.Payment, { where: { id: paymentId } });
            if (!payment)
                throw new common_1.NotFoundException();
            if (payment.status !== payment_entity_1.PaymentStatus.COMPLETED) {
                throw new common_1.BadRequestException(`Impossible de libérer: état actuel ${payment.status} (COMPLETED requis)`);
            }
            if (payment.releasedAt) {
                throw new common_1.BadRequestException('Fonds déjà libérés');
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
    async refundEscrow(paymentId, refundedBy, reason) {
        await this.dataSource.transaction(async (manager) => {
            const payment = await manager.findOne(payment_entity_1.Payment, { where: { id: paymentId } });
            if (!payment)
                throw new common_1.NotFoundException();
            if (payment.status !== payment_entity_1.PaymentStatus.COMPLETED) {
                throw new common_1.BadRequestException(`Impossible de rembourser: état ${payment.status}`);
            }
            if (payment.refundedAt)
                throw new common_1.BadRequestException('Déjà remboursé');
            if (payment.releasedAt)
                throw new common_1.BadRequestException('Impossible de rembourser: fonds déjà libérés vers l\'artisan');
            payment.status = payment_entity_1.PaymentStatus.REFUNDED;
            payment.refundedAt = new Date();
            payment.refundReason = reason;
            payment.auditLog = [...payment.auditLog, this.buildAuditEntry('ESCROW_REFUNDED', refundedBy, { reason, amount: payment.amount })];
            await manager.save(payment);
        });
        this.logger.log(`Escrow refunded: paymentId=${paymentId}, reason=${reason}`);
        // TODO: déclencher le remboursement via CinetPay refund API
    }
    async getEscrowStatus(paymentId) {
        const payment = await this.paymentRepo.findOne({ where: { id: paymentId } });
        if (!payment)
            throw new common_1.NotFoundException();
        return payment;
    }
    async findByOrder(orderId) {
        return this.paymentRepo.find({ where: { orderId }, order: { createdAt: 'DESC' } });
    }
    /**
     * Verifies CinetPay webhook HMAC-SHA256 signature.
     * ⚠️ Throws if invalid — must be called before processing any webhook data.
     */
    verifyCinetPaySignature(payload) {
        const dataToSign = [
            payload.cpm_amount,
            payload.cpm_currency,
            payload.cpm_payment_config,
            payload.cpm_trans_date,
            payload.cpm_trans_id,
            payload.cpm_version,
            this.cinetpayApiKey,
        ].join('');
        const expected = (0, crypto_1.createHmac)('sha256', this.cinetpaySecret).update(dataToSign).digest('hex');
        if (expected !== payload.signature) {
            this.logger.error(`Invalid webhook signature for transaction ${payload.cpm_trans_id}`);
            throw new common_1.BadRequestException('Signature de webhook invalide');
        }
    }
    async callCinetPay(endpoint, body) {
        const response = await fetch(`${this.cinetpayBaseUrl}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!response.ok)
            throw new Error(`CinetPay HTTP ${response.status}: ${await response.text()}`);
        return response.json();
    }
    buildAuditEntry(action, userId, details) {
        return { action, timestamp: new Date().toISOString(), userId, details };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(1, (0, typeorm_1.InjectRepository)(commission_config_entity_1.CommissionConfigEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map