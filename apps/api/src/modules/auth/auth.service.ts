import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserEntity } from '../users/entities/user.entity';
import { DocumentEntity, DocumentType } from '../documents/entities/document.entity';
import { VerificationStatus } from '../../common/enums/verification-status.enum';
import { UserRole } from '../../common/enums/user-role.enum';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterProviderDto } from './dto/register-provider.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
    @InjectRepository(DocumentEntity)
    private readonly docsRepo: Repository<DocumentEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async registerProvider(dto: RegisterProviderDto) {
    const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    if (dto.role === UserRole.ENTREPRISE_BTP && !dto.btpMode) {
      throw new BadRequestException('btpMode is required for ENTREPRISE_BTP');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const initialStatus = this.getInitialStatus(dto.role, dto.documents);
    const user = this.usersRepo.create({
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role,
      city: dto.city,
      radiusKm: dto.radiusKm,
      btpMode: dto.btpMode,
      verificationStatus: initialStatus,
    });
    await this.usersRepo.save(user);

    if (dto.documents?.length) {
      const docs = dto.documents.map(({ type, url }) =>
        this.docsRepo.create({
          userId: user.id,
          type: (DocumentType[type as keyof typeof DocumentType] ?? DocumentType.OTHER),
          fileUrl: url,
        }),
      );
      await this.docsRepo.save(docs);
    }

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async register(dto: RegisterDto) {
    // Generate placeholder email from phone if not provided
    const email = dto.email ?? `${dto.phone.replace(/\D/g, '')}@fixai.ci`;
    const existing = await this.usersRepo.findOne({ where: [{ email }, { phone: dto.phone }] });
    if (existing) {
      throw new ConflictException('Ce numéro est déjà enregistré');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.usersRepo.create({
      ...dto,
      email,
      lastName: dto.lastName ?? '',
      role: dto.role ?? UserRole.CLIENT,
      passwordHash,
    });
    await this.usersRepo.save(user);

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const identifier = dto.identifier;
    const isPhone = /^(\+225)?[0-9]{10}$/.test(identifier);
    const user = await this.usersRepo.findOne({
      where: isPhone ? [{ phone: identifier }, { phone: identifier.replace(/^\+225/, '') }] : { email: identifier },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return { user: this.sanitizeUser(user), ...tokens };
  }

  async logout(userId: string) {
    await this.usersRepo.update(userId, { refreshToken: undefined });
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user?.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const tokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!tokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  private async generateTokens(user: UserEntity) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      this.jwtService.signAsync(payload, { expiresIn: '7d', secret: process.env.JWT_REFRESH_SECRET }),
    ]);
    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.usersRepo.update(userId, { refreshToken: hashed });
  }

  private getInitialStatus(role: string, documents?: { type: string; url: string }[]): VerificationStatus {
    const hasDocs = documents && documents.length > 0;
    switch (role) {
      case UserRole.BOUTIQUE:
        return VerificationStatus.SHOP_REGISTERED;
      case UserRole.QUINCAILLERIE:
        return VerificationStatus.HARDWARE_REGISTERED;
      case UserRole.AGENCE_HOTE:
      case UserRole.ENTREPRISE_BTP:
        return hasDocs ? VerificationStatus.DOCS_SUBMITTED : VerificationStatus.REGISTERED;
      case UserRole.ARTISAN:
        return hasDocs ? VerificationStatus.DOCS_SUBMITTED : VerificationStatus.REGISTERED;
      default:
        return VerificationStatus.REGISTERED;
    }
  }

  private sanitizeUser(user: UserEntity) {
    const { passwordHash, refreshToken, ...safe } = user;
    return safe;
  }
}
