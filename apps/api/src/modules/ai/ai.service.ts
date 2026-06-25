import { Injectable, Logger } from '@nestjs/common';
import { CatalogService } from '../catalog/catalog.service';
import { ProductEntity } from '../catalog/entities/product.entity';
import { ReplicateService } from './replicate.service';
import { OpenRouterService } from './openrouter.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import {
  GenerateDecorationDto,
  RoomType,
  DecoStyle,
  Problem,
  BudgetRange,
} from './dto/decoration.dto';

const BUDGET_MAX: Record<BudgetRange, number> = {
  MOINS_100K:  100_000,
  '100K_300K': 300_000,
  '300K_500K': 500_000,
  PLUS_500K:   Infinity,
};

const ROOM_EN: Record<RoomType, string> = {
  SALON:          'living room',
  CHAMBRE:        'bedroom',
  BUREAU:         'home office',
  CUISINE:        'kitchen',
  SALLE_A_MANGER: 'dining room',
  SALLE_DE_BAIN:  'bathroom',
};

const STYLE_DESC: Record<DecoStyle, string> = {
  MODERNE_EPURE:     'modern and minimalist with clean lines, neutral tones, sleek furniture',
  CHAUD_NATUREL:     'warm and natural, wood tones, cosy textures, tropical plants, earthy palette',
  COLORE_VIVANT:     'colorful and vibrant, bold accents, playful patterns, energetic atmosphere',
  CLASSIQUE_ELEGANT: 'classic and elegant, rich fabrics, refined details, timeless décor',
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

  constructor(
    private readonly catalogService: CatalogService,
    private readonly replicate: ReplicateService,
    private readonly openRouter: OpenRouterService,
    private readonly subscriptions: SubscriptionsService,
  ) {}

  async generateDecorationVisualization(userId: string, dto: GenerateDecorationDto): Promise<DecorationResult> {
    await this.subscriptions.assertAiAllowed(userId);

    const { products, excluded } = await this.selectProducts(dto);
    const prompt = this.buildPrompt(dto, products);

    this.logger.log(`[Décoration] ${dto.roomType} / ${dto.style} — ${products.length} produits`);

    const imageUrl = await this.replicate.generateImage(prompt, { baseImageUrl: dto.roomPhotoUrl });
    await this.subscriptions.consumeAiRequest(userId);

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

  private async selectProducts(dto: GenerateDecorationDto): Promise<{ products: ProductEntity[]; excluded: string[] }> {
    const budgetMax = BUDGET_MAX[dto.budget];
    const excluded: string[] = [];

    let allProducts = await this.catalogService.search({
      maxPrice: budgetMax === Infinity ? undefined : budgetMax,
    });

    if (dto.productIds?.length) {
      const specific = await Promise.all(
        dto.productIds.map(id => this.catalogService.findOne(id).catch(() => null)),
      );
      allProducts = specific.filter(Boolean) as ProductEntity[];
    }

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

    const selected: ProductEntity[] = [];
    let running = 0;
    for (const p of allProducts.slice(0, 20)) {
      const price = Number(p.priceXof);
      if (running + price <= budgetMax) { selected.push(p); running += price; }
      if (selected.length >= 8) break;
    }

    return { products: selected, excluded };
  }

  private buildPrompt(dto: GenerateDecorationDto, products: ProductEntity[]): string {
    const parts: string[] = [];
    parts.push(`A beautifully decorated ${ROOM_EN[dto.roomType]} in Ivory Coast, ${STYLE_DESC[dto.style]} style.`);

    const problemDirectives: Record<Problem, string> = {
      PAS_LUMINEUX:     'Prioritize large mirrors, light wall colors, and multiple light sources to maximize brightness.',
      TROP_CHARGE:      'Use minimalist furniture placement, built-in storage, uncluttered layout.',
      COULEURS_TERNES:  'Introduce a warm accent color palette, vibrant cushions and soft furnishings.',
      MEUBLES_VIEUX:    'Feature modern updated furniture pieces as focal points.',
      MANQUE_RANGEMENT: 'Include clever built-in shelving and storage solutions.',
      ENVIE_CHANGEMENT: 'Create a transformed, refreshed atmosphere with updated decor.',
    };
    for (const p of dto.problems) {
      if (problemDirectives[p]) parts.push(problemDirectives[p]);
    }

    if (dto.occupants === 'FAMILLE_ENFANTS') {
      parts.push('Child-safe rounded furniture edges, durable materials, low accessible storage.');
    }
    if (dto.isTenant) {
      parts.push('No wall painting, no drilling, no structural changes — only furniture and accessories.');
    }
    if (dto.isOpenSpace && dto.roomType === 'SALON') {
      parts.push('Coordinated color palette with open kitchen area visible in background.');
    }
    if (dto.keepItemsDescription) {
      parts.push(`Keep and integrate the existing item(s): ${dto.keepItemsDescription}.`);
    }
    if (products.length > 0) {
      parts.push(`Feature these real products: ${products.map(p => p.name).join(', ')}.`);
    }
    parts.push(
      'Bright natural light, high-end interior photography, architectural digest quality.',
      '4K resolution, photorealistic, warm and inviting.',
    );

    return parts.join(' ');
  }

  async diagnose(
    serviceType: string,
    messages: string[],
    imageUrls: string[],
  ): Promise<{
    summary: string;
    detectedIssue: string;
    question: string;
    options: string[];
    estimatedPriceMinXof: number;
    estimatedPriceMaxXof: number;
  }> {
    const serviceLabels: Record<string, string> = {
      DEPANNAGE: 'réparation / dépannage',
      RENOVATION: 'rénovation',
      DECORATION: "décoration d'intérieur",
    };
    const label = serviceLabels[serviceType] ?? serviceType;
    const conversation = messages.join('\n');

    const systemInstruction = `Tu es un expert en ${label} en Côte d'Ivoire.
Analyse la description du client et réponds UNIQUEMENT en JSON valide avec exactement ces champs :
{
  "summary": "résumé clair du problème en 1-2 phrases",
  "detectedIssue": "problème technique détecté",
  "question": "une question de précision pour mieux qualifier le besoin",
  "options": ["option A", "option B", "option C"],
  "estimatedPriceMinXof": <nombre entier en FCFA>,
  "estimatedPriceMaxXof": <nombre entier en FCFA>
}
Ne fournis aucun texte en dehors du JSON.`;

    try {
      let raw: string;
      if (imageUrls.length > 0) {
        raw = await this.replicate.analyzeWithVision(
          `${systemInstruction}\n\nDescription du client : ${conversation}`,
          imageUrls[0],
        );
      } else {
        raw = await this.openRouter.chat(conversation, systemInstruction);
      }
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (err) {
      this.logger.warn(`[Diagnose] OpenRouter failed: ${err}`);
    }

    // Fallback contextuel si Gemini échoue
    const lastMsg = messages[messages.length - 1] ?? '';
    const priceMap: Record<string, [number, number]> = {
      DEPANNAGE:  [15000,  60000],
      RENOVATION: [150000, 800000],
      DECORATION: [80000,  400000],
    };
    const [minPrice, maxPrice] = priceMap[serviceType] ?? [15000, 60000];
    return {
      summary: `J'ai bien reçu votre demande : "${lastMsg.slice(0, 80)}". Je prépare une analyse pour votre projet de ${label}.`,
      detectedIssue: `Demande de ${label} — analyse en cours`,
      question: 'Pour affiner le devis, pouvez-vous préciser l\'urgence de votre besoin ?',
      options: ['C\'est urgent (< 24h)', 'Dans la semaine', 'Pas pressé — je planifie'],
      estimatedPriceMinXof: minPrice,
      estimatedPriceMaxXof: maxPrice,
    };
  }

  async generateImage(userId: string, prompt: string, baseImageUrl?: string): Promise<string> {
    await this.subscriptions.assertAiAllowed(userId);
    const imageUrl = await this.replicate.generateImage(prompt, { baseImageUrl });
    await this.subscriptions.consumeAiRequest(userId);
    return imageUrl;
  }

  // Registre de providers — le frontend choisit "flux" ou "gpt"
  async generateImageByProvider(
    userId: string,
    prompt: string,
    provider: 'flux' = 'flux',
  ): Promise<string> {
    await this.subscriptions.assertAiAllowed(userId);
    const imageProviders: Record<string, () => Promise<string>> = {
      flux: () => this.replicate.generateImage(prompt),
    };
    const fn = imageProviders[provider] ?? imageProviders['flux'];
    const url = await fn();
    await this.subscriptions.consumeAiRequest(userId);
    return url;
  }

  async analyzeImage(userId: string, prompt: string, imageUrl?: string): Promise<string> {
    await this.subscriptions.assertAiAllowed(userId);
    const analysis = await this.replicate.analyzeWithVision(prompt, imageUrl);
    await this.subscriptions.consumeAiRequest(userId);
    return analysis;
  }

}
