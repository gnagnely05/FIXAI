import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly ai: GoogleGenAI | null = null;

  constructor() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      this.logger.warn('GEMINI_API_KEY not set — Gemini unavailable');
      return;
    }
    this.ai = new GoogleGenAI({ apiKey: key });
  }

  async chat(prompt: string): Promise<string> {
    if (!this.ai) throw new ServiceUnavailableException('Gemini not configured');
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
      });
      return response.text ?? '';
    } catch (e) {
      this.logger.error(`Gemini chat error: ${(e as Error).message}`);
      throw new ServiceUnavailableException('Gemini request failed');
    }
  }

  async chatWithImage(prompt: string, imageUrl: string): Promise<string> {
    if (!this.ai) throw new ServiceUnavailableException('Gemini not configured');
    try {
      const imgResp = await fetch(imageUrl);
      const buffer = await imgResp.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const mimeType = (imgResp.headers.get('content-type') ?? 'image/jpeg') as 'image/jpeg';

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [
          { inlineData: { data: base64, mimeType } },
          prompt,
        ] as any,
      });
      return response.text ?? '';
    } catch (e) {
      this.logger.error(`Gemini vision error: ${(e as Error).message}`);
      throw new ServiceUnavailableException('Gemini vision failed');
    }
  }
}
