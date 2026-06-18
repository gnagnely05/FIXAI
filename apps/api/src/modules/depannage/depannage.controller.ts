import { Controller, Post, Get, Patch, Body, Param, Request, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DepannageService } from './depannage.service';
import { CreateDepannageDto, StepCategoryDto, StepModeDto, StepLocationDto, StepArtisanDto } from './dto/create-depannage.dto';
import { ArtisanSpecialty } from '../artisans/entities/artisan.entity';

@Controller('depannage')
@UseGuards(JwtAuthGuard)
export class DepannageController {
  constructor(private readonly service: DepannageService) {}

  @Post()
  create(@Request() req: { user: { sub: string } }, @Body() dto: CreateDepannageDto) {
    return this.service.create(req.user.sub, dto);
  }

  @Patch(':id/step')
  advanceStep(
    @Request() req: { user: { sub: string } },
    @Param('id') id: string,
    @Body() body: StepCategoryDto | StepModeDto | StepLocationDto | StepArtisanDto,
  ) {
    return this.service.advanceStep(id, req.user.sub, body);
  }

  @Get('nearby-artisans')
  findNearby(
    @Query('category') category: ArtisanSpecialty,
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
  ) {
    return this.service.findNearbyArtisans(category, parseFloat(lat), parseFloat(lng), radius ? parseFloat(radius) : 20);
  }

  @Get('my-requests')
  findMyRequests(@Request() req: { user: { sub: string } }) {
    return this.service.findByClient(req.user.sub);
  }

  @Get('artisan-requests')
  findArtisanRequests(@Request() req: { user: { sub: string } }) {
    return this.service.findByArtisan(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/assign-artisan')
  assignArtisan(@Param('id') id: string, @Body('artisanId') artisanId: string) {
    return this.service.assignArtisan(id, artisanId);
  }
}
