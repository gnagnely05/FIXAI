import { Injectable, BadRequestException, Logger, ServiceUnavailableException } from '@nestjs/common';

export enum RoomType {
  SALON = 'SALON',
  CHAMBRE = 'CHAMBRE',
  CUISINE = 'CUISINE',
  SALLE_DE_BAIN = 'SALLE_DE_BAIN',
  BUREAU = 'BUREAU',
  TERRASSE = 'TERRASSE',
}

export enum DecorationStyle {
  MODERNE = 'MODERNE',
  TRADITIONNEL = 'TRADITIONNEL',
  MINIMALISTE = 'MINIMALISTE',
  AFRICAIN_CONTEMPORAIN = 'AFRICAIN_CONTEMPORAIN',
  TROPICAL = 'TROPICAL',
}

export interface GenerateVisualizationDto {
  roomType: RoomType;
  style: DecorationStyle;
  productIds?: string[];
  additionalNotes?: string;
}

interface BoutiqueProduct {
  id: string;
  name: string;
  category: string;
}

const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  [RoomType.SALON]: 'living room',
  [RoomType.CHAMBRE]: 'bedroom',
  [RoomType.CUISINE]: 'kitchen',
  [RoomType.SALLE_DE_BAIN]: 'bathroom',
  [RoomType.BUREAU]: 'home office',
  [RoomType.TERRASSE]: 'terrace',
};

const STYLE_DESCRIPTORS: Record<DecorationStyle, string> = {
  [DecorationStyle.MODERNE]: 'modern, sleek, minimalist with clean lines',
  [DecorationStyle.TRADITIONNEL]: 'traditional Ivorian, warm wood tones, craft patterns',
  [DecorationStyle.MINIMALISTE]: 'minimalist, neutral colors, uncluttered, zen',
  [DecorationStyle.AFRICAIN_CONTEMPORAIN]: 'contemporary African, bold patterns, earth tones, woven textiles',
  [DecorationStyle.TROPICAL]: 'tropical, lush greenery, natural materials, bright accents',
};

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly replicateToken = process.env.REPLICATE_API_TOKEN!;
  private readonly replicateBaseUrl = 'https://api.replicate.com/v1';
  private readonly fluxModel = 'black-forest-labs/flux-pro';

  /**
   * Generates a decoration visualization image using FLUX.2 Pro via Replicate.
   * Products from the boutiques database are embedded in the prompt.
   */
  async generateDecorationVisualization(dto: GenerateVisualizationDto): Promise<{ imageUrl: string; prompt: string }> {
    const products = await this.fetchBoutiqueProducts(dto.roomType, dto.style, dto.productIds);
    const prompt = this.buildDecorationPrompt(dto.roomType, dto.style, products, dto.additionalNotes);

    this.logger.log(`Generating decoration visualization: ${dto.roomType} / ${dto.style}`);

    const predictionId = await this.createPrediction(prompt);
    const imageUrl = await this.pollPrediction(predictionId);

    return { imageUrl, prompt };
  }

  /**
   * Estimates renovation/decoration cost for a given room type and surface area.
   */
  async estimateDecorationCost(roomType: RoomType, surfaceM2: number, style: DecorationStyle): Promise<{ minCost: number; maxCost: number; currency: string }> {
    // Base cost per m² in FCFA by style
    const costPerM2: Record<DecorationStyle, { min: number; max: number }> = {
      [DecorationStyle.MINIMALISTE]: { min: 15_000, max: 30_000 },
      [DecorationStyle.MODERNE]: { min: 25_000, max: 60_000 },
      [DecorationStyle.TRADITIONNEL]: { min: 20_000, max: 45_000 },
      [DecorationStyle.AFRICAIN_CONTEMPORAIN]: { min: 30_000, max: 70_000 },
      [DecorationStyle.TROPICAL]: { min: 20_000, max: 50_000 },
    };
    const range = costPerM2[style];
    return {
      minCost: range.min * surfaceM2,
      maxCost: range.max * surfaceM2,
      currency: 'XOF',
    };
  }

  private buildDecorationPrompt(
    roomType: RoomType,
    style: DecorationStyle,
    products: BoutiqueProduct[],
    additionalNotes?: string,
  ): string {
    const room = ROOM_TYPE_LABELS[roomType];
    const styleDesc = STYLE_DESCRIPTORS[style];
    const productList = products.length > 0
      ? `, featuring ${products.map((p) => p.name).join(', ')}`
      : '';
    const notes = additionalNotes ? `, ${additionalNotes}` : '';

    return (
      `A beautifully decorated ${room} in Ivory Coast, ${styleDesc} style${productList}. ` +
      `Bright natural light, high-end interior photography, architectural digest quality, ` +
      `warm and inviting atmosphere${notes}. 4K resolution, photorealistic.`
    );
  }

  private async fetchBoutiqueProducts(
    roomType: RoomType,
    style: DecorationStyle,
    productIds?: string[],
  ): Promise<BoutiqueProduct[]> {
    // TODO: Replace with real DB query against boutiques.products table
    // SELECT * FROM products WHERE id = ANY($1) AND category = $2 LIMIT 5
    const mockProducts: Record<RoomType, BoutiqueProduct[]> = {
      [RoomType.SALON]: [
        { id: 'p1', name: 'canapé en rotin tressé', category: 'mobilier' },
        { id: 'p2', name: 'tapis berbère coloré', category: 'textile' },
        { id: 'p3', name: 'table basse en bois d\'iroko', category: 'mobilier' },
      ],
      [RoomType.CHAMBRE]: [
        { id: 'p4', name: 'lit baldaquin en bois massif', category: 'mobilier' },
        { id: 'p5', name: 'tissu kente comme tête de lit', category: 'textile' },
      ],
      [RoomType.CUISINE]: [
        { id: 'p6', name: 'plan de travail en granit local', category: 'materiaux' },
      ],
      [RoomType.SALLE_DE_BAIN]: [
        { id: 'p7', name: 'vasque en céramique artisanale', category: 'sanitaire' },
      ],
      [RoomType.BUREAU]: [
        { id: 'p8', name: 'bureau en acajou massif', category: 'mobilier' },
      ],
      [RoomType.TERRASSE]: [
        { id: 'p9', name: 'salon de jardin en bambou', category: 'mobilier' },
        { id: 'p10', name: 'jardinières en terre cuite', category: 'decoration' },
      ],
    };

    const baseProducts = mockProducts[roomType] ?? [];
    if (productIds && productIds.length > 0) {
      return baseProducts.filter((p) => productIds.includes(p.id));
    }
    return baseProducts.slice(0, 3);
  }

  private async createPrediction(prompt: string): Promise<string> {
    const response = await fetch(`${this.replicateBaseUrl}/models/${this.fluxModel}/predictions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.replicateToken}`,
        'Content-Type': 'application/json',
        Prefer: 'wait',
      },
      body: JSON.stringify({
        input: {
          prompt,
          width: 1024,
          height: 1024,
          output_format: 'webp',
          output_quality: 90,
          safety_tolerance: 2,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Replicate API error: ${error}`);
      throw new ServiceUnavailableException('Service de visualisation temporairement indisponible');
    }

    const prediction = await response.json();
    return prediction.id as string;
  }

  private async pollPrediction(predictionId: string, maxWaitMs = 60_000): Promise<string> {
    const startTime = Date.now();
    const pollInterval = 3_000;

    while (Date.now() - startTime < maxWaitMs) {
      await new Promise((resolve) => setTimeout(resolve, pollInterval));

      const response = await fetch(`${this.replicateBaseUrl}/predictions/${predictionId}`, {
        headers: { Authorization: `Bearer ${this.replicateToken}` },
      });

      if (!response.ok) throw new ServiceUnavailableException('Erreur lors de la vérification du statut');

      const prediction = await response.json();

      if (prediction.status === 'succeeded') {
        const output = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
        if (!output) throw new BadRequestException('Aucune image générée');
        return output as string;
      }

      if (prediction.status === 'failed' || prediction.status === 'canceled') {
        this.logger.error(`Prediction ${predictionId} failed: ${prediction.error}`);
        throw new ServiceUnavailableException('La génération d\'image a échoué');
      }
    }

    throw new ServiceUnavailableException('Délai dépassé pour la génération d\'image (60s)');
  }
}
