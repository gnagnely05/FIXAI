import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Get('pending-verifications')
  @Roles(UserRole.ADMIN as any)
  getPendingVerifications() {
    return this.service.getPendingVerifications();
  }

  @Patch('verify/:userId')
  @Roles(UserRole.ADMIN as any)
  verifyUser(@Param('userId') userId: string) {
    return this.service.verifyUser(userId);
  }

  @Patch('reject/:userId')
  @Roles(UserRole.ADMIN as any)
  rejectUser(@Param('userId') userId: string, @Body('reason') reason: string) {
    return this.service.rejectUser(userId, reason);
  }

  @Get('escrow-overview')
  @Roles(UserRole.ADMIN as any)
  getEscrowOverview() {
    return this.service.getEscrowOverview();
  }

  @Get('disputes')
  @Roles(UserRole.ADMIN as any)
  getDisputes() {
    return this.service.getDisputes();
  }
}
