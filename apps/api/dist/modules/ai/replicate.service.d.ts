/**
 * Unified Replicate API client using official SDK.
 * Handles all AI operations: image generation, vision, and text.
 */
export declare class ReplicateService {
    private readonly logger;
    private readonly client;
    readonly FLUX_PRO = "black-forest-labs/flux-1.1-pro";
    readonly FLUX_FILL = "black-forest-labs/flux-fill-pro";
    readonly VISION_MODEL = "meta/llama-3.2-90b-vision-instruct";
    readonly TEXT_MODEL = "meta/llama-3.3-70b-instruct";
    constructor();
    /**
     * Generate a new image from a text prompt.
     * Optionally starts from a base image (image-to-image).
     */
    generateImage(prompt: string, options?: {
        baseImageUrl?: string;
        width?: number;
        height?: number;
        promptStrength?: number;
    }): Promise<string>;
    /**
     * Inpaint or modify specific regions of an image.
     * Requires mask indicating areas to modify.
     */
    inpaintImage(prompt: string, imageUrl: string, maskUrl: string): Promise<string>;
    /**
     * Analyze an image with vision capabilities + text context.
     */
    analyzeWithVision(prompt: string, imageUrl?: string): Promise<string>;
    /**
     * Generate text completions using Llama 3.3.
     */
    complete(prompt: string, systemPrompt?: string): Promise<string>;
}
//# sourceMappingURL=replicate.service.d.ts.map