import { Controller, Post, Body, UseGuards, Request, Get, Logger } from '@nestjs/common';
import { AiService } from './ai.service';
import { GenerateDecorationDto } from './dto/decoration.dto';
import { GenerateImageDto } from './dto/generate-image.dto';
import { DiagnoseDto } from './dto/diagnose.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);
  constructor(private readonly service: AiService) {}

  @UseGuards(JwtAuthGuard)
  @Post('decoration/visualize')
  visualize(
    @Request() req: { user: { sub: string } },
    @Body() dto: GenerateDecorationDto,
  ) {
    return this.service.generateDecorationVisualization(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('generate')
  generateImage(
    @Request() req: { user: { sub: string } },
    @Body() dto: GenerateImageDto,
  ) {
    return this.service.generateImage(req.user.sub, dto.prompt);
  }

  @UseGuards(JwtAuthGuard)
  @Post('analyze')
  analyzeImage(
    @Request() req: { user: { sub: string } },
    @Body() dto: { prompt: string; imageUrl?: string },
  ) {
    return this.service.analyzeImage(req.user.sub, dto.prompt, dto.imageUrl);
  }

  @Get('health')
  health() {
    return {
      status: 'ok',
      build: 'v2-pro-activation',
      hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY,
      timestamp: new Date().toISOString(),
    };
  }

  /** Auto-test OpenRouter — renvoie la réponse réelle ou l'erreur exacte. */
  @Get('selftest')
  selftest() {
    return this.service.pingOpenRouter();
  }

  /** Auto-test génération d'image. */
  @Get('selftest-image')
  selftestImage() {
    return this.service.pingOpenRouterImage();
  }

  // Rénovation — connexion obligatoire + consomme le quota IA
  @UseGuards(JwtAuthGuard)
  @Post('renovation-quote')
  renovationQuote(
    @Request() req: { user: { sub: string } },
    @Body() dto: DiagnoseDto,
  ) {
    return this.service.diagnoseRenovation(req.user.sub, dto.messages, dto.imageUrls ?? [], dto.clientTurns ?? 4);
  }

  // Réparation (dépannage) : connexion requise (portefeuille/paiement) mais
  // SANS quota IA — le diagnostic reste gratuit.
  @UseGuards(JwtAuthGuard)
  @Post('diagnose')
  async diagnose(@Body() dto: DiagnoseDto) {
    try {
      return await this.service.diagnose(dto.serviceType, dto.messages, dto.imageUrls ?? [], dto.clientTurns ?? 1);
    } catch (err) {
      this.logger.error('[diagnose] Unexpected error:', err);
      const serviceType = dto.serviceType ?? 'DEPANNAGE';
      const priceMap: Record<string, [number, number]> = {
        DEPANNAGE:  [15000,  60000],
        RENOVATION: [150000, 800000],
        DECORATION: [80000,  400000],
      };
      const [min, max] = priceMap[serviceType] ?? [15000, 60000];
      return {
        summary: "J'ai bien reçu votre demande. Je prépare une analyse.",
        detectedIssue: `Demande de ${serviceType.toLowerCase()} — analyse en cours`,
        question: "Pour affiner le devis, pouvez-vous préciser l'urgence de votre besoin ?",
        options: ["C'est urgent (< 24h)", "Dans la semaine", "Pas pressé — je planifie"],
        estimatedPriceMinXof: min,
        estimatedPriceMaxXof: max,
      };
    }
  }

  // Route unifiée génération d'image — provider: "flux" | "gpt"
  @UseGuards(JwtAuthGuard)
  @Post('image')
  generateByProvider(
    @Request() req: { user: { sub: string } },
    @Body() body: { prompt: string; provider?: 'flux' },
  ) {
    return this.service.generateImageByProvider(req.user.sub, body.prompt);
  }
}
