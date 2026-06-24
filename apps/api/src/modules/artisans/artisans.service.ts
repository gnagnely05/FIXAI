import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArtisanEntity, ArtisanSpecialty } from './entities/artisan.entity';
import { UserEntity } from '../users/entities/user.entity';
import { VerificationStatus } from '../../common/enums/verification-status.enum';

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
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
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

  async getAvailability(userId: string) {
    const artisan = await this.artisansRepo.findOne({ where: { user: { id: userId } } });
    if (!artisan) return { isAvailable: false, availableDays: [], availableSlots: [] };
    return {
      isAvailable: artisan.isAvailable,
      availableDays: artisan.availableDays ?? [],
      availableSlots: artisan.availableSlots ?? [],
    };
  }

  async updateAvailabilityByUser(userId: string, data: { isAvailable: boolean; availableDays?: string[]; availableSlots?: string[] }) {
    const artisan = await this.artisansRepo.findOne({ where: { user: { id: userId } } });
    if (!artisan) throw new NotFoundException('Artisan profile not found');
    await this.artisansRepo.update(artisan.id, {
      isAvailable: data.isAvailable,
      ...(data.availableDays !== undefined && { availableDays: data.availableDays }),
      ...(data.availableSlots !== undefined && { availableSlots: data.availableSlots }),
    });
    return { message: 'Availability updated' };
  }

  async findByAgency(agencyUserId: string) {
    const artisanUsers = await this.usersRepo.find({ where: { agencyId: agencyUserId }, select: ['id'] });
    if (artisanUsers.length === 0) return [];
    const userIds = artisanUsers.map(u => u.id);
    return this.artisansRepo
      .createQueryBuilder('artisan')
      .leftJoinAndSelect('artisan.user', 'user')
      .where('user.id IN (:...userIds)', { userIds })
      .getMany();
  }

  // ─── Règle 1 : gestion des artisans affiliés par l'agence/BTP ──────────

  private async ensureOwnership(artisanUserId: string, requesterUserId: string): Promise<UserEntity> {
    const artisanUser = await this.usersRepo.findOne({ where: { id: artisanUserId } });
    if (!artisanUser) throw new NotFoundException('Artisan user not found');
    if (artisanUser.agencyId !== requesterUserId) {
      throw new ForbiddenException('Cet artisan n\'est pas affilié à votre organisation');
    }
    return artisanUser;
  }

  /** Valide un artisan affilié (passe à ACTIVE) */
  async validateAffiliatedArtisan(artisanId: string, requesterUserId: string, requesterRole: string): Promise<{ message: string }> {
    const artisan = await this.artisansRepo.findOne({ where: { id: artisanId }, relations: ['user'] });
    if (!artisan) throw new NotFoundException('Artisan not found');

    if (requesterRole !== 'ADMIN') {
      await this.ensureOwnership(artisan.user.id, requesterUserId);
    }

    await this.usersRepo.update(artisan.user.id, {
      verificationStatus: VerificationStatus.ACTIVE,
    });
    await this.artisansRepo.update(artisanId, { isVerified: true });

    return { message: 'Artisan validé avec succès' };
  }

  /** Suspend un artisan affilié */
  async suspendAffiliatedArtisan(artisanId: string, requesterUserId: string, requesterRole: string, reason?: string): Promise<{ message: string }> {
    const artisan = await this.artisansRepo.findOne({ where: { id: artisanId }, relations: ['user'] });
    if (!artisan) throw new NotFoundException('Artisan not found');

    if (requesterRole !== 'ADMIN') {
      await this.ensureOwnership(artisan.user.id, requesterUserId);
    }

    await this.usersRepo.update(artisan.user.id, {
      verificationStatus: VerificationStatus.SUSPENDED,
    });
    await this.artisansRepo.update(artisanId, { isAvailable: false, isVerified: false });

    return { message: `Artisan suspendu${reason ? ` : ${reason}` : ''}` };
  }

  /** Désaffilie un artisan (retire le lien agencyId) */
  async removeFromAgency(artisanId: string, requesterUserId: string, requesterRole: string): Promise<{ message: string }> {
    const artisan = await this.artisansRepo.findOne({ where: { id: artisanId }, relations: ['user'] });
    if (!artisan) throw new NotFoundException('Artisan not found');

    if (requesterRole !== 'ADMIN') {
      await this.ensureOwnership(artisan.user.id, requesterUserId);
    }

    await this.usersRepo.update(artisan.user.id, { agencyId: null as any });
    return { message: 'Artisan désaffilié de l\'organisation' };
  }
}
