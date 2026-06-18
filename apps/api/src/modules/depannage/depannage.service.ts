import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DepannageRequestEntity, DepannageStep, DepannageMode } from './entities/depannage-request.entity';
import { ArtisanEntity, ArtisanSpecialty } from '../artisans/entities/artisan.entity';
import { OrderStatus } from '../orders/entities/order.entity';
import { CreateDepannageDto, StepCategoryDto, StepModeDto, StepLocationDto, StepArtisanDto } from './dto/create-depannage.dto';

const STEP_ORDER: DepannageStep[] = [
  DepannageStep.DESCRIPTION,
  DepannageStep.CATEGORY,
  DepannageStep.MODE,
  DepannageStep.LOCATION,
  DepannageStep.ARTISAN_SELECTION,
  DepannageStep.PAYMENT,
  DepannageStep.CONFIRMATION,
];

const URGENCY_FEE_RATE = 0.15; // 15% surcharge for urgent requests

@Injectable()
export class DepannageService {
  private readonly logger = new Logger(DepannageService.name);

  constructor(
    @InjectRepository(DepannageRequestEntity)
    private readonly repo: Repository<DepannageRequestEntity>,
    @InjectRepository(ArtisanEntity)
    private readonly artisansRepo: Repository<ArtisanEntity>,
  ) {}

  async create(clientId: string, dto: CreateDepannageDto): Promise<DepannageRequestEntity> {
    const request = this.repo.create({
      clientId,
      description: dto.description,
      currentStep: DepannageStep.CATEGORY,
      status: OrderStatus.PENDING,
    });
    return this.repo.save(request);
  }

  async advanceStep(requestId: string, clientId: string, stepData: StepCategoryDto | StepModeDto | StepLocationDto | StepArtisanDto): Promise<DepannageRequestEntity> {
    const request = await this.repo.findOne({ where: { id: requestId, clientId } });
    if (!request) throw new NotFoundException('Depannage request not found');

    const currentIndex = STEP_ORDER.indexOf(request.currentStep);
    const nextStep = STEP_ORDER[currentIndex + 1];
    if (!nextStep) throw new BadRequestException('Already at final step');

    switch (request.currentStep) {
      case DepannageStep.CATEGORY:
        request.category = (stepData as StepCategoryDto).category;
        break;
      case DepannageStep.MODE:
        const modeData = stepData as StepModeDto;
        request.mode = modeData.mode;
        if (modeData.mode === DepannageMode.PLANNED && modeData.scheduledAt) {
          request.scheduledAt = new Date(modeData.scheduledAt);
        }
        break;
      case DepannageStep.LOCATION:
        const locData = stepData as StepLocationDto;
        request.address = locData.address;
        request.city = locData.city;
        if (locData.latitude) request.latitude = locData.latitude;
        if (locData.longitude) request.longitude = locData.longitude;
        break;
      case DepannageStep.ARTISAN_SELECTION:
        const artisanData = stepData as StepArtisanDto;
        const artisan = await this.artisansRepo.findOne({ where: { id: artisanData.artisanId, isAvailable: true } });
        if (!artisan) throw new BadRequestException('Artisan not available');
        request.artisanId = artisan.id;
        break;
    }

    request.currentStep = nextStep;
    return this.repo.save(request);
  }

  async assignArtisan(requestId: string, artisanId: string): Promise<DepannageRequestEntity> {
    const request = await this.repo.findOne({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Request not found');
    const artisan = await this.artisansRepo.findOne({ where: { id: artisanId, isAvailable: true } });
    if (!artisan) throw new BadRequestException('Artisan not available');
    request.artisanId = artisanId;
    request.currentStep = DepannageStep.PAYMENT;
    return this.repo.save(request);
  }

  async findNearbyArtisans(
    category: ArtisanSpecialty,
    latitude: number,
    longitude: number,
    radiusKm = 20,
  ): Promise<Array<ArtisanEntity & { distanceKm: number }>> {
    const result = await this.artisansRepo.query(
      `SELECT a.*,
        (6371 * acos(
          cos(radians($1)) * cos(radians(a.latitude::float))
          * cos(radians(a.longitude::float) - radians($2))
          + sin(radians($1)) * sin(radians(a.latitude::float))
        )) AS "distanceKm"
       FROM artisans a
       WHERE a.specialty = $3
         AND a."isAvailable" = true
         AND a."isVerified" = true
         AND a.latitude IS NOT NULL
         AND a.longitude IS NOT NULL
       HAVING (6371 * acos(
          cos(radians($1)) * cos(radians(a.latitude::float))
          * cos(radians(a.longitude::float) - radians($2))
          + sin(radians($1)) * sin(radians(a.latitude::float))
        )) < $4
       ORDER BY "distanceKm" ASC
       LIMIT 20`,
      [latitude, longitude, category, radiusKm],
    );
    return result;
  }

  async findByClient(clientId: string): Promise<DepannageRequestEntity[]> {
    return this.repo.find({
      where: { clientId },
      order: { createdAt: 'DESC' },
      relations: ['artisan'],
    });
  }

  async findByArtisan(artisanId: string): Promise<DepannageRequestEntity[]> {
    return this.repo.find({
      where: { artisanId },
      order: { createdAt: 'DESC' },
      relations: ['client'],
    });
  }

  async findOne(id: string): Promise<DepannageRequestEntity> {
    const req = await this.repo.findOne({ where: { id }, relations: ['client', 'artisan'] });
    if (!req) throw new NotFoundException('Request not found');
    return req;
  }
}
