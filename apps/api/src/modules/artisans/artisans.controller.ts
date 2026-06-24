import { Controller, Get, Patch, Delete, Param, Query, Body, UseGuards, ParseUUIDPipe, Request } from '@nestjs/common';
import { ArtisansService, ArtisanSearchQuery } from './artisans.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ArtisanSpecialty } from './entities/artisan.entity';

interface AuthUser { sub: string; role: string }

@Controller('artisans')
@UseGuards(JwtAuthGuard)
export class ArtisansController {
  constructor(private readonly artisansService: ArtisansService) {}

  @Get()
  async findAll(
    @Query('specialty') specialty?: ArtisanSpecialty,
    @Query('city') city?: string,
    @Query('minRating') minRating?: number,
    @Query('maxHourlyRate') maxHourlyRate?: number,
    @Query('isAvailable') isAvailable?: boolean,
    @Query('isVerified') isVerified?: boolean,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const query: ArtisanSearchQuery = { specialty, city, minRating, maxHourlyRate, isAvailable, isVerified, page, limit };
    return this.artisansService.findAll(query);
  }

  /** Artisans affiliés à l'agence/BTP connectée */
  @Get('my-agency')
  async getMyAgencyArtisans(@Request() req: { user: AuthUser }) {
    return this.artisansService.findByAgency(req.user.sub);
  }

  @Get('availability/me')
  async getMyAvailability(@Request() req: { user: AuthUser }) {
    return this.artisansService.getAvailability(req.user.sub);
  }

  @Patch('availability/me')
  async updateMyAvailability(
    @Request() req: { user: AuthUser },
    @Body() body: { isAvailable: boolean; availableDays?: string[]; availableSlots?: string[] },
  ) {
    return this.artisansService.updateAvailabilityByUser(req.user.sub, body);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.artisansService.findById(id);
  }

  // ─── Règle 1 : agence/BTP gère ses artisans affiliés ────────────────

  /** Valide un artisan affilié (AGENCE_HOTE, ENTREPRISE_BTP ou ADMIN) */
  @Patch(':id/validate')
  async validateArtisan(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: AuthUser },
  ) {
    return this.artisansService.validateAffiliatedArtisan(id, req.user.sub, req.user.role);
  }

  /** Suspend un artisan affilié */
  @Patch(':id/suspend')
  async suspendArtisan(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { reason?: string },
    @Request() req: { user: AuthUser },
  ) {
    return this.artisansService.suspendAffiliatedArtisan(id, req.user.sub, req.user.role, body.reason);
  }

  /** Désaffilie (retire) un artisan de l'organisation */
  @Delete(':id/affiliate')
  async removeFromAgency(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: AuthUser },
  ) {
    return this.artisansService.removeFromAgency(id, req.user.sub, req.user.role);
  }
}
