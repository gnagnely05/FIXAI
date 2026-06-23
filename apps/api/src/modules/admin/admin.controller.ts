import {
  Controller, Get, Post, Patch, Put, Delete, Param, Body, Query, UseGuards, UnauthorizedException,
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

  // ── Seed admin (one-shot, protected by ADMIN_SETUP_SECRET env var) ────
  // No JWT guard — callable before any admin exists
  @Post('seed-admin')
  async seedAdmin(@Body() body: { setupSecret: string; email: string; password: string; firstName: string; lastName: string }) {
    const secret = process.env.ADMIN_SETUP_SECRET;
    if (!secret || body.setupSecret !== secret) {
      throw new UnauthorizedException('Invalid setup secret');
    }
    return this.service.seedAdmin(body.email, body.password, body.firstName, body.lastName);
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

  // ── Actors CRUD ────────────────────────────────────────────────────

  @Get('actors')
  getActors(@Query('role') role?: string, @Query('status') status?: string, @Query('q') q?: string) {
    return this.service.getActors(role, status, q);
  }

  @Get('actors/:id')
  getActor(@Param('id') id: string) {
    return this.service.getActorById(id);
  }

  @Patch('actors/:id')
  updateActor(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.service.updateActor(id, body);
  }

  @Delete('actors/:id')
  deleteActor(@Param('id') id: string) {
    return this.service.deleteActor(id);
  }

  @Patch('actors/:id/suspend')
  suspendActor(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.service.suspendActor(id, reason);
  }

  @Patch('actors/:id/activate')
  activateActor(@Param('id') id: string) {
    return this.service.activateActor(id);
  }

  // ── Products CRUD ───────────────────────────────────────────────────

  @Get('products')
  getProducts(@Query('merchantId') merchantId?: string, @Query('merchantType') merchantType?: string, @Query('q') q?: string) {
    return this.service.getProducts(merchantId, merchantType, q);
  }

  @Post('products')
  createProduct(@Body() body: Record<string, any>) {
    return this.service.createProduct(body);
  }

  @Put('products/:id')
  updateProduct(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.service.updateProduct(id, body);
  }

  @Delete('products/:id')
  deleteProduct(@Param('id') id: string) {
    return this.service.deleteProduct(id);
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
