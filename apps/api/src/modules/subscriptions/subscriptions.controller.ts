import { Controller, Get, Post, Patch, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionBilling } from './entities/user-subscription.entity';

@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly service: SubscriptionsService) {}

  // ─── Plans publics ────────────────────────────────────────────────────────

  @Get('plans')
  listPlans() {
    return this.service.listPlans();
  }

  // ─── Admin — gestion des plans ────────────────────────────────────────────

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('plans')
  createPlan(@Body() dto: {
    name: string;
    priceMonthlyXof: number;
    priceAnnualXof: number;
    aiRequestsPerMonth: number;
    devisProMaxFiles: number;
    decorationEnabled: boolean;
    renovationDiagnosisEnabled: boolean;
  }) {
    return this.service.createPlan(dto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('plans/:id')
  updatePlan(@Param('id') id: string, @Body() dto: Partial<{
    name: string;
    priceMonthlyXof: number;
    priceAnnualXof: number;
    aiRequestsPerMonth: number;
    devisProMaxFiles: number;
    decorationEnabled: boolean;
    renovationDiagnosisEnabled: boolean;
    isActive: boolean;
  }>) {
    return this.service.updatePlan(id, dto);
  }

  // ─── Utilisateur — abonnement ─────────────────────────────────────────────

  @Get('my')
  getMy(@Request() req: { user: { sub: string } }) {
    return this.service.getActiveSub(req.user.sub);
  }

  @Get('my/quota')
  getMyQuota(@Request() req: { user: { sub: string } }) {
    return this.service.checkAiQuota(req.user.sub);
  }

  @Post('subscribe')
  subscribe(
    @Request() req: { user: { sub: string } },
    @Body() dto: { planId: string; billing: SubscriptionBilling; paymentRef: string },
  ) {
    return this.service.subscribe(req.user.sub, dto.planId, dto.billing, dto.paymentRef);
  }

  @Delete('cancel')
  cancel(@Request() req: { user: { sub: string } }) {
    return this.service.cancel(req.user.sub);
  }
}
