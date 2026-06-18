import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { CatalogService } from '../catalog/catalog.service';
import { ProductEntity } from '../catalog/entities/product.entity';

export interface QuoteLineResult {
  originalText: string;
  status: 'MATCHED' | 'UNAVAILABLE' | 'UNINTERPRETED';
  product?: Pick<ProductEntity, 'id' | 'name' | 'priceXof' | 'unit' | 'merchantName'>;
  quantity?: number;
  totalXof?: number; // priceXof * quantity, only when MATCHED
}

export interface DevisProResult {
  matched: QuoteLineResult[];
  unavailable: QuoteLineResult[];
  uninterpreted: QuoteLineResult[];
  totalEstimateXof: number; // sum of matched totals only
}

@Injectable()
export class DevisProService {
  private readonly logger = new Logger(DevisProService.name);
  private readonly client: Anthropic;

  constructor(private readonly catalogService: CatalogService) {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  async analyzeQuoteImages(imageBase64List: string[], mimeTypes: string[]): Promise<DevisProResult> {
    if (!imageBase64List.length || imageBase64List.length > 3) {
      throw new BadRequestException('Provide 1 to 3 quote images');
    }

    // Build image content blocks for Claude vision
    const imageBlocks = imageBase64List.map((b64, i) => ({
      type: 'image' as const,
      source: { type: 'base64' as const, media_type: mimeTypes[i] as 'image/jpeg' | 'image/png' | 'image/webp', data: b64 },
    }));

    // Step 1: Extract raw lines from quote images
    const extractionResponse = await this.client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: [
          ...imageBlocks,
          {
            type: 'text',
            text: `Tu es un assistant spécialisé dans la lecture de devis de construction en Côte d'Ivoire.
Extrait UNIQUEMENT les lignes de produits/matériaux de ces devis.
Pour chaque ligne, retourne un JSON array avec: {"originalText": "texte exact", "quantity": nombre|null}
Ne retourne que le JSON array, rien d'autre.`,
          },
        ],
      }],
    });

    let rawLines: Array<{ originalText: string; quantity: number | null }> = [];
    try {
      const content = extractionResponse.content[0];
      if (content.type === 'text') {
        const jsonMatch = content.text.match(/\[[\s\S]*\]/);
        if (jsonMatch) rawLines = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      this.logger.warn('Failed to parse extraction response', e);
      return { matched: [], unavailable: [], uninterpreted: [], totalEstimateXof: 0 };
    }

    // Step 2: Match each line against real catalog
    const allProducts = await this.catalogService.search({ q: '' });
    const results = await Promise.all(rawLines.map(line => this.matchLine(line, allProducts)));

    const matched = results.filter(r => r.status === 'MATCHED');
    const unavailable = results.filter(r => r.status === 'UNAVAILABLE');
    const uninterpreted = results.filter(r => r.status === 'UNINTERPRETED');
    const totalEstimateXof = matched.reduce((sum, r) => sum + (r.totalXof ?? 0), 0);

    return { matched, unavailable, uninterpreted, totalEstimateXof };
  }

  private async matchLine(
    line: { originalText: string; quantity: number | null },
    catalog: ProductEntity[],
  ): Promise<QuoteLineResult> {
    if (!line.originalText?.trim()) {
      return { originalText: line.originalText, status: 'UNINTERPRETED' };
    }

    // Simple keyword matching against catalog
    const text = line.originalText.toLowerCase();
    const match = catalog.find(p => {
      const nameLower = p.name.toLowerCase();
      return text.includes(nameLower) || nameLower.split(' ').some(word => word.length > 3 && text.includes(word));
    });

    if (!match) {
      // Try to determine if it's recognizable construction material or completely uninterpretable
      const knownMaterials = ['ciment', 'sable', 'gravier', 'fer', 'brique', 'parpaing', 'carrelage', 'peinture', 'tuyau', 'cable', 'bois', 'planche'];
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
      product: { id: match.id, name: match.name, priceXof: match.priceXof, unit: match.unit, merchantName: match.merchantName },
      quantity,
      totalXof: match.priceXof * quantity,
    };
  }
}
