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
const generative_ai_1 = require("@google/generative-ai");
let GeminiService = GeminiService_1 = class GeminiService {
    constructor() {
        this.logger = new common_1.Logger(GeminiService_1.name);
        this.client = null;
        const key = process.env.GEMINI_API_KEY;
        if (!key) {
            this.logger.warn('GEMINI_API_KEY not configured — Gemini features unavailable');
            return;
        }
        this.client = new generative_ai_1.GoogleGenerativeAI(key);
    }
    async complete(prompt) {
        if (!this.client)
            throw new common_1.ServiceUnavailableException('Gemini not configured');
        try {
            const model = this.client.getGenerativeModel({ model: 'gemini-2.0-flash' });
            const result = await model.generateContent(prompt);
            return result.response.text();
        }
        catch (e) {
            const msg = e?.message ?? String(e);
            this.logger.error(`Gemini error: ${msg}`);
            throw new common_1.ServiceUnavailableException('Gemini request failed');
        }
    }
    async analyzeImageFromUrl(prompt, imageUrl) {
        if (!this.client)
            throw new common_1.ServiceUnavailableException('Gemini not configured');
        try {
            const model = this.client.getGenerativeModel({ model: 'gemini-2.0-flash' });
            const imageResp = await fetch(imageUrl);
            const buffer = await imageResp.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            const mimeType = (imageResp.headers.get('content-type') ?? 'image/jpeg');
            const result = await model.generateContent([
                { inlineData: { data: base64, mimeType } },
                prompt,
            ]);
            return result.response.text();
        }
        catch (e) {
            const msg = e?.message ?? String(e);
            this.logger.error(`Gemini vision error: ${msg}`);
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