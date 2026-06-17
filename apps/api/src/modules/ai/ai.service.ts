import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

export interface DecorationVisualizationRequest {
  roomType: string;
  style: string;
  budget: number;
  currentDescription?: string;
  imageUrl?: string;
}

export interface DecorationVisualizationResponse {
  description: string;
  suggestions: string[];
  estimatedCost: { min: number; max: number };
  recommendedArtisans: string[];
}

export interface CostEstimateRequest {
  serviceType: string;
  surfaceArea?: number;
  location: string;
  additionalDetails: string;
}

export interface CostEstimateResponse {
  estimatedCost: { min: number; max: number };
  breakdown: Array<{ item: string; cost: number }>;
  timeline: string;
  notes: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly anthropic: Anthropic;

  constructor(private readonly configService: ConfigService) {
    this.anthropic = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY'),
    });
  }

  async generateDecorationVisualization(
    request: DecorationVisualizationRequest,
  ): Promise<DecorationVisualizationResponse> {
    const prompt = `Tu es un expert en décoration intérieure spécialisé pour le marché ivoirien (Côte d'Ivoire).

Un client souhaite décorer:
- Type de pièce: ${request.roomType}
- Style souhaité: ${request.style}
- Budget: ${request.budget} FCFA
${request.currentDescription ? `- Description actuelle: ${request.currentDescription}` : ''}

Fournis une réponse en JSON avec:
1. Une description détaillée de la décoration recommandée
2. Une liste de 5 suggestions pratiques
3. Une estimation de coût (min/max en FCFA)
4. Les types d'artisans recommandés (ex: peintre, menuisier, etc.)

Réponds uniquement en JSON valide.`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from AI');
      }

      const parsed = JSON.parse(content.text) as DecorationVisualizationResponse;
      return parsed;
    } catch (error) {
      this.logger.error('AI visualization failed', error);
      return {
        description: `Décoration ${request.style} pour votre ${request.roomType}`,
        suggestions: [
          'Choisissez des couleurs adaptées au climat tropical',
          'Privilégiez des matériaux locaux durables',
          'Intégrez des éléments de décoration africaine',
          'Optimisez la ventilation naturelle',
          'Consultez un artisan local certifié FixAI',
        ],
        estimatedCost: { min: request.budget * 0.8, max: request.budget * 1.2 },
        recommendedArtisans: ['Peintre', 'Menuisier', 'Décorateur'],
      };
    }
  }

  async estimateProjectCost(request: CostEstimateRequest): Promise<CostEstimateResponse> {
    const prompt = `Tu es un expert en construction et rénovation en Côte d'Ivoire avec une connaissance des prix du marché local.

Estime le coût pour ce projet:
- Type de service: ${request.serviceType}
- Localisation: ${request.location}
${request.surfaceArea ? `- Surface: ${request.surfaceArea} m²` : ''}
- Détails: ${request.additionalDetails}

Fournis une réponse JSON avec:
1. estimatedCost: {min, max} en FCFA
2. breakdown: liste de {item, cost} pour chaque poste de dépense
3. timeline: durée estimée en jours
4. notes: conseils importants

Base tes estimations sur les prix réels du marché ivoirien en 2024.`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from AI');
      }

      return JSON.parse(content.text) as CostEstimateResponse;
    } catch (error) {
      this.logger.error('AI cost estimation failed', error);
      return {
        estimatedCost: { min: 50000, max: 500000 },
        breakdown: [
          { item: 'Main d\'oeuvre', cost: 200000 },
          { item: 'Matériaux', cost: 200000 },
          { item: 'Frais divers', cost: 50000 },
        ],
        timeline: '3-7 jours',
        notes: 'Estimation indicative. Contactez un artisan pour un devis précis.',
      };
    }
  }
}
