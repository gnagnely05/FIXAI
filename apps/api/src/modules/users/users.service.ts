import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { VerificationStatus } from '../../common/enums/verification-status.enum';
import { DocumentEntity, DocumentType } from '../documents/entities/document.entity';
import { ArtisanEntity, ArtisanSpecialty } from '../artisans/entities/artisan.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
    @InjectRepository(DocumentEntity)
    private readonly docsRepo: Repository<DocumentEntity>,
    @InjectRepository(ArtisanEntity)
    private readonly artisansRepo: Repository<ArtisanEntity>,
  ) {}

  async findById(id: string): Promise<UserEntity> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  /** Liste des agences / entreprises BTP auxquelles un artisan peut s'affilier. */
  async findAgencies(): Promise<Array<{ id: string; name: string; city?: string; role: string }>> {
    const rows = await this.usersRepo.find({
      where: [{ role: UserRole.AGENCE_HOTE }, { role: UserRole.ENTREPRISE_BTP }],
      order: { agencyName: 'ASC' },
    });
    return rows.map(u => ({
      id: u.id,
      name: u.agencyName || `${u.firstName} ${u.lastName}`.trim() || 'Agence',
      city: u.city,
      role: u.role,
    }));
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

  /**
   * Bascule le rôle actif entre CLIENT (compte standard) et un rôle pro déjà
   * activé. Les infos pro (spécialité, nom, documents) restent en base, donc
   * l'utilisateur peut revenir en mode pro sans rien ressaisir.
   */
  async switchRole(id: string, role: UserRole): Promise<UserEntity> {
    const allowed = [
      UserRole.CLIENT, UserRole.ARTISAN, UserRole.AGENCE_HOTE,
      UserRole.ENTREPRISE_BTP, UserRole.BOUTIQUE, UserRole.QUINCAILLERIE,
    ];
    if (!allowed.includes(role)) {
      throw new ConflictException('Rôle invalide');
    }
    const updates: Partial<UserEntity> = { role };
    if (role !== UserRole.CLIENT) {
      updates.verificationStatus = VerificationStatus.ACTIVE;
    }
    await this.usersRepo.update(id, updates);
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
    documents?: Array<{ type: string; url: string }>;
    contractAccepted?: boolean;
    agencyId?: string;
  }): Promise<UserEntity> {
    const user = await this.findById(id);
    if (user.role !== UserRole.CLIENT) {
      throw new ConflictException('Seul un compte client peut activer un espace pro');
    }
    const allowed = [UserRole.ARTISAN, UserRole.AGENCE_HOTE, UserRole.ENTREPRISE_BTP, UserRole.BOUTIQUE, UserRole.QUINCAILLERIE];
    if (!allowed.includes(data.role)) {
      throw new ConflictException('Type de profil pro invalide');
    }

    // Les artisans doivent être validés par leur agence → statut en attente.
    // Les autres profils pro sont actifs immédiatement.
    const isArtisan = data.role === UserRole.ARTISAN;
    const updates: Partial<UserEntity> = {
      role: data.role,
      verificationStatus: isArtisan
        ? VerificationStatus.AFFILIATION_REQUESTED
        : VerificationStatus.ACTIVE,
    };
    if (data.specialty) updates.specialty = data.specialty;
    if (data.city) updates.city = data.city;
    if (data.agencyName) updates.agencyName = data.agencyName;
    if (data.shopName) updates.shopName = data.shopName;
    if (data.address) updates.address = data.address;
    if (data.description) updates.description = data.description;
    if (data.btpMode) updates.btpMode = data.btpMode as any;
    if (data.radiusKm) updates.radiusKm = data.radiusKm;
    if (data.contractAccepted) updates.proContractAcceptedAt = new Date();
    if (data.agencyId) updates.agencyId = data.agencyId;
    await this.usersRepo.update(id, updates);

    // Création du profil artisan (visible par l'agence pour validation)
    if (isArtisan) {
      const existing = await this.artisansRepo.findOne({ where: { user: { id } }, relations: ['user'] });
      const specialty = ArtisanSpecialty[data.specialty as keyof typeof ArtisanSpecialty]
        ?? ArtisanSpecialty.MENUISERIE;
      if (existing) {
        await this.artisansRepo.update(existing.id, {
          specialty, city: data.city ?? existing.city ?? 'Abidjan',
          bio: data.description ?? existing.bio, isVerified: false, isAvailable: false,
        });
      } else {
        const artisan = this.artisansRepo.create({
          user: { id } as UserEntity,
          specialty,
          city: data.city ?? 'Abidjan',
          bio: data.description,
          isVerified: false,
          isAvailable: false,
        });
        await this.artisansRepo.save(artisan);
      }
    }

    // Enregistrement des pièces justificatives (CNI, selfie, docs administratifs)
    if (data.documents?.length) {
      const docs = data.documents
        .filter(d => d?.url)
        .map(({ type, url }) =>
          this.docsRepo.create({
            userId: id,
            type: DocumentType[type as keyof typeof DocumentType] ?? DocumentType.OTHER,
            fileUrl: url,
          }),
        );
      if (docs.length) await this.docsRepo.save(docs);
    }

    return this.findById(id);
  }
}
