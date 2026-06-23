/**
 * Generic image generation request
 * Accepts an image URL and/or a text prompt to generate/modify images
 */
export declare class GenerateImageDto {
    /** Text prompt describing the desired image transformation or generation */
    prompt: string;
    /** Optional base image URL (for image-to-image, inpainting, etc.) */
    imageUrl?: string;
    /** Optional width in pixels (default: 1024, max: 1024) */
    width?: number;
    /** Optional height in pixels (default: 1024, max: 1024) */
    height?: number;
    /** Strength of influence of the base image (0.0–1.0, default: 0.75) */
    promptStrength?: number;
}
//# sourceMappingURL=generate-image.dto.d.ts.map