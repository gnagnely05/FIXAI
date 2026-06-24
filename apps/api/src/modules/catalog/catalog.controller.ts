import { Controller, Get, Post, Patch, Delete, Query, Param, Body, UseGuards, Request } from '@nestjs/common';
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

  // Static shop routes MUST come before :id to avoid "shop" being parsed as a UUID
  @UseGuards(JwtAuthGuard)
  @Get('shop/my-products')
  myProducts(@Request() req: any) {
    return this.service.findAllByMerchant(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('shop/:id/promote')
  promoteProduct(
    @Param('id') id: string,
    @Body() body: { isPromoted: boolean; promotedUntil?: string },
    @Request() req: any,
  ) {
    return this.service.setPromoted(
      id,
      req.user.sub,
      body.isPromoted,
      body.promotedUntil ? new Date(body.promotedUntil) : undefined,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('shop/:id')
  updateProduct(@Param('id') id: string, @Body() data: Partial<CreateProductDto>, @Request() req: any) {
    return this.service.update(id, req.user.sub, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('shop/:id')
  removeProduct(@Param('id') id: string, @Request() req: any) {
    return this.service.remove(id, req.user.sub);
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
