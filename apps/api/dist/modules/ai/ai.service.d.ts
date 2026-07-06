import { CatalogService } from '../catalog/catalog.service';
import { ProductEntity } from '../catalog/entities/product.entity';
import { OpenRouterService } from './openrouter.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { GenerateDecorationDto } from './dto/decoration.dto';
export interface DecorationResult {
    imageUrl: string;
    prompt: string;
    selectedProducts: Array<Pick<ProductEntity, 'id' | 'name' | 'priceXof' | 'unit' | 'merchantName'>>;
    totalEstimateXof: number;
    excludedConstraints: string[];
}
export declare class AiService {
    private readonly catalogService;
    private readonly openRouter;
    private readonly subscriptions;
    private readonly logger;
    constructor(catalogService: CatalogService, openRouter: OpenRouterService, subscriptions: SubscriptionsService);
    generateDecorationVisualization(userId: string, dto: GenerateDecorationDto): Promise<DecorationResult>;
    private selectProducts;
    private buildPrompt;
    pingOpenRouter(): Promise<{
        ok: boolean;
        hasKey: boolean;
        model: string;
        reply?: string;
        error?: string;
    }>;
    diagnose(serviceType: string, messages: string[], imageUrls: string[], clientTurns?: number): Promise<{
        summary: string;
        detectedIssue: string;
        question: string;
        options: string[];
        estimatedPriceMinXof: number;
        estimatedPriceMaxXof: number;
        requiresDiagnostic: boolean;
        diagnosticFeeXof: number;
        readyForDecision: boolean;
    }>;
    /** Repli heuristique : détecte un problème complexe via mots-clés. */
    private detectComplexity;
    generateImage(userId: string, prompt: string): Promise<string>;
    generateImageByProvider(userId: string, prompt: string): Promise<string>;
    analyzeImage(userId: string, prompt: string, imageUrl?: string): Promise<string>;
}
//# sourceMappingURL=ai.service.d.ts.map