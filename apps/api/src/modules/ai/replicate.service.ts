import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';

/**
 * Unified Replicate API client.
 * All AI calls (image generation + vision analysis) go through this single service.
 */
@Injectable()
export class ReplicateService {
  private readonly logger = new Logger(ReplicateService.name);
  private readonly token = process.env.REPLICATE_API_TOKEN!;
  private readonly baseUrl = 'https://api.replicate.com/v1';

  // ─── Models ───────────────────────────────────────────────────────────────
  readonly FLUX_MODEL        = 'black-forest-labs/flux-pro';
  readonly VISION_MODEL      = 'meta/llama-3.2-90b-vision-instruct';
  readonly TEXT_MODEL        = 'meta/llama-3.3-70b-instruct';

  // ─── Core API ─────────────────────────────────────────────────────────────

  async createPrediction(model: string, input: Record<string, unknown>): Promise<string> {
    const url = model.includes('/')
      ? `${this.baseUrl}/models/${model}/predictions`
      : `${this.baseUrl}/predictions`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        Prefer: 'wait',
      },
      body: JSON.stringify({ input }),
    });

    if (!res.ok) {
      const err = await res.text();
      this.logger.error(`Replicate error (${model}): ${err}`);
      throw new ServiceUnavailableException('Service IA temporairement indisponible');
    }

    const prediction = await res.json();
    if (prediction.status === 'succeeded') return prediction.id as string;
    return prediction.id as string;
  }

  async pollPrediction(predictionId: string, maxWaitMs = 90_000): Promise<unknown> {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      await new Promise(r => setTimeout(r, 3_000));

      const res = await fetch(`${this.baseUrl}/predictions/${predictionId}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      if (!res.ok) throw new ServiceUnavailableException('Erreur vérification statut Replicate');

      const p = await res.json();
      if (p.status === 'succeeded') return p.output;
      if (p.status === 'failed' || p.status === 'canceled') {
        throw new ServiceUnavailableException(`Replicate: génération échouée — ${p.error ?? 'raison inconnue'}`);
      }
    }
    throw new ServiceUnavailableException('Délai dépassé (90s) pour la requête IA');
  }

  // ─── Image generation (FLUX) ──────────────────────────────────────────────

  async generateImage(prompt: string, baseImageUrl?: string): Promise<string> {
    const input: Record<string, unknown> = {
      prompt,
      width: 1024,
      height: 1024,
      output_format: 'webp',
      output_quality: 90,
      safety_tolerance: 2,
    };
    if (baseImageUrl) {
      input.image = baseImageUrl;
      input.prompt_strength = 0.75;
    }

    const id = await this.createPrediction(this.FLUX_MODEL, input);
    const output = await this.pollPrediction(id);
    const url = Array.isArray(output) ? output[0] : output;
    if (!url) throw new ServiceUnavailableException('Aucune image générée');
    return url as string;
  }

  // ─── Vision analysis (Llama Vision) ───────────────────────────────────────

  async analyzeWithVision(prompt: string, imageUrl?: string): Promise<string> {
    const input: Record<string, unknown> = { prompt };
    if (imageUrl) input.image = imageUrl;

    const id = await this.createPrediction(this.VISION_MODEL, input);
    const output = await this.pollPrediction(id);
    return Array.isArray(output) ? (output as string[]).join('') : String(output ?? '');
  }

  // ─── Text completion (Llama) ──────────────────────────────────────────────

  async complete(prompt: string, systemPrompt?: string): Promise<string> {
    const fullPrompt = systemPrompt
      ? `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n${systemPrompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n${prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>`
      : prompt;

    const input: Record<string, unknown> = {
      prompt: fullPrompt,
      max_tokens: 2048,
      temperature: 0.1,
    };

    const id = await this.createPrediction(this.TEXT_MODEL, input);
    const output = await this.pollPrediction(id);
    return Array.isArray(output) ? (output as string[]).join('') : String(output ?? '');
  }
}
