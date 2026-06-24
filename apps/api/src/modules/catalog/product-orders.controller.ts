import { Controller, Post, Get, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ProductOrdersService, CreateProductOrderDto } from './product-orders.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('product-orders')
export class ProductOrdersController {
  constructor(private readonly service: ProductOrdersService) {}

  @Post()
  create(@Request() req: any, @Body() dto: CreateProductOrderDto) {
    return this.service.create(req.user, dto);
  }

  @Get('my')
  findMine(@Request() req: any) {
    return this.service.findByClient(req.user.sub);
  }

  @Get('shop/mine')
  findShopOrders(@Request() req: any) {
    return this.service.findByMerchant(req.user.sub);
  }

  @Get('shop/stats')
  getShopStats(@Request() req: any) {
    return this.service.getMerchantStats(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id/trigger-escrow')
  triggerEscrow(@Param('id') id: string, @Request() req: any) {
    return this.service.triggerEscrowAndProcess(id, req.user.sub);
  }

  @Patch(':id/ready')
  markReady(@Param('id') id: string, @Request() req: any) {
    return this.service.markReady(id, req.user.sub);
  }

  @Patch(':id/delivered')
  markDelivered(@Param('id') id: string, @Request() req: any) {
    return this.service.markDelivered(id, req.user.sub);
  }

  @Delete(':id')
  cancel(@Param('id') id: string, @Request() req: any) {
    return this.service.cancelOrder(id, req.user.sub);
  }
}
