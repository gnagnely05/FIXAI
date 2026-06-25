"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var OtpService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpService = void 0;
const common_1 = require("@nestjs/common");
let OtpService = OtpService_1 = class OtpService {
    constructor() {
        this.logger = new common_1.Logger(OtpService_1.name);
        this.store = new Map();
    }
    generate(phone) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        this.store.set(phone, {
            code,
            expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
            attempts: 0,
        });
        return code;
    }
    verify(phone, code) {
        const entry = this.store.get(phone);
        if (!entry)
            return false;
        if (Date.now() > entry.expiresAt) {
            this.store.delete(phone);
            return false;
        }
        entry.attempts += 1;
        if (entry.attempts > 5) {
            this.store.delete(phone);
            return false;
        }
        if (entry.code !== code)
            return false;
        this.store.delete(phone);
        return true;
    }
    async sendSms(phone, code) {
        const message = `FixAI : votre code de vérification est ${code}. Valable 5 minutes.`;
        const apiKey = process.env.AFRICASTALKING_API_KEY;
        const username = process.env.AFRICASTALKING_USERNAME ?? 'sandbox';
        if (!apiKey) {
            // Dev mode — log the OTP
            this.logger.warn(`[OTP DEV] ${phone} → ${code}`);
            return;
        }
        try {
            // Normalize phone to +225 format
            const intl = phone.startsWith('+') ? phone : `+225${phone.replace(/^0/, '')}`;
            const body = new URLSearchParams({
                username,
                to: intl,
                message,
                from: 'FixAI',
            });
            const res = await fetch('https://api.africastalking.com/version1/messaging', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'apiKey': apiKey,
                },
                body: body.toString(),
            });
            if (!res.ok) {
                this.logger.error(`[OTP SMS] Failed: ${res.status} ${await res.text()}`);
            }
            else {
                this.logger.log(`[OTP SMS] Sent to ${intl}`);
            }
        }
        catch (err) {
            this.logger.error(`[OTP SMS] Error: ${err}`);
        }
    }
};
exports.OtpService = OtpService;
exports.OtpService = OtpService = OtpService_1 = __decorate([
    (0, common_1.Injectable)()
], OtpService);
//# sourceMappingURL=otp.service.js.map