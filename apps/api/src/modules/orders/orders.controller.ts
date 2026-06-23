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
  async getMyOrders(@Request() req: { user: UserEntity & { sub: string } }) {
    const role = (req.user as any).role;
    if (role === 'ARTISAN') return this.ordersService.findByArtisanUserId(req.user.sub);
    if (role === 'AGENCE_HOTE' || role === 'ENTREPRISE_BTP') return this.ordersService.findByAgency(req.user.sub);
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

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { status: string },
    @Request() req: { user: { sub: string } },
  ) {
    return this.ordersService.updateStatus(id, body.status, req.user.sub);
  }

  @Patch(':id/assign')
  async assign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { artisanId: string },
    @Request() req: { user: { sub: string } },
  ) {
    return this.ordersService.assignArtisan(id, body.artisanId, req.user.sub);
  }
}
