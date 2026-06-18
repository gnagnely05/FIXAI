import { Controller, Post, Patch, Get, Body, Param, Request, UseGuards } from '@nestjs/common';
import { RenovationService, CreateProjectDto, SubmitQuoteDto } from './renovation.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('renovation')
export class RenovationController {
  constructor(private readonly service: RenovationService) {}

  @Post()
  create(@Body() dto: CreateProjectDto, @Request() req: any) {
    return this.service.create(req.user.id, dto);
  }

  @Patch(':id/request-quote/:companyId')
  requestQuote(@Param('id') id: string, @Param('companyId') companyId: string, @Request() req: any) {
    return this.service.requestQuote(id, req.user.id, companyId);
  }

  @Patch(':id/submit-quote')
  submitQuote(@Param('id') id: string, @Body() dto: SubmitQuoteDto, @Request() req: any) {
    return this.service.submitQuote(id, req.user.id, dto);
  }

  @Patch(':id/accept-quote')
  acceptQuote(@Param('id') id: string, @Request() req: any) {
    return this.service.acceptQuote(id, req.user.id);
  }

  @Patch(':id/milestone/:milestoneId/complete')
  completeMilestone(@Param('id') id: string, @Param('milestoneId') milestoneId: string, @Request() req: any) {
    return this.service.completeMilestone(id, req.user.id, milestoneId);
  }

  @Get('mine')
  myProjects(@Request() req: any) {
    return this.service.findByClient(req.user.id);
  }

  @Get('company/mine')
  companyProjects(@Request() req: any) {
    return this.service.findByCompany(req.user.id);
  }
}
