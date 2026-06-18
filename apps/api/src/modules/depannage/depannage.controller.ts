import { Controller, Post, Patch, Get, Body, Param, Request, UseGuards } from '@nestjs/common';
import { DepannageService } from './depannage.service';
import {
  CreateDepannageDto, SetCategoryDto, SetModeDto, SetLocationDto, SelectArtisanDto,
} from './dto/create-depannage.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('depannage')
export class DepannageController {
  constructor(private readonly service: DepannageService) {}

  @Post()
  create(@Body() dto: CreateDepannageDto, @Request() req: any) {
    return this.service.create(req.user.id, dto);
  }

  @Patch(':id/category')
  setCategory(@Param('id') id: string, @Body() dto: SetCategoryDto, @Request() req: any) {
    return this.service.setCategory(id, req.user.id, dto);
  }

  @Patch(':id/mode')
  setMode(@Param('id') id: string, @Body() dto: SetModeDto, @Request() req: any) {
    return this.service.setMode(id, req.user.id, dto);
  }

  @Patch(':id/location')
  setLocation(@Param('id') id: string, @Body() dto: SetLocationDto, @Request() req: any) {
    return this.service.setLocation(id, req.user.id, dto);
  }

  @Patch(':id/artisan')
  assignArtisan(@Param('id') id: string, @Body() dto: SelectArtisanDto, @Request() req: any) {
    return this.service.assignArtisan(id, req.user.id, dto);
  }

  @Get('mine')
  myRequests(@Request() req: any) {
    return this.service.findByClient(req.user.id);
  }

  @Get('artisan/mine')
  artisanRequests(@Request() req: any) {
    return this.service.findByArtisan(req.user.id);
  }
}
