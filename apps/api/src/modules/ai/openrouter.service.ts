import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import axios from 'axios';

const BASE_URL   = 'https://openrouter.ai/api/v1';
const TEXT_MODEL = 'google/gemini-flash-1.5';
const IMG_MODEL  = 'google/gemini-2.5-pro-preview';

const HEADERS = (key: string) => ({
  Authorization: `Bearer ${key}`,
  'Content-Type': 'application/json',
  'HTTP-Referer': 'https://fixaici.net',
  'X-Title': 'FixAI',
});

@Injectable()
export class OpenRouterService {
  private readonly logger = new Logger(OpenRouterService.name);
  private readonly apiKey: string | null;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY ?? null;
    if (!this.apiKey) {
      this.logger.warn('OPENROUTER_API_KEY not configured — AI will use fallback responses');
    }
  }

  // ─── Text / Chat ────────────────────────────────────────────────────────────

  async chat(
    userMessage: string,
    systemMessage?: string,
    model: string = TEXT_MODEL,
  ): Promise<string> {
    if (!this.apiKey) throw new ServiceUnavailableException('OpenRouter not configured');

    const messages: Array<{ role: string; content: string }> = [];
    if (systemMessage) messages.push({ role: 'system', content: systemMessage });
    messages.push({ role: 'user', content: userMessage });

    this.logger.log(`[Chat] model=${model} "${userMessage.slice(0, 60)}..."`);

    try {
      const { data } = await axios.post(
        `${BASE_URL}/chat/completions`,
        { model, messages, stream: false },
        { headers: HEADERS(this.apiKey), timeout: 30000 },
      );
      const text: string = data?.choices?.[0]?.message?.content ?? '';
      this.logger.log(`[Chat] OK — ${text.length} chars`);
      return text;
    } catch (e: any) {
      const msg = e?.response?.data?.error?.message ?? e?.message ?? String(e);
      this.logger.error(`[Chat] Error: ${msg}`);
      throw new ServiceUnavailableException('Text generation failed. Please try again.');
    }
  }

  // ─── Image Generation (Gemini 2.5 Pro) ──────────────────────────────────────

  async generateImage(prompt: string): Promise<string> {
    if (!this.apiKey) throw new ServiceUnavailableException('OpenRouter not configured');

    this.logger.log(`[ImageGen] "${prompt.slice(0, 60)}..." | model=${IMG_MODEL}`);

    try {
      // OpenRouter image generation — standard images/generations endpoint
      const { data } = await axios.post(
        `${BASE_URL}/images/generations`,
        {
          model: IMG_MODEL,
          prompt,
          n: 1,
          size: '1024x1024',
          response_format: 'url',
        },
        { headers: HEADERS(this.apiKey), timeout: 60000 },
      );

      const url: string = data?.data?.[0]?.url ?? '';
      if (!url) throw new Error('No image URL in OpenRouter response');
      this.logger.log(`[ImageGen] OK: ${url}`);
      return url;
    } catch (e: any) {
      const msg = e?.response?.data?.error?.message ?? e?.message ?? String(e);
      this.logger.error(`[ImageGen] Error: ${msg}`);
      throw new ServiceUnavailableException('Image generation failed. Please try again.');
    }
  }

  // ─── Vision / Image Analysis (Gemini multimodal) ────────────────────────────

  async analyzeWithVision(prompt: string, imageUrl?: string): Promise<string> {
    if (!this.apiKey) throw new ServiceUnavailableException('OpenRouter not configured');

    this.logger.log(`[Vision] "${prompt.slice(0, 60)}..."`);

    const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
      { type: 'text', text: prompt },
    ];
    if (imageUrl) {
      content.push({ type: 'image_url', image_url: { url: imageUrl } });
    }

    try {
      const { data } = await axios.post(
        `${BASE_URL}/chat/completions`,
        {
          model: IMG_MODEL,
          messages: [{ role: 'user', content }],
          stream: false,
        },
        { headers: HEADERS(this.apiKey), timeout: 30000 },
      );
      const text: string = data?.choices?.[0]?.message?.content ?? '';
      this.logger.log(`[Vision] OK — ${text.length} chars`);
      return text;
    } catch (e: any) {
      const msg = e?.response?.data?.error?.message ?? e?.message ?? String(e);
      this.logger.error(`[Vision] Error: ${msg}`);
      throw new ServiceUnavailableException('Image analysis failed. Please try again.');
    }
  }
}
