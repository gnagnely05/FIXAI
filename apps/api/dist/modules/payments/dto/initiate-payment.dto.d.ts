export declare enum PaymentProvider {
    ORANGE_MONEY = "ORANGE_MONEY",
    MTN_MONEY = "MTN_MONEY",
    WAVE = "WAVE",
    MOOV_MONEY = "MOOV_MONEY"
}
export declare class InitiatePaymentDto {
    orderId: string;
    amount: number;
    provider: PaymentProvider;
    phoneNumber: string;
}
//# sourceMappingURL=initiate-payment.dto.d.ts.map