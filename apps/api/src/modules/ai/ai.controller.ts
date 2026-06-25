import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AiService } from './ai.service';
import { GenerateDecorationDto } from './dto/decoration.dto';
import { GenerateImageDto } from './dto/generate-image.dto';
import { DiagnoseDto } from './dto/diagnose.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('ai')
export class AiController {
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
    return this.service.generateImage(req.user.sub, dto.prompt, dto.imageUrl);
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
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  // Pas de guard — accessible sans connexion pour le tunnel de devis
  @Post('diagnose')
  diagnose(@Body() dto: DiagnoseDto) {
    return this.service.diagnose(dto.serviceType, dto.messages, dto.imageUrls ?? []);
  }

  // Route unifiée génération d'image — provider: "flux" | "gpt"
  @UseGuards(JwtAuthGuard)
  @Post('image')
  generateByProvider(
    @Request() req: { user: { sub: string } },
    @Body() body: { prompt: string; provider?: 'flux' },
  ) {
    return this.service.generateImageByProvider(req.user.sub, body.prompt, body.provider ?? 'flux');
  }
}
