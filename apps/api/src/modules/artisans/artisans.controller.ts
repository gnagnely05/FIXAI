import { Controller, Get, Patch, Param, Query, Body, UseGuards, ParseUUIDPipe, Request } from '@nestjs/common';
import { ArtisansService, ArtisanSearchQuery } from './artisans.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ArtisanSpecialty } from './entities/artisan.entity';

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

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.artisansService.findById(id);
  }

  @Get('availability/me')
  async getMyAvailability(@Request() req: { user: { sub: string } }) {
    return this.artisansService.getAvailability(req.user.sub);
  }

  @Patch('availability/me')
  async updateMyAvailability(
    @Request() req: { user: { sub: string } },
    @Body() body: { isAvailable: boolean; availableDays?: string[]; availableSlots?: string[] },
  ) {
    return this.artisansService.updateAvailabilityByUser(req.user.sub, body);
  }

  @Get('my-agency')
  async getMyAgencyArtisans(@Request() req: { user: { sub: string } }) {
    return this.artisansService.findByAgency(req.user.sub);
  }
}
