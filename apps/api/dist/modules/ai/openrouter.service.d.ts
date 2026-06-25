export declare class OpenRouterService {
    private readonly logger;
    private readonly apiKey;
    constructor();
    /**
     * Send a chat completion request to OpenRouter.
     * Returns the assistant's text response.
     */
    chat(userMessage: string, systemMessage?: string, model?: string): Promise<string>;
}
//# sourceMappingURL=openrouter.service.d.ts.map