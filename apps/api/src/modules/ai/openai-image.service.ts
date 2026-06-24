import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAiImageService {
  private readonly logger = new Logger(OpenAiImageService.name);
  private readonly client: OpenAI | null = null;

  constructor() {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      this.logger.warn('OPENAI_API_KEY not set — GPT Image unavailable');
      return;
    }
    this.client = new OpenAI({ apiKey: key });
  }

  async generate(prompt: string, size: '1024x1024' | '1792x1024' | '1024x1792' = '1024x1024'): Promise<string> {
    if (!this.client) throw new ServiceUnavailableException('OpenAI not configured');
    try {
      const response = await this.client.images.generate({
        model: 'gpt-image-1',
        prompt,
        size,
      });
      const url = response.data?.[0]?.url;
      if (!url) throw new Error('No image URL returned');
      return url;
    } catch (e) {
      this.logger.error(`OpenAI image error: ${(e as Error).message}`);
      throw new ServiceUnavailableException('GPT Image generation failed');
    }
  }
}
