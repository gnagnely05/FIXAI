import { Controller, Post, Get, Patch, Body, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RenovationService } from './renovation.service';

@Controller('renovation')
@UseGuards(JwtAuthGuard)
export class RenovationController {
  constructor(private readonly service: RenovationService) {}

  // Étape 1 — Créer le projet (lance le diagnostic IA en arrière-plan)
  @Post()
  create(
    @Request() req: { user: { sub: string } },
    @Body() dto: {
      title: string;
      description: string;
      projectType: string;
      address: string;
      city: string;
      latitude?: number;
      longitude?: number;
      photoUrls?: string[];
      budgetXof?: number;
      startDate?: string;
      endDate?: string;
    },
  ) {
    return this.service.create(req.user.sub, dto);
  }

  // Étape 1 — Client valide le diagnostic → ouvre l'appel d'offre
  @Patch(':id/confirm-diagnosis')
  confirmDiagnosis(@Param('id') id: string, @Request() req: { user: { sub: string } }) {
    return this.service.confirmDiagnosis(id, req.user.sub);
  }

  // Étape 3 — Entreprise soumet une proposition
  @Post(':id/proposals')
  submitProposal(
    @Param('id') id: string,
    @Request() req: { user: { sub: string } },
    @Body() dto: { companyName: string; totalPriceXof: number; durationDays: number; notes?: string },
  ) {
    return this.service.submitProposal(id, req.user.sub, dto.companyName, dto.totalPriceXof, dto.durationDays, dto.notes);
  }

  // Étape 4 — Client choisit une entreprise (ouvre le chat)
  @Patch(':id/select-company')
  selectCompany(
    @Param('id') id: string,
    @Request() req: { user: { sub: string } },
    @Body('companyId') companyId: string,
  ) {
    return this.service.selectCompany(id, req.user.sub, companyId);
  }

  // Étape 5 — Finalisation devis + jalons
  @Patch(':id/finalize-quote')
  finalizeQuote(
    @Param('id') id: string,
    @Request() req: { user: { sub: string } },
    @Body() dto: {
      milestones: Array<{ title: string; description: string; amountXof: number; dueDate: string }>;
    },
  ) {
    return this.service.finalizeQuote(id, req.user.sub, dto.milestones);
  }

  // Étape 6 — Client alimente l'escrow
  @Patch(':id/fund-escrow')
  fundEscrow(
    @Param('id') id: string,
    @Request() req: { user: { sub: string } },
    @Body() dto: { amountXof: number; transactionRef: string },
  ) {
    return this.service.fundEscrow(id, req.user.sub, dto.amountXof, dto.transactionRef);
  }

  // Étape 6 — Entreprise démarre le chantier
  @Patch(':id/start')
  startProject(@Param('id') id: string, @Request() req: { user: { sub: string } }) {
    return this.service.startProject(id, req.user.sub);
  }

  // Étape 6 — Entreprise complète un jalon
  @Patch(':id/milestones/:milestoneId/complete')
  completeMilestone(
    @Param('id') id: string,
    @Param('milestoneId') milestoneId: string,
    @Request() req: { user: { sub: string } },
    @Body() dto: { progressPhotoUrls?: string[] },
  ) {
    return this.service.completeMilestone(id, req.user.sub, milestoneId, dto.progressPhotoUrls);
  }

  // Étape 6 — Client libère le paiement du jalon
  @Patch(':id/milestones/:milestoneId/release')
  releaseMilestonePayment(
    @Param('id') id: string,
    @Param('milestoneId') milestoneId: string,
    @Request() req: { user: { sub: string } },
  ) {
    return this.service.releaseMilestonePayment(id, req.user.sub, milestoneId);
  }

  @Post(':id/progress-photos')
  addProgressPhoto(@Param('id') id: string, @Body('photoUrl') photoUrl: string) {
    return this.service.addProgressPhoto(id, photoUrl);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Request() req: { user: { sub: string } }) {
    return this.service.cancel(id, req.user.sub);
  }

  @Get('my-projects')
  findMyProjects(@Request() req: { user: { sub: string } }) {
    return this.service.findByClient(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
