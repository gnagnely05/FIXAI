import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { CatalogService } from '../catalog/catalog.service';
import { ProductEntity } from '../catalog/entities/product.entity';
import { OpenRouterService } from './openrouter.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

export type SupportedMimeType =
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp'
  | 'image/gif';

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

const ALLOWED_MIMES: SupportedMimeType[] = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

@Injectable()
export class DevisProService {
  private readonly logger = new Logger(DevisProService.name);

  constructor(
    private readonly catalogService: CatalogService,
    private readonly openRouter: OpenRouterService,
    private readonly subscriptions: SubscriptionsService,
  ) {}

  async analyzeQuoteFiles(userId: string, files: QuoteFile[]): Promise<DevisProResult> {
    if (!files.length || files.length > 3) {
      throw new BadRequestException('Fournissez 1 à 3 images de devis');
    }

    for (const f of files) {
      if (!ALLOWED_MIMES.includes(f.mimeType)) {
        throw new BadRequestException(
          `Type de fichier non supporté: ${f.mimeType}. Formats acceptés: JPEG, PNG, WEBP, GIF`,
        );
      }
    }

    // Check and consume quota
    await this.subscriptions.assertAiAllowed(userId);

    // Build data URIs from base64 images and analyze the first image with vision
    // (Replicate vision models process one image at a time)
    const allLines: Array<{ originalText: string; quantity: number | null }> = [];

    for (const file of files) {
      const dataUri = `data:${file.mimeType};base64,${file.base64}`;
      const prompt = `Tu es un assistant spécialisé dans la lecture de devis de construction en Côte d'Ivoire.
Analyse cette image de devis et extrait UNIQUEMENT les lignes de produits/matériaux.
Ignore les totaux, sous-totaux, TVA, conditions de paiement, en-têtes, pieds de page.
Pour chaque ligne produit, retourne un JSON array avec: {"originalText": "texte exact de la ligne", "quantity": nombre ou null}
Ne retourne QUE le JSON array brut, sans markdown ni explication.
Exemple: [{"originalText":"Ciment CPA 50 kg","quantity":20},{"originalText":"Sable de rivière","quantity":null}]`;

      try {
        const response = await this.openRouter.analyzeWithVision(prompt, dataUri);
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as Array<{ originalText: string; quantity: number | null }>;
          allLines.push(...parsed);
        }
      } catch (e) {
        this.logger.warn(`Vision analysis failed for file ${file.name ?? 'unknown'}`, e);
      }
    }

    await this.subscriptions.consumeAiRequest(userId);

    if (!allLines.length) {
      return { matched: [], unavailable: [], uninterpreted: [], totalEstimateXof: 0 };
    }

    const allProducts = await this.catalogService.search({});
    const results = allLines.map(line => this.matchLine(line, allProducts));

    const matched      = results.filter(r => r.status === 'MATCHED');
    const unavailable  = results.filter(r => r.status === 'UNAVAILABLE');
    const uninterpreted = results.filter(r => r.status === 'UNINTERPRETED');
    const totalEstimateXof = matched.reduce((sum, r) => sum + (r.totalXof ?? 0), 0);

    return { matched, unavailable, uninterpreted, totalEstimateXof };
  }

  /**
   * Anti-hallucination: only MATCHED when a real catalog product is found.
   * Unknown lines stay UNAVAILABLE (known material) or UNINTERPRETED (unknown).
   * No price is ever invented.
   */
  private matchLine(
    line: { originalText: string; quantity: number | null },
    catalog: ProductEntity[],
  ): QuoteLineResult {
    if (!line.originalText?.trim()) {
      return { originalText: line.originalText ?? '', status: 'UNINTERPRETED' };
    }

    const text = line.originalText.toLowerCase();
    const match = catalog.find(p => {
      const nameLower = p.name.toLowerCase();
      if (text.includes(nameLower)) return true;
      return nameLower.split(' ').some(word => word.length > 3 && text.includes(word));
    });

    if (!match) {
      const knownMaterials = [
        'ciment', 'sable', 'gravier', 'fer', 'brique', 'parpaing',
        'carrelage', 'peinture', 'tuyau', 'câble', 'cable', 'bois',
        'planche', 'plâtre', 'platre', 'mortier', 'béton', 'beton',
        'agglo', 'chape', 'enduit', 'colle', 'joint', 'robinet', 'dalle',
      ];
      const isKnownMaterial = knownMaterials.some(m => text.includes(m));
      return {
        originalText: line.originalText,
        status: isKnownMaterial ? 'UNAVAILABLE' : 'UNINTERPRETED',
      };
    }

    const quantity = line.quantity ?? 1;
    return {
      originalText: line.originalText,
      status: 'MATCHED',
      product: {
        id: match.id,
        name: match.name,
        priceXof: match.priceXof,
        unit: match.unit,
        merchantName: match.merchantName,
      },
      quantity,
      totalXof: Number(match.priceXof) * quantity,
    };
  }
}
