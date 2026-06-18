import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { CatalogService } from '../catalog/catalog.service';
import { ProductEntity } from '../catalog/entities/product.entity';

export type SupportedMimeType =
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp'
  | 'image/gif'
  | 'application/pdf';

export interface QuoteFile {
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

const IMAGE_MIMES: SupportedMimeType[] = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const PDF_MIME: SupportedMimeType = 'application/pdf';

const ALLOWED_MIMES: SupportedMimeType[] = [...IMAGE_MIMES, PDF_MIME];

@Injectable()
export class DevisProService {
  private readonly logger = new Logger(DevisProService.name);
  private readonly client: Anthropic;

  constructor(private readonly catalogService: CatalogService) {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  async analyzeQuoteFiles(files: QuoteFile[]): Promise<DevisProResult> {
    if (!files.length || files.length > 3) {
      throw new BadRequestException('Provide 1 to 3 files (images or PDFs)');
    }

    for (const f of files) {
      if (!ALLOWED_MIMES.includes(f.mimeType)) {
        throw new BadRequestException(
          `Unsupported file type: ${f.mimeType}. Allowed: JPEG, PNG, WEBP, GIF, PDF`,
        );
      }
    }

    const contentBlocks = this.buildContentBlocks(files);

    const extractionResponse = await this.client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            ...contentBlocks,
            {
              type: 'text',
              text: `Tu es un assistant spécialisé dans la lecture de devis de construction en Côte d'Ivoire.
Analyse ces documents (images et/ou PDF de devis) et extrait UNIQUEMENT les lignes de produits/matériaux.
Ignore les totaux, sous-totaux, TVA, conditions de paiement, en-têtes, pieds de page.
Pour chaque ligne produit, retourne un JSON array avec: {"originalText": "texte exact de la ligne", "quantity": nombre ou null}
Ne retourne QUE le JSON array brut, sans markdown ni explication.`,
            },
          ],
        },
      ],
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

    const allProducts = await this.catalogService.search({});
    const results = rawLines.map(line => this.matchLine(line, allProducts));

    const matched = results.filter(r => r.status === 'MATCHED');
    const unavailable = results.filter(r => r.status === 'UNAVAILABLE');
    const uninterpreted = results.filter(r => r.status === 'UNINTERPRETED');
    const totalEstimateXof = matched.reduce((sum, r) => sum + (r.totalXof ?? 0), 0);

    return { matched, unavailable, uninterpreted, totalEstimateXof };
  }

  private buildContentBlocks(files: QuoteFile[]): Anthropic.MessageParam['content'] {
    const blocks: Anthropic.MessageParam['content'] = [];

    for (const file of files) {
      if (file.mimeType === PDF_MIME) {
        blocks.push({
          type: 'document',
          source: {
            type: 'base64',
            media_type: 'application/pdf',
            data: file.base64,
          },
          ...(file.name ? { title: file.name } : {}),
        } as Anthropic.DocumentBlockParam);
      } else {
        blocks.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: file.mimeType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
            data: file.base64,
          },
        });
      }
    }

    return blocks;
  }

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
