import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { GenerateDecorationDto } from './dto/decoration.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly service: AiService) {}

  @Post('decoration/visualize')
  visualize(@Body() dto: GenerateDecorationDto) {
    return this.service.generateDecorationVisualization(dto);
  }
}
