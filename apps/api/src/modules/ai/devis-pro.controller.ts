import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DevisProService, QuoteFile, SupportedMimeType } from './devis-pro.service';

interface AnalyzeQuoteDto {
  files: Array<{ base64: string; mimeType: string; name?: string }>;
}

@Controller('devis-pro')
@UseGuards(JwtAuthGuard)
export class DevisProController {
  constructor(private readonly service: DevisProService) {}

  @Post('analyze')
  analyze(@Body() dto: AnalyzeQuoteDto) {
    if (!dto.files?.length || dto.files.length > 3) {
      throw new BadRequestException('Provide 1 to 3 files (images or PDFs)');
    }
    const files: QuoteFile[] = dto.files.map(f => ({
      base64: f.base64,
      mimeType: f.mimeType as SupportedMimeType,
      name: f.name,
    }));
    return this.service.analyzeQuoteFiles(files);
  }
}
