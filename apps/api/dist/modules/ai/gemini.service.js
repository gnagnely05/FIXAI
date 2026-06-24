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
var GeminiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiService = void 0;
const common_1 = require("@nestjs/common");
const genai_1 = require("@google/genai");
let GeminiService = GeminiService_1 = class GeminiService {
    constructor() {
        this.logger = new common_1.Logger(GeminiService_1.name);
        this.ai = null;
        const key = process.env.GEMINI_API_KEY;
        if (!key) {
            this.logger.warn('GEMINI_API_KEY not set — Gemini unavailable');
            return;
        }
        this.ai = new genai_1.GoogleGenAI({ apiKey: key });
    }
    async chat(prompt) {
        if (!this.ai)
            throw new common_1.ServiceUnavailableException('Gemini not configured');
        try {
            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
            });
            return response.text ?? '';
        }
        catch (e) {
            this.logger.error(`Gemini chat error: ${e.message}`);
            throw new common_1.ServiceUnavailableException('Gemini request failed');
        }
    }
    async chatWithImage(prompt, imageUrl) {
        if (!this.ai)
            throw new common_1.ServiceUnavailableException('Gemini not configured');
        try {
            const imgResp = await fetch(imageUrl);
            const buffer = await imgResp.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            const mimeType = (imgResp.headers.get('content-type') ?? 'image/jpeg');
            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: [
                    { inlineData: { data: base64, mimeType } },
                    prompt,
                ],
            });
            return response.text ?? '';
        }
        catch (e) {
            this.logger.error(`Gemini vision error: ${e.message}`);
            throw new common_1.ServiceUnavailableException('Gemini vision failed');
        }
    }
};
exports.GeminiService = GeminiService;
exports.GeminiService = GeminiService = GeminiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], GeminiService);
//# sourceMappingURL=gemini.service.js.map