import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AiService } from './ai.service';
import { GenerateDecorationDto } from './dto/decoration.dto';
import { GenerateImageDto } from './dto/generate-image.dto';
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

  // Pas de guard — accessible sans connexion pour le tunnel de devis
  @Post('diagnose')
  diagnose(
    @Body() body: { serviceType: string; messages: string[]; imageUrls?: string[] },
  ) {
    return this.service.diagnose(body.serviceType, body.messages, body.imageUrls ?? []);
  }
}
