import { Injectable, BadRequestException, Logger, ServiceUnavailableException } from '@nestjs/common';
import { CatalogService } from '../catalog/catalog.service';
import { ProductEntity } from '../catalog/entities/product.entity';
import {
  GenerateDecorationDto,
  RoomType,
  DecoStyle,
  OccupantType,
  BudgetRange,
  Problem,
} from './dto/decoration.dto';

// ─── Budget ceilings in XOF ───────────────────────────────────────────────────
const BUDGET_MAX: Record<BudgetRange, number> = {
  MOINS_100K:   100_000,
  '100K_300K':  300_000,
  '300K_500K':  500_000,
  PLUS_500K:    Infinity,
};

// ─── Room labels for the FLUX prompt ─────────────────────────────────────────
const ROOM_EN: Record<RoomType, string> = {
  SALON:          'living room',
  CHAMBRE:        'bedroom',
  BUREAU:         'home office',
  CUISINE:        'kitchen',
  SALLE_A_MANGER: 'dining room',
  SALLE_DE_BAIN:  'bathroom',
};

// ─── Style descriptors for FLUX ───────────────────────────────────────────────
const STYLE_DESC: Record<DecoStyle, string> = {
  MODERNE_EPURE:    'modern and minimalist with clean lines, neutral tones, sleek furniture',
  CHAUD_NATUREL:    'warm and natural, wood tones, cosy textures, tropical plants, earthy palette',
  COLORE_VIVANT:    'colorful and vibrant, bold accents, playful patterns, energetic atmosphere',
  CLASSIQUE_ELEGANT:'classic and elegant, rich fabrics, refined details, timeless décor',
};

export interface DecorationResult {
  imageUrl: string;
  prompt: string;
  selectedProducts: Array<Pick<ProductEntity, 'id' | 'name' | 'priceXof' | 'unit' | 'merchantName'>>;
  totalEstimateXof: number;
  excludedConstraints: string[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly replicateToken = process.env.REPLICATE_API_TOKEN!;
  private readonly replicateBaseUrl = 'https://api.replicate.com/v1';
  private readonly fluxModel = 'black-forest-labs/flux-pro';

  constructor(private readonly catalogService: CatalogService) {}

  async generateDecorationVisualization(dto: GenerateDecorationDto): Promise<DecorationResult> {
    const { products, excluded } = await this.selectProducts(dto);
    const prompt = this.buildPrompt(dto, products);

    this.logger.log(`[Décoration] ${dto.roomType} / ${dto.style} — ${products.length} produits sélectionnés`);

    const predictionId = await this.createPrediction(prompt, dto.roomPhotoUrl);
    const imageUrl = await this.pollPrediction(predictionId);

    const totalEstimateXof = products.reduce((sum, p) => sum + Number(p.priceXof), 0);

    return {
      imageUrl,
      prompt,
      selectedProducts: products.map(p => ({
        id: p.id, name: p.name, priceXof: p.priceXof, unit: p.unit, merchantName: p.merchantName,
      })),
      totalEstimateXof,
      excludedConstraints: excluded,
    };
  }

  // ─── Product selection with conditional logic ──────────────────────────────

  private async selectProducts(dto: GenerateDecorationDto): Promise<{
    products: ProductEntity[];
    excluded: string[];
  }> {
    const budgetMax = BUDGET_MAX[dto.budget];
    const excluded: string[] = [];

    // Start with all available products filtered by name/category
    let allProducts = await this.catalogService.search({ maxPrice: budgetMax === Infinity ? undefined : budgetMax });

    // If specific product IDs requested, use those as base
    if (dto.productIds?.length) {
      const specific = await Promise.all(
        dto.productIds.map(id => this.catalogService.findOne(id).catch(() => null)),
      );
      allProducts = specific.filter(Boolean) as ProductEntity[];
    }

    // Conditional exclusions per the brief
    if (dto.isTenant) {
      const tenantExclusions = ['peinture murale', 'papier peint', 'fixation murale', 'perçage'];
      allProducts = allProducts.filter(p =>
        !tenantExclusions.some(ex => p.name.toLowerCase().includes(ex)),
      );
      excluded.push('Peinture murale, fixations murales, papier peint (locataire)');
    }

    if (dto.occupants === 'FAMILLE_ENFANTS') {
      allProducts = allProducts.filter(p => {
        const n = p.name.toLowerCase();
        return !['verre', 'bord vif', 'fragile'].some(kw => n.includes(kw));
      });
      excluded.push('Articles en verre ou fragiles (famille avec enfants)');
    }

    // Apply budget ceiling to total
    const selected: ProductEntity[] = [];
    let running = 0;
    for (const p of allProducts.slice(0, 20)) {
      const price = Number(p.priceXof);
      if (running + price <= budgetMax) {
        selected.push(p);
        running += price;
      }
      if (selected.length >= 8) break;
    }

    return { products: selected, excluded };
  }

  // ─── Prompt builder — conditional per every answer ─────────────────────────

  private buildPrompt(dto: GenerateDecorationDto, products: ProductEntity[]): string {
    const room = ROOM_EN[dto.roomType];
    const styleDesc = STYLE_DESC[dto.style];
    const parts: string[] = [];

    parts.push(`A beautifully decorated ${room} in Ivory Coast, ${styleDesc} style.`);

    // Problem-driven directives
    const problemDirectives: Record<Problem, string> = {
      PAS_LUMINEUX:       'Prioritize large mirrors, light wall colors, and multiple light sources to maximize brightness.',
      TROP_CHARGE:        'Use minimalist furniture placement, built-in storage, uncluttered layout.',
      COULEURS_TERNES:    'Introduce a warm accent color palette, vibrant cushions and soft furnishings.',
      MEUBLES_VIEUX:      'Feature modern updated furniture pieces as focal points.',
      MANQUE_RANGEMENT:   'Include clever built-in shelving and storage solutions.',
      ENVIE_CHANGEMENT:   'Create a transformed, refreshed atmosphere with updated decor.',
    };
    for (const p of dto.problems) {
      if (problemDirectives[p]) parts.push(problemDirectives[p]);
    }

    // Occupant-specific
    if (dto.occupants === 'FAMILLE_ENFANTS') {
      parts.push('Child-safe rounded furniture edges, durable materials, low accessible storage.');
    }

    // Tenant constraint
    if (dto.isTenant) {
      parts.push('No wall painting, no drilling, no structural changes — only furniture and accessories.');
    }

    // Open space
    if (dto.isOpenSpace && dto.roomType === 'SALON') {
      parts.push('Coordinated color palette with open kitchen area visible in background.');
    }

    // Keep existing items
    if (dto.keepItemsDescription) {
      parts.push(`Keep and integrate the existing item(s): ${dto.keepItemsDescription}.`);
    }

    // Products from catalog
    if (products.length > 0) {
      parts.push(`Feature these real products: ${products.map(p => p.name).join(', ')}.`);
    }

    parts.push(
      'Bright natural light, high-end interior photography, architectural digest quality.',
      '4K resolution, photorealistic, warm and inviting.',
    );

    return parts.join(' ');
  }

  // ─── Replicate FLUX.2 Pro integration ────────────────────────────────────

  private async createPrediction(prompt: string, roomPhotoUrl?: string): Promise<string> {
    const input: Record<string, unknown> = {
      prompt,
      width: 1024,
      height: 1024,
      output_format: 'webp',
      output_quality: 90,
      safety_tolerance: 2,
    };

    // img2img: use the room photo as starting point when provided
    if (roomPhotoUrl) {
      input.image = roomPhotoUrl;
      input.prompt_strength = 0.75; // how much to deviate from original
    }

    const response = await fetch(`${this.replicateBaseUrl}/models/${this.fluxModel}/predictions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.replicateToken}`,
        'Content-Type': 'application/json',
        Prefer: 'wait',
      },
      body: JSON.stringify({ input }),
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
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      await new Promise(r => setTimeout(r, 3_000));

      const res = await fetch(`${this.replicateBaseUrl}/predictions/${predictionId}`, {
        headers: { Authorization: `Bearer ${this.replicateToken}` },
      });
      if (!res.ok) throw new ServiceUnavailableException('Erreur vérification statut');

      const p = await res.json();
      if (p.status === 'succeeded') {
        const out = Array.isArray(p.output) ? p.output[0] : p.output;
        if (!out) throw new BadRequestException('Aucune image générée');
        return out as string;
      }
      if (p.status === 'failed' || p.status === 'canceled') {
        throw new ServiceUnavailableException(`Génération échouée: ${p.error ?? 'raison inconnue'}`);
      }
    }
    throw new ServiceUnavailableException('Délai dépassé (60s) pour la génération d\'image');
  }
}
