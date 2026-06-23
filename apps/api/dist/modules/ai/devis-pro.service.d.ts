import { CatalogService } from '../catalog/catalog.service';
import { ProductEntity } from '../catalog/entities/product.entity';
import { ReplicateService } from './replicate.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
export type SupportedMimeType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
export interface QuoteFile {
    /** Base64-encoded image data */
    base64: string;
    mimeType: SupportedMimeType;
    name?: string;
}
export interface QuoteLineResult {
    originalText: string;
    status: 'MATCHED' | 'UNAVAILABLE' | 'UNINTERPRETED';
    product?: Pick<ProductEntity, 'id' | 'name' | 'priceXof' | 'unit' | 'merchantName'>;
    quantity?: number;
    totalXof?: number;
}
export interface DevisProResult {
    matched: QuoteLineResult[];
    unavailable: QuoteLineResult[];
    uninterpreted: QuoteLineResult[];
    totalEstimateXof: number;
}
export declare class DevisProService {
    private readonly catalogService;
    private readonly replicate;
    private readonly subscriptions;
    private readonly logger;
    constructor(catalogService: CatalogService, replicate: ReplicateService, subscriptions: SubscriptionsService);
    analyzeQuoteFiles(userId: string, files: QuoteFile[]): Promise<DevisProResult>;
    /**
     * Anti-hallucination: only MATCHED when a real catalog product is found.
     * Unknown lines stay UNAVAILABLE (known material) or UNINTERPRETED (unknown).
     * No price is ever invented.
     */
    private matchLine;
}
//# sourceMappingURL=devis-pro.service.d.ts.map