import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request, ParseUUIDPipe } from '@nestjs/common';
import { OrdersService, CreateOrderData } from './orders.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserEntity } from '../users/entities/user.entity';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(
    @Request() req: { user: UserEntity & { sub: string } },
    @Body() body: CreateOrderData,
  ) {
    return this.ordersService.create(req.user, body);
  }

  @Get('my')
  async getMyOrders(@Request() req: { user: { sub: string } }) {
    return this.ordersService.findByClient(req.user.sub);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findById(id);
  }

  @Patch(':id/confirm')
  async confirm(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: { sub: string } },
  ) {
    return this.ordersService.confirm(id, req.user.sub);
  }

  @Patch(':id/complete')
  async complete(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: { sub: string } },
  ) {
    return this.ordersService.complete(id, req.user.sub);
  }

  @Patch(':id/cancel')
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: { sub: string } },
  ) {
    return this.ordersService.cancel(id, req.user.sub);
  }
}
