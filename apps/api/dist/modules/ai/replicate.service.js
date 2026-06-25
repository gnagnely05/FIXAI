"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ReplicateService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplicateService = void 0;
const common_1 = require("@nestjs/common");
const replicate_1 = __importDefault(require("replicate"));
/**
 * Unified Replicate API client using official SDK.
 * Handles all AI operations: image generation, vision, and text.
 */
let ReplicateService = ReplicateService_1 = class ReplicateService {
    constructor() {
        this.logger = new common_1.Logger(ReplicateService_1.name);
        // ─── Models ───────────────────────────────────────────────────────────────
        this.FLUX_PRO = 'black-forest-labs/flux-1.1-pro';
        this.FLUX_FILL = 'black-forest-labs/flux-fill-pro';
        this.VISION_MODEL = 'meta/llama-3.2-90b-vision-instruct';
        const token = process.env.REPLICATE_API_TOKEN;
        if (!token) {
            this.logger.warn('REPLICATE_API_TOKEN not configured — AI features will be unavailable');
            this.client = null;
            return;
        }
        this.client = new replicate_1.default({ auth: token });
    }
    // ─── Image generation (FLUX Pro) ──────────────────────────────────────────
    /**
     * Generate a new image from a text prompt.
     * Optionally starts from a base image (image-to-image).
     */
    async generateImage(prompt, options) {
        try {
            const width = options?.width ?? 1024;
            const height = options?.height ?? 1024;
            const promptStrength = options?.promptStrength ?? 0.75;
            const input = {
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
        }
        catch (e) {
            const msg = e?.message ?? String(e);
            this.logger.error(`Replicate error: ${msg}`);
            throw new common_1.ServiceUnavailableException('Image generation failed. Please try again.');
        }
    }
    /**
     * Inpaint or modify specific regions of an image.
     * Requires mask indicating areas to modify.
     */
    async inpaintImage(prompt, imageUrl, maskUrl) {
        try {
            const input = {
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
        }
        catch (e) {
            const msg = e?.message ?? String(e);
            this.logger.error(`Replicate inpaint error: ${msg}`);
            throw new common_1.ServiceUnavailableException('Inpainting failed. Please try again.');
        }
    }
    // ─── Vision analysis (Llama Vision) ───────────────────────────────────────
    /**
     * Analyze an image with vision capabilities + text context.
     */
    async analyzeWithVision(prompt, imageUrl) {
        try {
            const input = { prompt };
            if (imageUrl)
                input.image = imageUrl;
            this.logger.log(`[Vision] Analyzing image with prompt: "${prompt.slice(0, 50)}..."`);
            const output = await this.client.run(this.VISION_MODEL, { input });
            return Array.isArray(output) ? output.join('') : String(output ?? '');
        }
        catch (e) {
            const msg = e?.message ?? String(e);
            this.logger.error(`Replicate vision error: ${msg}`);
            throw new common_1.ServiceUnavailableException('Image analysis failed. Please try again.');
        }
    }
};
exports.ReplicateService = ReplicateService;
exports.ReplicateService = ReplicateService = ReplicateService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ReplicateService);
//# sourceMappingURL=replicate.service.js.map