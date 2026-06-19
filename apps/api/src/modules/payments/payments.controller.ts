import { Controller, Post, Get, Body, Param, Request, UseGuards } from '@nestjs/common';
import { PaymentsService, InitiateEscrowDto, CinetPayWebhookPayload } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('initiate')
  initiate(@Body() dto: InitiateEscrowDto) {
    return this.service.initiateEscrow(dto);
  }

  /** CinetPay webhook — public endpoint, no JWT. Signature verified inside service. */
  @Post('webhook')
  webhook(@Body() payload: CinetPayWebhookPayload) {
    return this.service.handleCinetPayWebhook(payload);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post(':id/release')
  release(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.service.releaseEscrow(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post(':id/refund')
  refund(@Param('id') id: string, @Body('reason') reason: string, @Request() req: { user: { id: string } }) {
    return this.service.refundEscrow(id, req.user.id, reason);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/status')
  status(@Param('id') id: string) {
    return this.service.getEscrowStatus(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('fees/:amount')
  fees(@Param('amount') amount: string) {
    return this.service.calculateFees(parseInt(amount, 10));
  }
}
