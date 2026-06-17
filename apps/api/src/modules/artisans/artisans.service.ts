import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArtisanEntity, ArtisanSpecialty } from './entities/artisan.entity';

export interface ArtisanSearchQuery {
  specialty?: ArtisanSpecialty;
  city?: string;
  minRating?: number;
  maxHourlyRate?: number;
  isAvailable?: boolean;
  isVerified?: boolean;
  page?: number;
  limit?: number;
}

@Injectable()
export class ArtisansService {
  constructor(
    @InjectRepository(ArtisanEntity)
    private readonly artisansRepo: Repository<ArtisanEntity>,
  ) {}

  async findAll(query: ArtisanSearchQuery) {
    const { page = 1, limit = 20, specialty, city, minRating, maxHourlyRate, isAvailable, isVerified } = query;
    const qb = this.artisansRepo.createQueryBuilder('artisan').leftJoinAndSelect('artisan.user', 'user');

    if (specialty) qb.andWhere('artisan.specialty = :specialty', { specialty });
    if (city) qb.andWhere('LOWER(artisan.city) LIKE LOWER(:city)', { city: `%${city}%` });
    if (minRating !== undefined) qb.andWhere('artisan.rating >= :minRating', { minRating });
    if (maxHourlyRate !== undefined) qb.andWhere('artisan.hourlyRate <= :maxHourlyRate', { maxHourlyRate });
    if (isAvailable !== undefined) qb.andWhere('artisan.isAvailable = :isAvailable', { isAvailable });
    if (isVerified !== undefined) qb.andWhere('artisan.isVerified = :isVerified', { isVerified });

    qb.orderBy('artisan.rating', 'DESC').skip((page - 1) * limit).take(limit);

    const [artisans, total] = await qb.getManyAndCount();
    return { artisans, total, page, limit };
  }

  async findById(id: string): Promise<ArtisanEntity> {
    const artisan = await this.artisansRepo.findOne({ where: { id }, relations: ['user'] });
    if (!artisan) throw new NotFoundException('Artisan not found');
    return artisan;
  }

  async updateAvailability(artisanId: string, isAvailable: boolean) {
    await this.artisansRepo.update(artisanId, { isAvailable });
  }

  async updateRating(artisanId: string, newRating: number, reviewCount: number) {
    await this.artisansRepo.update(artisanId, { rating: newRating, reviewCount });
  }
}
