export declare class OpenRouterService {
    private readonly logger;
    private readonly apiKey;
    constructor();
    chat(userMessage: string, systemMessage?: string, model?: string): Promise<string>;
    generateImage(prompt: string): Promise<string>;
    analyzeWithVision(prompt: string, imageUrl?: string): Promise<string>;
}
//# sourceMappingURL=openrouter.service.d.ts.map