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
      verificationStatus: dto.documentUrls?.length
        ? VerificationStatus.DOCS_SUBMITTED
        : VerificationStatus.REGISTERED,
    });
    await this.usersRepo.save(user);

    if (dto.documentUrls?.length) {
      const docs = dto.documentUrls.map((url) =>
        this.docsRepo.create({ userId: user.id, type: DocumentType.OTHER, fileUrl: url }),
      );
      await this.docsRepo.save(docs);
    }

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.usersRepo.create({ ...dto, passwordHash });
    await this.usersRepo.save(user);

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepo.findOne({ where: { email: dto.email } });
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

  private sanitizeUser(user: UserEntity) {
    const { passwordHash, refreshToken, ...safe } = user;
    return safe;
  }
}
