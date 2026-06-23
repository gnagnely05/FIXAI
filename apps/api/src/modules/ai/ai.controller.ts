import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AiService } from './ai.service';
import { GenerateDecorationDto } from './dto/decoration.dto';
import { GenerateImageDto } from './dto/generate-image.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly service: AiService) {}

  @Post('decoration/visualize')
  visualize(
    @Request() req: { user: { sub: string } },
    @Body() dto: GenerateDecorationDto,
  ) {
    return this.service.generateDecorationVisualization(req.user.sub, dto);
  }

  @Post('generate')
  generateImage(
    @Request() req: { user: { sub: string } },
    @Body() dto: GenerateImageDto,
  ) {
    return this.service.generateImage(req.user.sub, dto.prompt, dto.imageUrl);
  }

  @Post('analyze')
  analyzeImage(
    @Request() req: { user: { sub: string } },
    @Body() dto: { prompt: string; imageUrl?: string },
  ) {
    return this.service.analyzeImage(req.user.sub, dto.prompt, dto.imageUrl);
  }
}
