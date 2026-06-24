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
var OpenAiImageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAiImageService = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = __importDefault(require("openai"));
let OpenAiImageService = OpenAiImageService_1 = class OpenAiImageService {
    constructor() {
        this.logger = new common_1.Logger(OpenAiImageService_1.name);
        this.client = null;
        const key = process.env.OPENAI_API_KEY;
        if (!key) {
            this.logger.warn('OPENAI_API_KEY not set — GPT Image unavailable');
            return;
        }
        this.client = new openai_1.default({ apiKey: key });
    }
    async generate(prompt, size = '1024x1024') {
        if (!this.client)
            throw new common_1.ServiceUnavailableException('OpenAI not configured');
        try {
            const response = await this.client.images.generate({
                model: 'gpt-image-1',
                prompt,
                size,
            });
            const url = response.data?.[0]?.url;
            if (!url)
                throw new Error('No image URL returned');
            return url;
        }
        catch (e) {
            this.logger.error(`OpenAI image error: ${e.message}`);
            throw new common_1.ServiceUnavailableException('GPT Image generation failed');
        }
    }
};
exports.OpenAiImageService = OpenAiImageService;
exports.OpenAiImageService = OpenAiImageService = OpenAiImageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], OpenAiImageService);
//# sourceMappingURL=openai-image.service.js.map