import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import Replicate from 'replicate';

/**
 * Unified Replicate API client using official SDK.
 * Handles all AI operations: image generation, vision, and text.
 */
@Injectable()
export class ReplicateService {
  private readonly logger = new Logger(ReplicateService.name);
  private readonly client: Replicate;

  // ─── Models ───────────────────────────────────────────────────────────────
  readonly FLUX_PRO          = 'black-forest-labs/flux-pro';
  readonly FLUX_FILL         = 'black-forest-labs/flux-fill';
  readonly VISION_MODEL      = 'meta/llama-3.2-90b-vision-instruct';
  readonly TEXT_MODEL        = 'meta/llama-3.3-70b-instruct';

  constructor() {
    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) {
      this.logger.warn('REPLICATE_API_TOKEN not configured — AI features will be unavailable');
      this.client = null as any;
      return;
    }
    this.client = new Replicate({ auth: token });
  }

  // ─── Image generation (FLUX Pro) ──────────────────────────────────────────

  /**
   * Generate a new image from a text prompt.
   * Optionally starts from a base image (image-to-image).
   */
  async generateImage(
    prompt: string,
    options?: {
      baseImageUrl?: string;
      width?: number;
      height?: number;
      promptStrength?: number;
    },
  ): Promise<string> {
    try {
      const width = options?.width ?? 1024;
      const height = options?.height ?? 1024;
      const promptStrength = options?.promptStrength ?? 0.75;

      const input: Record<string, unknown> = {
        prompt,
        width,
        height,
        output_format: 'webp',
        output_quality: 90,
        safety_tolerance: 2,
      };

      // Use image-to-image if base image provided
      if (options?.baseImageUrl) {
        input.image = options.baseImageUrl;
        input.prompt_strength = promptStrength;
      }

      this.logger.log(`[Image Gen] Prompt: "${prompt.slice(0, 50)}..." | Model: ${this.FLUX_PRO}`);

      const output = await this.client.run(this.FLUX_PRO, { input });

      // Extract URL from output
      const url = Array.isArray(output) ? output[0] : output;
      if (!url || typeof url !== 'string') {
        throw new Error('Invalid output from Replicate');
      }

      this.logger.log(`[Image Gen] Success: ${url}`);
      return url;
    } catch (e) {
      const msg = (e as { message?: string })?.message ?? String(e);
      this.logger.error(`Replicate error: ${msg}`);
      throw new ServiceUnavailableException('Image generation failed. Please try again.');
    }
  }

  /**
   * Inpaint or modify specific regions of an image.
   * Requires mask indicating areas to modify.
   */
  async inpaintImage(
    prompt: string,
    imageUrl: string,
    maskUrl: string,
  ): Promise<string> {
    try {
      const input: Record<string, unknown> = {
        prompt,
        image: imageUrl,
        mask: maskUrl,
        width: 1024,
        height: 1024,
        output_format: 'webp',
        output_quality: 90,
      };

      this.logger.log(`[Inpaint] Prompt: "${prompt.slice(0, 50)}..."`);

      const output = await this.client.run(this.FLUX_FILL, { input });
      const url = Array.isArray(output) ? output[0] : output;
      if (!url || typeof url !== 'string') {
        throw new Error('Invalid output from Replicate');
      }

      return url;
    } catch (e) {
      const msg = (e as { message?: string })?.message ?? String(e);
      this.logger.error(`Replicate inpaint error: ${msg}`);
      throw new ServiceUnavailableException('Inpainting failed. Please try again.');
    }
  }

  // ─── Vision analysis (Llama Vision) ───────────────────────────────────────

  /**
   * Analyze an image with vision capabilities + text context.
   */
  async analyzeWithVision(prompt: string, imageUrl?: string): Promise<string> {
    try {
      const input: Record<string, unknown> = { prompt };
      if (imageUrl) input.image = imageUrl;

      this.logger.log(`[Vision] Analyzing image with prompt: "${prompt.slice(0, 50)}..."`);

      const output = await this.client.run(this.VISION_MODEL, { input });
      return Array.isArray(output) ? (output as string[]).join('') : String(output ?? '');
    } catch (e) {
      const msg = (e as { message?: string })?.message ?? String(e);
      this.logger.error(`Replicate vision error: ${msg}`);
      throw new ServiceUnavailableException('Image analysis failed. Please try again.');
    }
  }

  // ─── Text completion (Llama) ──────────────────────────────────────────────

  /**
   * Generate text completions using Llama 3.3.
   */
  async complete(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      const fullPrompt = systemPrompt
        ? `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n${systemPrompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n${prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>`
        : prompt;

      const input: Record<string, unknown> = {
        prompt: fullPrompt,
        max_tokens: 2048,
        temperature: 0.1,
      };

      this.logger.log(`[Text] Completing prompt: "${prompt.slice(0, 50)}..."`);

      const output = await this.client.run(this.TEXT_MODEL, { input });
      return Array.isArray(output) ? (output as string[]).join('') : String(output ?? '');
    } catch (e) {
      const msg = (e as { message?: string })?.message ?? String(e);
      this.logger.error(`Replicate text error: ${msg}`);
      throw new ServiceUnavailableException('Text generation failed. Please try again.');
    }
  }
}
