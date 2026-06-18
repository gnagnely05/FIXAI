import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Get('pending-verifications')
  pendingVerifications() {
    return this.service.getPendingVerifications();
  }

  @Patch('verify/:userId')
  approve(@Param('userId') userId: string) {
    return this.service.approveVerification(userId);
  }

  @Patch('reject/:userId')
  reject(@Param('userId') userId: string, @Body('reason') reason: string) {
    return this.service.rejectVerification(userId, reason);
  }

  @Get('escrow-overview')
  escrowOverview() {
    return this.service.getEscrowOverview();
  }
}
