import { Controller, Get, Post, Query, Param, Body, UseGuards } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { SearchCatalogDto, CreateProductDto } from './dto/catalog.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly service: CatalogService) {}

  @Get()
  search(@Query() dto: SearchCatalogDto) {
    return this.service.search(dto);
  }

  @Get('boutiques')
  boutiques() {
    return this.service.findBoutiques();
  }

  @Get('quincailleries')
  quincailleries() {
    return this.service.findQuincailleries();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }
}
