import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Request, ParseUUIDPipe } from '@nestjs/common';
import { OrdersService, CreateOrderData, CreateDiagnosticData } from './orders.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserEntity } from '../users/entities/user.entity';

interface AuthUser { sub: string; role: string }

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(
    @Request() req: { user: UserEntity & AuthUser },
    @Body() body: CreateOrderData,
  ) {
    return this.ordersService.create(req.user, body);
  }

  /** Le client réserve un diagnostic sur place (problème complexe). */
  @Post('diagnostic')
  async createDiagnostic(
    @Request() req: { user: UserEntity & AuthUser },
    @Body() body: CreateDiagnosticData,
  ) {
    return this.ordersService.createDiagnostic(req.user, body);
  }

  /** Missions de diagnostic ouvertes, visibles par les artisans. */
  @Get('diagnostics/available')
  async availableDiagnostics(@Query('city') city?: string) {
    return this.ordersService.findAvailableDiagnostics(city);
  }

  /** Un artisan accepte une mission de diagnostic. */
  @Patch(':id/accept-diagnostic')
  async acceptDiagnostic(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: AuthUser },
  ) {
    return this.ordersService.acceptDiagnostic(id, req.user.sub);
  }

  @Get('my')
  async getMyOrders(@Request() req: { user: AuthUser }) {
    const { sub, role } = req.user;
    if (role === 'ARTISAN') return this.ordersService.findByArtisanUserId(sub);
    if (role === 'AGENCE_HOTE' || role === 'ENTREPRISE_BTP') return this.ordersService.findByAgency(sub);
    return this.ordersService.findByClient(sub);
  }

  /** Litiges dont l'agence/BTP connectée est gestionnaire */
  @Get('disputes/mine')
  async getMyDisputes(@Request() req: { user: AuthUser }) {
    return this.ordersService.findDisputesByHandler(req.user.sub);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findById(id);
  }

  /**
   * Règle 3 : AGENCE_HOTE bloquée — ForbiddenException renvoyée par le service.
   * Seuls ARTISAN et ENTREPRISE_BTP peuvent confirmer.
   */
  @Patch(':id/confirm')
  async confirm(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: AuthUser },
  ) {
    return this.ordersService.confirm(id, req.user.sub, req.user.role);
  }

  @Patch(':id/complete')
  async complete(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: AuthUser },
  ) {
    return this.ordersService.complete(id, req.user.sub);
  }

  @Patch(':id/cancel')
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: AuthUser },
  ) {
    return this.ordersService.cancel(id, req.user.sub);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { status: string },
    @Request() req: { user: AuthUser },
  ) {
    return this.ordersService.updateStatus(id, body.status, req.user.sub);
  }

  /**
   * Règle 3 : AGENCE_HOTE → assigne sans confirmer (artisan doit confirmer ensuite).
   * ENTREPRISE_BTP → assigne + confirme directement.
   */
  @Patch(':id/assign')
  async assign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { artisanId: string },
    @Request() req: { user: AuthUser },
  ) {
    return this.ordersService.assignArtisan(id, body.artisanId, req.user.sub, req.user.role);
  }

  /** Règle 2 : ouverture d'un litige — auto-assignation du gestionnaire */
  @Patch(':id/dispute')
  async openDispute(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { reason?: string },
    @Request() req: { user: AuthUser },
  ) {
    return this.ordersService.openDispute(id, req.user.sub, body.reason);
  }

  /** Règle 2 : résolution d'un litige par l'agence/BTP ou l'admin */
  @Patch(':id/resolve-dispute')
  async resolveDispute(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { outcome: 'CLIENT' | 'ARTISAN'; resolution: string },
    @Request() req: { user: AuthUser },
  ) {
    return this.ordersService.resolveDispute(id, req.user.sub, req.user.role, body.outcome, body.resolution);
  }
}
