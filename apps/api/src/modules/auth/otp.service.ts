import { Injectable, Logger } from '@nestjs/common';

interface OtpEntry {
  code: string;
  expiresAt: number;
  attempts: number;
}

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly store = new Map<string, OtpEntry>();

  generate(phone: string): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.store.set(phone, {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0,
    });
    return code;
  }

  verify(phone: string, code: string): boolean {
    const entry = this.store.get(phone);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) { this.store.delete(phone); return false; }
    entry.attempts += 1;
    if (entry.attempts > 5) { this.store.delete(phone); return false; }
    if (entry.code !== code) return false;
    this.store.delete(phone);
    return true;
  }

  async sendSms(phone: string, code: string): Promise<void> {
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
      } else {
        this.logger.log(`[OTP SMS] Sent to ${intl}`);
      }
    } catch (err) {
      this.logger.error(`[OTP SMS] Error: ${err}`);
    }
  }
}
