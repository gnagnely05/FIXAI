import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { VerificationStatus } from '../../common/enums/verification-status.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<UserEntity> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  async updateProfile(id: string, updates: Partial<Pick<UserEntity, 'firstName' | 'lastName' | 'avatarUrl'>>) {
    await this.usersRepo.update(id, updates);
    return this.findById(id);
  }

  async verifyUser(id: string): Promise<void> {
    await this.usersRepo.update(id, { verificationStatus: VerificationStatus.ACTIVE });
  }

  async upgradeToPro(id: string, data: {
    role: UserRole;
    city?: string;
    btpMode?: string;
    radiusKm?: number;
  }): Promise<UserEntity> {
    const user = await this.findById(id);
    if (user.role !== UserRole.CLIENT) {
      throw new ConflictException('Seul un compte client peut activer un espace pro');
    }
    const allowed = [UserRole.ARTISAN, UserRole.AGENCE_HOTE, UserRole.ENTREPRISE_BTP, UserRole.BOUTIQUE, UserRole.QUINCAILLERIE];
    if (!allowed.includes(data.role)) {
      throw new ConflictException('Type de profil pro invalide');
    }
    const updates: Partial<UserEntity> = {
      role: data.role,
      verificationStatus: VerificationStatus.DOCS_SUBMITTED,
    };
    if (data.city) updates.city = data.city;
    if (data.btpMode) updates.btpMode = data.btpMode as any;
    if (data.radiusKm) updates.radiusKm = data.radiusKm;
    await this.usersRepo.update(id, updates);
    return this.findById(id);
  }
}
