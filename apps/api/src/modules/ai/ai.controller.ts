import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService, GenerateVisualizationDto, RoomType, DecorationStyle } from './ai.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { IsEnum, IsNumber, Min } from 'class-validator';

class EstimateCostDto {
  @IsEnum(RoomType)
  roomType: RoomType;

  @IsNumber()
  @Min(1)
  surfaceM2: number;

  @IsEnum(DecorationStyle)
  style: DecorationStyle;
}

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly service: AiService) {}

  @Post('visualize')
  visualize(@Body() dto: GenerateVisualizationDto) {
    return this.service.generateDecorationVisualization(dto);
  }

  @Post('estimate')
  estimate(@Body() dto: EstimateCostDto) {
    return this.service.estimateDecorationCost(dto.roomType, dto.surfaceM2, dto.style);
  }
}
