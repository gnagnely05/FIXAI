import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DevisProService } from './devis-pro.service';

interface AnalyzeQuoteDto {
  images: Array<{ base64: string; mimeType: string }>;
}

@Controller('devis-pro')
@UseGuards(JwtAuthGuard)
export class DevisProController {
  constructor(private readonly service: DevisProService) {}

  @Post('analyze')
  analyze(@Body() dto: AnalyzeQuoteDto) {
    if (!dto.images || dto.images.length === 0 || dto.images.length > 3) {
      throw new BadRequestException('Provide 1 to 3 images');
    }
    return this.service.analyzeQuoteImages(
      dto.images.map(i => i.base64),
      dto.images.map(i => i.mimeType),
    );
  }
}
