export declare class OtpService {
    private readonly logger;
    private readonly store;
    generate(phone: string): string;
    verify(phone: string, code: string): boolean;
    sendSms(phone: string, code: string): Promise<void>;
}
//# sourceMappingURL=otp.service.d.ts.map