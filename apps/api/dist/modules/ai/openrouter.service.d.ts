export declare class OpenRouterService {
    private readonly logger;
    private readonly apiKey;
    constructor();
    /** Auto-test : appelle OpenRouter et renvoie le résultat brut ou l'erreur exacte. */
    ping(): Promise<{
        ok: boolean;
        hasKey: boolean;
        model: string;
        reply?: string;
        error?: string;
    }>;
    /** Auto-test génération d'image : renvoie ok + taille, ou l'erreur exacte. */
    pingImage(): Promise<{
        ok: boolean;
        model: string;
        length?: number;
        error?: string;
    }>;
    chat(userMessage: string, systemMessage?: string, model?: string): Promise<string>;
    generateImage(prompt: string): Promise<string>;
    analyzeWithVision(prompt: string, imageUrl?: string): Promise<string>;
}
//# sourceMappingURL=openrouter.service.d.ts.map