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
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemini-flash-1.5';
let OpenRouterService = OpenRouterService_1 = class OpenRouterService {
    constructor() {
        this.logger = new common_1.Logger(OpenRouterService_1.name);
        this.apiKey = process.env.OPENROUTER_API_KEY ?? null;
        if (!this.apiKey) {
            this.logger.warn('OPENROUTER_API_KEY not configured — text AI will use fallback responses');
        }
    }
    /**
     * Send a chat completion request to OpenRouter.
     * Returns the assistant's text response.
     */
    async chat(userMessage, systemMessage, model = DEFAULT_MODEL) {
        if (!this.apiKey) {
            throw new common_1.ServiceUnavailableException('OpenRouter not configured');
        }
        const messages = [];
        if (systemMessage) {
            messages.push({ role: 'system', content: systemMessage });
        }
        messages.push({ role: 'user', content: userMessage });
        try {
            this.logger.log(`[OpenRouter] model=${model} prompt="${userMessage.slice(0, 60)}..."`);
            const response = await axios_1.default.post(OPENROUTER_URL, {
                model,
                messages,
                stream: false,
            }, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://fixaici.net',
                    'X-Title': 'FixAI',
                },
                timeout: 30000,
            });
            const text = response.data?.choices?.[0]?.message?.content ?? '';
            this.logger.log(`[OpenRouter] OK — ${text.length} chars`);
            return text;
        }
        catch (e) {
            const msg = e?.response?.data?.error?.message ?? e?.message ?? String(e);
            this.logger.error(`[OpenRouter] Error: ${msg}`);
            throw new common_1.ServiceUnavailableException('Text generation failed. Please try again.');
        }
    }
};
exports.OpenRouterService = OpenRouterService;
exports.OpenRouterService = OpenRouterService = OpenRouterService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], OpenRouterService);
//# sourceMappingURL=openrouter.service.js.map