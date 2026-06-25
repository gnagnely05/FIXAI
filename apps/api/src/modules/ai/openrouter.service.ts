import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import axios from 'axios';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL  = 'google/gemini-flash-1.5';

@Injectable()
export class OpenRouterService {
  private readonly logger = new Logger(OpenRouterService.name);
  private readonly apiKey: string | null;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY ?? null;
    if (!this.apiKey) {
      this.logger.warn('OPENROUTER_API_KEY not configured — text AI will use fallback responses');
    }
  }

  /**
   * Send a chat completion request to OpenRouter.
   * Returns the assistant's text response.
   */
  async chat(
    userMessage: string,
    systemMessage?: string,
    model: string = DEFAULT_MODEL,
  ): Promise<string> {
    if (!this.apiKey) {
      throw new ServiceUnavailableException('OpenRouter not configured');
    }

    const messages: Array<{ role: string; content: string }> = [];
    if (systemMessage) {
      messages.push({ role: 'system', content: systemMessage });
    }
    messages.push({ role: 'user', content: userMessage });

    try {
      this.logger.log(`[OpenRouter] model=${model} prompt="${userMessage.slice(0, 60)}..."`);

      const response = await axios.post(
        OPENROUTER_URL,
        {
          model,
          messages,
          stream: false,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://fixaici.net',
            'X-Title': 'FixAI',
          },
          timeout: 30000,
        },
      );

      const text: string = response.data?.choices?.[0]?.message?.content ?? '';
      this.logger.log(`[OpenRouter] OK — ${text.length} chars`);
      return text;
    } catch (e: any) {
      const msg = e?.response?.data?.error?.message ?? e?.message ?? String(e);
      this.logger.error(`[OpenRouter] Error: ${msg}`);
      throw new ServiceUnavailableException('Text generation failed. Please try again.');
    }
  }
}
