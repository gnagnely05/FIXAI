import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService, DecorationVisualizationRequest, CostEstimateRequest } from './ai.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('visualize')
  async visualize(@Body() body: DecorationVisualizationRequest) {
    return this.aiService.generateDecorationVisualization(body);
  }

  @Post('estimate')
  async estimate(@Body() body: CostEstimateRequest) {
    return this.aiService.estimateProjectCost(body);
  }
}
