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

  async updateProfile(
    id: string,
    updates: Partial<Pick<UserEntity,
      'firstName' | 'lastName' | 'avatarUrl' | 'phone' | 'city' | 'address'
      | 'agencyName' | 'shopName' | 'specialty' | 'description'
      | 'payoutMethod' | 'payoutNumber'
    >>,
  ) {
    // Ne garder que les champs autorisés et définis
    const allowed = [
      'firstName', 'lastName', 'avatarUrl', 'phone', 'city', 'address',
      'agencyName', 'shopName', 'specialty', 'description',
      'payoutMethod', 'payoutNumber',
    ] as const;
    const clean: Partial<UserEntity> = {};
    for (const k of allowed) {
      const v = (updates as Record<string, unknown>)[k];
      if (v !== undefined) (clean as Record<string, unknown>)[k] = v;
    }
    if (Object.keys(clean).length) {
      await this.usersRepo.update(id, clean);
    }
    return this.findById(id);
  }

  async verifyUser(id: string): Promise<void> {
    await this.usersRepo.update(id, { verificationStatus: VerificationStatus.ACTIVE });
  }

  async upgradeToPro(id: string, data: {
    role: UserRole;
    specialty?: string;
    city?: string;
    agencyName?: string;
    shopName?: string;
    address?: string;
    description?: string;
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

    // Boutiques et quincailleries : pas de validation manuelle, actives immédiatement
    // (une simple confirmation e-mail suffit). Les autres passent en vérification 24-48h.
    const isShop = data.role === UserRole.BOUTIQUE || data.role === UserRole.QUINCAILLERIE;

    const updates: Partial<UserEntity> = {
      role: data.role,
      verificationStatus: isShop
        ? VerificationStatus.ACTIVE
        : VerificationStatus.DOCS_SUBMITTED,
    };
    if (data.specialty) updates.specialty = data.specialty;
    if (data.city) updates.city = data.city;
    if (data.agencyName) updates.agencyName = data.agencyName;
    if (data.shopName) updates.shopName = data.shopName;
    if (data.address) updates.address = data.address;
    if (data.description) updates.description = data.description;
    if (data.btpMode) updates.btpMode = data.btpMode as any;
    if (data.radiusKm) updates.radiusKm = data.radiusKm;
    await this.usersRepo.update(id, updates);
    return this.findById(id);
  }
}
