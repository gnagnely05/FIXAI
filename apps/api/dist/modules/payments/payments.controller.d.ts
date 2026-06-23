import { PaymentsService, InitiateEscrowDto, CinetPayWebhookPayload } from './payments.service';
export declare class PaymentsController {
    private readonly service;
    constructor(service: PaymentsService);
    initiate(dto: InitiateEscrowDto): Promise<{
        paymentId: string;
        paymentLink: string;
    }>;
    /** CinetPay webhook — public endpoint, no JWT. Signature verified inside service. */
    webhook(payload: CinetPayWebhookPayload): Promise<void>;
    release(id: string, req: {
        user: {
            id: string;
        };
    }): Promise<import("./payments.service").EscrowFees>;
    refund(id: string, reason: string, req: {
        user: {
            id: string;
        };
    }): Promise<void>;
    status(id: string): Promise<import("./entities/payment.entity").PaymentEntity>;
    fees(amount: string): Promise<import("./payments.service").EscrowFees>;
}
//# sourceMappingURL=payments.controller.d.ts.map