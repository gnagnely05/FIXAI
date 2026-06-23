import {
  Controller, Get, Post, Patch, Param, Body, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { AdminService } from './admin.service';
import { VerifyStepDto } from './dto/verify-step.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN as any)
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Get('verifications')
  getVerifications() {
    return this.service.getPendingVerifications();
  }

  @Post('verify-step')
  verifyStep(@Body() dto: VerifyStepDto) {
    return this.service.verifyStep(dto);
  }

  // ── Legacy endpoints (kept for backward compatibility) ─────────────

  @Get('pending-verifications')
  getPendingVerifications() {
    return this.service.getPendingVerifications();
  }

  @Patch('verify/:userId')
  verifyUser(@Param('userId') userId: string) {
    return this.service.verifyUser(userId);
  }

  @Patch('reject/:userId')
  rejectUser(@Param('userId') userId: string, @Body('reason') reason: string) {
    return this.service.rejectUser(userId, reason);
  }

  // ── Commission ─────────────────────────────────────────────────────

  @Get('commission')
  getCommission() {
    return this.service.getActiveCommission();
  }

  @Post('commission')
  updateCommission(@Body() body: { fixaiRate: number; agencyRate: number }) {
    return this.service.updateCommission(body.fixaiRate, body.agencyRate);
  }

  // ── Escrow ─────────────────────────────────────────────────────────

  @Get('escrow-overview')
  getEscrowOverview() {
    return this.service.getEscrowOverview();
  }

  @Get('disputes')
  getDisputes() {
    return this.service.getDisputes();
  }
}
