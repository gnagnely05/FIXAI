import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly client: GoogleGenerativeAI | null = null;

  constructor() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      this.logger.warn('GEMINI_API_KEY not configured — Gemini features unavailable');
      return;
    }
    this.client = new GoogleGenerativeAI(key);
  }

  async complete(prompt: string): Promise<string> {
    if (!this.client) throw new ServiceUnavailableException('Gemini not configured');
    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (e) {
      const msg = (e as { message?: string })?.message ?? String(e);
      this.logger.error(`Gemini error: ${msg}`);
      throw new ServiceUnavailableException('Gemini request failed');
    }
  }

  async analyzeImageFromUrl(prompt: string, imageUrl: string): Promise<string> {
    if (!this.client) throw new ServiceUnavailableException('Gemini not configured');
    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const imageResp = await fetch(imageUrl);
      const buffer = await imageResp.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const mimeType = (imageResp.headers.get('content-type') ?? 'image/jpeg') as 'image/jpeg';
      const result = await model.generateContent([
        { inlineData: { data: base64, mimeType } },
        prompt,
      ]);
      return result.response.text();
    } catch (e) {
      const msg = (e as { message?: string })?.message ?? String(e);
      this.logger.error(`Gemini vision error: ${msg}`);
      throw new ServiceUnavailableException('Gemini vision failed');
    }
  }
}
