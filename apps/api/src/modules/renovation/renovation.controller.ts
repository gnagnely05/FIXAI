import { Controller, Get, Post, Patch, Param, Body, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RenovationService } from './renovation.service';
import { CreateRenovationDto, SubmitQuoteDto, UpdateMilestoneDto } from './dto/create-renovation.dto';

@Controller('renovation')
@UseGuards(JwtAuthGuard)
export class RenovationController {
  constructor(private readonly service: RenovationService) {}

  @Post()
  create(@Request() req: { user: { sub: string } }, @Body() dto: CreateRenovationDto) {
    return this.service.create(req.user.sub, dto);
  }

  @Get('my-projects')
  findMyProjects(@Request() req: { user: { sub: string } }) {
    return this.service.findByClient(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/request-quote')
  requestQuote(
    @Param('id') id: string,
    @Request() req: { user: { sub: string } },
    @Body('companyId') companyId: string,
  ) {
    return this.service.requestQuote(id, req.user.sub, companyId);
  }

  @Patch(':id/submit-quote')
  submitQuote(
    @Param('id') id: string,
    @Request() req: { user: { sub: string } },
    @Body() dto: SubmitQuoteDto,
  ) {
    return this.service.submitQuote(id, req.user.sub, dto);
  }

  @Patch(':id/accept-quote')
  acceptQuote(@Param('id') id: string, @Request() req: { user: { sub: string } }) {
    return this.service.acceptQuote(id, req.user.sub);
  }

  @Post(':id/milestones')
  addMilestone(@Param('id') id: string, @Body() milestone: { title: string; description: string; dueDate: string; amount: number }) {
    return this.service.addMilestone(id, milestone);
  }

  @Patch(':id/milestones')
  updateMilestone(@Param('id') id: string, @Body() dto: UpdateMilestoneDto) {
    return this.service.updateMilestone(id, dto);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Request() req: { user: { sub: string } }) {
    return this.service.cancel(id, req.user.sub);
  }
}
