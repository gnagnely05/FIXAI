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
var OpenRouterService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenRouterService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const BASE_URL = 'https://openrouter.ai/api/v1';
const TEXT_MODEL = 'google/gemini-2.0-flash-001';
const IMG_MODEL = 'google/gemini-2.0-flash-001';
const HEADERS = (key) => ({
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://fixaici.net',
    'X-Title': 'FixAI',
});
let OpenRouterService = OpenRouterService_1 = class OpenRouterService {
    constructor() {
        this.logger = new common_1.Logger(OpenRouterService_1.name);
        this.apiKey = process.env.OPENROUTER_API_KEY ?? null;
        if (!this.apiKey) {
            this.logger.warn('OPENROUTER_API_KEY not configured — AI will use fallback responses');
        }
    }
    /** Auto-test : appelle OpenRouter et renvoie le résultat brut ou l'erreur exacte. */
    async ping() {
        if (!this.apiKey) {
            return { ok: false, hasKey: false, model: TEXT_MODEL, error: 'OPENROUTER_API_KEY non configurée sur le serveur' };
        }
        try {
            const { data } = await axios_1.default.post(`${BASE_URL}/chat/completions`, { model: TEXT_MODEL, messages: [{ role: 'user', content: 'Réponds uniquement par: OK' }], stream: false }, { headers: HEADERS(this.apiKey), timeout: 20000 });
            const reply = data?.choices?.[0]?.message?.content ?? '';
            return { ok: true, hasKey: true, model: TEXT_MODEL, reply };
        }
        catch (e) {
            const error = e?.response?.data?.error?.message
                ?? JSON.stringify(e?.response?.data ?? {})
                ?? e?.message ?? String(e);
            return { ok: false, hasKey: true, model: TEXT_MODEL, error };
        }
    }
    // ─── Text / Chat ────────────────────────────────────────────────────────────
    async chat(userMessage, systemMessage, model = TEXT_MODEL) {
        if (!this.apiKey)
            throw new common_1.ServiceUnavailableException('OpenRouter not configured');
        const messages = [];
        if (systemMessage)
            messages.push({ role: 'system', content: systemMessage });
        messages.push({ role: 'user', content: userMessage });
        this.logger.log(`[Chat] model=${model} "${userMessage.slice(0, 60)}..."`);
        try {
            const { data } = await axios_1.default.post(`${BASE_URL}/chat/completions`, { model, messages, stream: false }, { headers: HEADERS(this.apiKey), timeout: 30000 });
            const text = data?.choices?.[0]?.message?.content ?? '';
            this.logger.log(`[Chat] OK — ${text.length} chars`);
            return text;
        }
        catch (e) {
            const msg = e?.response?.data?.error?.message ?? e?.message ?? String(e);
            this.logger.error(`[Chat] Error: ${msg}`);
            throw new common_1.ServiceUnavailableException('Text generation failed. Please try again.');
        }
    }
    // ─── Image Generation (Gemini 2.5 Pro) ──────────────────────────────────────
    async generateImage(prompt) {
        if (!this.apiKey)
            throw new common_1.ServiceUnavailableException('OpenRouter not configured');
        this.logger.log(`[ImageGen] "${prompt.slice(0, 60)}..." | model=${IMG_MODEL}`);
        try {
            // OpenRouter image generation — standard images/generations endpoint
            const { data } = await axios_1.default.post(`${BASE_URL}/images/generations`, {
                model: IMG_MODEL,
                prompt,
                n: 1,
                size: '1024x1024',
                response_format: 'url',
            }, { headers: HEADERS(this.apiKey), timeout: 60000 });
            const url = data?.data?.[0]?.url ?? '';
            if (!url)
                throw new Error('No image URL in OpenRouter response');
            this.logger.log(`[ImageGen] OK: ${url}`);
            return url;
        }
        catch (e) {
            const msg = e?.response?.data?.error?.message ?? e?.message ?? String(e);
            this.logger.error(`[ImageGen] Error: ${msg}`);
            throw new common_1.ServiceUnavailableException('Image generation failed. Please try again.');
        }
    }
    // ─── Vision / Image Analysis (Gemini multimodal) ────────────────────────────
    async analyzeWithVision(prompt, imageUrl) {
        if (!this.apiKey)
            throw new common_1.ServiceUnavailableException('OpenRouter not configured');
        this.logger.log(`[Vision] "${prompt.slice(0, 60)}..."`);
        const content = [
            { type: 'text', text: prompt },
        ];
        if (imageUrl) {
            content.push({ type: 'image_url', image_url: { url: imageUrl } });
        }
        try {
            const { data } = await axios_1.default.post(`${BASE_URL}/chat/completions`, {
                model: IMG_MODEL,
                messages: [{ role: 'user', content }],
                stream: false,
            }, { headers: HEADERS(this.apiKey), timeout: 30000 });
            const text = data?.choices?.[0]?.message?.content ?? '';
            this.logger.log(`[Vision] OK — ${text.length} chars`);
            return text;
        }
        catch (e) {
            const msg = e?.response?.data?.error?.message ?? e?.message ?? String(e);
            this.logger.error(`[Vision] Error: ${msg}`);
            throw new common_1.ServiceUnavailableException('Image analysis failed. Please try again.');
        }
    }
};
exports.OpenRouterService = OpenRouterService;
exports.OpenRouterService = OpenRouterService = OpenRouterService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], OpenRouterService);
//# sourceMappingURL=openrouter.service.js.map