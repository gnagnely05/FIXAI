import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DepannageRequest, DepannageStep, DepannageMode, DepannageStatus,
} from './entities/depannage-request.entity';
import {
  CreateDepannageDto, SetCategoryDto, SetModeDto, SetLocationDto, SelectArtisanDto,
} from './dto/create-depannage.dto';
import { Artisan } from '../artisans/entities/artisan.entity';

const URGENT_FEE = 2000; // FCFA

const STEP_ORDER: DepannageStep[] = [
  DepannageStep.DESCRIPTION,
  DepannageStep.CATEGORY,
  DepannageStep.MODE,
  DepannageStep.LOCATION,
  DepannageStep.ARTISAN_SELECTION,
  DepannageStep.PAYMENT,
  DepannageStep.CONFIRMATION,
];

@Injectable()
export class DepannageService {
  constructor(
    @InjectRepository(DepannageRequest)
    private readonly repo: Repository<DepannageRequest>,
    @InjectRepository(Artisan)
    private readonly artisanRepo: Repository<Artisan>,
  ) {}

  async create(clientId: string, dto: CreateDepannageDto): Promise<DepannageRequest> {
    const request = this.repo.create({
      clientId,
      description: dto.description,
      currentStep: DepannageStep.CATEGORY,
      status: DepannageStatus.DRAFT,
    });
    return this.repo.save(request);
  }

  async setCategory(requestId: string, clientId: string, dto: SetCategoryDto): Promise<DepannageRequest> {
    const request = await this.getOwnedRequest(requestId, clientId);
    this.assertStep(request, DepannageStep.CATEGORY);
    request.category = dto.category;
    request.currentStep = DepannageStep.MODE;
    return this.repo.save(request);
  }

  async setMode(requestId: string, clientId: string, dto: SetModeDto): Promise<DepannageRequest> {
    const request = await this.getOwnedRequest(requestId, clientId);
    this.assertStep(request, DepannageStep.MODE);

    if (dto.mode === DepannageMode.PLANNED && !dto.scheduledAt) {
      throw new BadRequestException('La date est obligatoire pour le mode planifié');
    }

    request.mode = dto.mode;
    request.urgencyFee = dto.mode === DepannageMode.URGENT ? URGENT_FEE : 0;
    request.scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : null;
    request.currentStep = DepannageStep.LOCATION;
    return this.repo.save(request);
  }

  async setLocation(requestId: string, clientId: string, dto: SetLocationDto): Promise<DepannageRequest> {
    const request = await this.getOwnedRequest(requestId, clientId);
    this.assertStep(request, DepannageStep.LOCATION);
    request.address = dto.address;
    request.city = dto.city;
    request.latitude = dto.latitude ?? null;
    request.longitude = dto.longitude ?? null;
    request.currentStep = DepannageStep.ARTISAN_SELECTION;
    request.status = DepannageStatus.SEARCHING;
    return this.repo.save(request);
  }

  async assignArtisan(requestId: string, clientId: string, dto: SelectArtisanDto): Promise<DepannageRequest> {
    const request = await this.getOwnedRequest(requestId, clientId);
    this.assertStep(request, DepannageStep.ARTISAN_SELECTION);

    const artisan = await this.artisanRepo.findOne({ where: { id: dto.artisanId } });
    if (!artisan) throw new NotFoundException('Artisan introuvable');
    if (!artisan.isAvailable) throw new BadRequestException('Cet artisan n\'est pas disponible');

    request.artisanId = dto.artisanId;
    request.currentStep = DepannageStep.PAYMENT;
    request.status = DepannageStatus.ARTISAN_ASSIGNED;
    return this.repo.save(request);
  }

  async confirmPayment(requestId: string): Promise<DepannageRequest> {
    const request = await this.repo.findOne({ where: { id: requestId } });
    if (!request) throw new NotFoundException();
    request.currentStep = DepannageStep.CONFIRMATION;
    request.status = DepannageStatus.IN_PROGRESS;
    return this.repo.save(request);
  }

  async findNearbyArtisans(
    category: string,
    latitude: number,
    longitude: number,
    radiusKm = 10,
  ): Promise<Artisan[]> {
    // Haversine formula via raw query for proximity search
    return this.artisanRepo
      .createQueryBuilder('artisan')
      .where('artisan.specialty = :category', { category })
      .andWhere('artisan.isAvailable = true')
      .andWhere('artisan.isVerified = true')
      .andWhere(
        `(6371 * acos(cos(radians(:lat)) * cos(radians(artisan.latitude))
          * cos(radians(artisan.longitude) - radians(:lng))
          + sin(radians(:lat)) * sin(radians(artisan.latitude)))) < :radius`,
        { lat: latitude, lng: longitude, radius: radiusKm },
      )
      .orderBy('artisan.rating', 'DESC')
      .limit(20)
      .getMany();
  }

  async findByClient(clientId: string): Promise<DepannageRequest[]> {
    return this.repo.find({
      where: { clientId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByArtisan(artisanId: string): Promise<DepannageRequest[]> {
    return this.repo.find({
      where: { artisanId },
      order: { createdAt: 'DESC' },
    });
  }

  private async getOwnedRequest(requestId: string, clientId: string): Promise<DepannageRequest> {
    const request = await this.repo.findOne({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Demande introuvable');
    if (request.clientId !== clientId) throw new ForbiddenException();
    return request;
  }

  private assertStep(request: DepannageRequest, expected: DepannageStep): void {
    if (request.currentStep !== expected) {
      throw new BadRequestException(
        `Étape invalide. Attendue: ${expected}, actuelle: ${request.currentStep}`,
      );
    }
  }
}
