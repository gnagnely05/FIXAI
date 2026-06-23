import {
  Controller, Post, Get, Patch, Body, Param, Request, UseGuards, Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DepannageService } from './depannage.service';
import { ArtisanSpecialty } from '../artisans/entities/artisan.entity';
import { DepannageMode } from './entities/depannage-request.entity';

@Controller('depannage')
@UseGuards(JwtAuthGuard)
export class DepannageController {
  constructor(private readonly service: DepannageService) {}

  // Étape 1 — Créer la demande (lancement diagnostic IA en arrière-plan)
  @Post()
  create(
    @Request() req: { user: { sub: string } },
    @Body() dto: {
      description: string;
      photoUrls?: string[];
      address: string;
      city: string;
      latitude?: number;
      longitude?: number;
    },
  ) {
    return this.service.create(req.user.sub, dto);
  }

  // Étape 1 — Client confirme le devis IA et ouvre l'appel d'offre
  @Patch(':id/confirm-quote')
  confirmQuote(
    @Param('id') id: string,
    @Request() req: { user: { sub: string } },
    @Body('category') category?: ArtisanSpecialty,
  ) {
    return this.service.confirmQuote(id, req.user.sub, category);
  }

  // Étape 3 — Artisan soumet une proposition
  @Post(':id/proposals')
  submitProposal(
    @Param('id') id: string,
    @Request() req: { user: { sub: string } },
    @Body() dto: { priceXof: number; estimatedDurationMin: number; artisanName: string },
  ) {
    return this.service.submitProposal(
      id,
      req.user.sub,
      dto.artisanName,
      dto.priceXof,
      dto.estimatedDurationMin,
    );
  }

  // Étape 4 — Client choisit un artisan (ouvre le chat)
  @Patch(':id/select-artisan')
  selectArtisan(
    @Param('id') id: string,
    @Request() req: { user: { sub: string } },
    @Body('artisanId') artisanId: string,
  ) {
    return this.service.selectArtisan(id, req.user.sub, artisanId);
  }

  // Étape 5 — Client choisit le mode d'intervention
  @Patch(':id/choose-mode')
  chooseMode(
    @Param('id') id: string,
    @Request() req: { user: { sub: string } },
    @Body() dto: { mode: DepannageMode; scheduledAt?: string },
  ) {
    return this.service.chooseMode(
      id,
      req.user.sub,
      dto.mode,
      dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
    );
  }

  // Étape 5 — Artisan confirme l'intervention urgente
  @Patch(':id/artisan-confirm-urgent')
  artisanConfirmUrgent(@Param('id') id: string, @Request() req: { user: { sub: string } }) {
    return this.service.artisanConfirmUrgent(id, req.user.sub);
  }

  // Étape 6a — Accord de prix (calcule montant escrow)
  @Patch(':id/reach-agreement')
  reachAgreement(@Param('id') id: string, @Request() req: { user: { sub: string } }) {
    return this.service.reachAgreement(id, req.user.sub);
  }

  // Étape 6b/6c — Client alimente l'escrow (déclenché par webhook paiement)
  @Patch(':id/fund-escrow')
  fundEscrow(
    @Param('id') id: string,
    @Request() req: { user: { sub: string } },
    @Body('transactionRef') transactionRef: string,
  ) {
    return this.service.fundEscrow(id, req.user.sub, transactionRef);
  }

  // Étape 6c — Verrouiller l'intervention (fonds confirmés)
  @Patch(':id/lock-intervention')
  lockIntervention(
    @Param('id') id: string,
    @Body('requiredPartIds') requiredPartIds?: string[],
  ) {
    return this.service.lockIntervention(id, requiredPartIds);
  }

  // Étape 6 — Artisan complète l'intervention
  @Patch(':id/complete-intervention')
  completeIntervention(@Param('id') id: string, @Request() req: { user: { sub: string } }) {
    return this.service.completeIntervention(id, req.user.sub);
  }

  // Étape 6d — Client libère le paiement
  @Patch(':id/release-payment')
  releasePayment(@Param('id') id: string, @Request() req: { user: { sub: string } }) {
    return this.service.releasePayment(id, req.user.sub);
  }

  // Étape 7 — Marquer les pièces comme envoyées (boutique partenaire)
  @Patch(':id/dispatch-parts')
  dispatchParts(@Param('id') id: string) {
    return this.service.dispatchParts(id);
  }

  // ─── Lecture ──────────────────────────────────────────────────────────────

  @Get('nearby-artisans')
  findNearby(
    @Query('category') category: ArtisanSpecialty,
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
  ) {
    return this.service.findNearbyArtisans(
      category,
      parseFloat(lat),
      parseFloat(lng),
      radius ? parseFloat(radius) : 20,
    );
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
}
