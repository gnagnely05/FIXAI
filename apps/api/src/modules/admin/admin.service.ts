import {
  Injectable, NotFoundException, BadRequestException, ConflictException, Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { ArtisanEntity } from '../artisans/entities/artisan.entity';
import { OrderEntity, OrderStatus, EscrowStatus } from '../orders/entities/order.entity';
import { DocumentEntity, DocumentStatus } from '../documents/entities/document.entity';
import { CommissionConfigEntity } from './entities/commission-config.entity';
import { VerificationStatus } from '../../common/enums/verification-status.enum';
import { VerifyStepDto, VerifyAction } from './dto/verify-step.dto';

/** Automatic next status after APPROVE for each current status */
const APPROVE_TRANSITIONS: Partial<Record<VerificationStatus, VerificationStatus>> = {
  [VerificationStatus.REGISTERED]:            VerificationStatus.DOCS_SUBMITTED,
  [VerificationStatus.DOCS_SUBMITTED]:        VerificationStatus.PENDING_VERIFICATION,
  [VerificationStatus.PENDING_VERIFICATION]:  VerificationStatus.IDENTITY_VERIFIED,
  [VerificationStatus.IDENTITY_VERIFIED]:     VerificationStatus.AFFILIATION_REQUESTED,
  [VerificationStatus.AFFILIATION_REQUESTED]: VerificationStatus.ACTIVE,
};

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
    @InjectRepository(ArtisanEntity)
    private readonly artisansRepo: Repository<ArtisanEntity>,
    @InjectRepository(OrderEntity)
    private readonly ordersRepo: Repository<OrderEntity>,
    @InjectRepository(DocumentEntity)
    private readonly docsRepo: Repository<DocumentEntity>,
    @InjectRepository(CommissionConfigEntity)
    private readonly commissionRepo: Repository<CommissionConfigEntity>,
  ) {}

  async getPendingVerifications(): Promise<{ users: UserEntity[]; documents: DocumentEntity[] }> {
    const [users, documents] = await Promise.all([
      this.usersRepo.find({
        where: [
          { verificationStatus: VerificationStatus.DOCS_SUBMITTED },
          { verificationStatus: VerificationStatus.PENDING_VERIFICATION },
          { verificationStatus: VerificationStatus.IDENTITY_VERIFIED },
          { verificationStatus: VerificationStatus.AFFILIATION_REQUESTED },
        ],
      }),
      this.docsRepo.find({
        where: { status: DocumentStatus.PENDING },
        relations: ['user'],
      }),
    ]);
    return { users, documents };
  }

  async verifyStep(dto: VerifyStepDto): Promise<UserEntity> {
    const user = await this.usersRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.action === VerifyAction.REJECT) {
      user.verificationStatus = VerificationStatus.REJECTED;
      this.logger.warn(`Admin rejected user ${dto.userId}: ${dto.reason ?? 'no reason'}`);
      return this.usersRepo.save(user);
    }

    if (dto.action === VerifyAction.INCOMPLETE) {
      user.verificationStatus = VerificationStatus.DOCS_SUBMITTED;
      this.logger.log(`Admin marked user ${dto.userId} as incomplete`);
      return this.usersRepo.save(user);
    }

    // APPROVE
    const next = dto.targetStatus ?? APPROVE_TRANSITIONS[user.verificationStatus];
    if (!next) {
      throw new BadRequestException(
        `No valid approval transition from ${user.verificationStatus}`,
      );
    }
    user.verificationStatus = next;
    this.logger.log(`Admin approved user ${dto.userId}: ${user.verificationStatus} → ${next}`);
    return this.usersRepo.save(user);
  }

  /** Legacy alias kept for backward compatibility */
  async verifyUser(userId: string): Promise<UserEntity> {
    return this.verifyStep({ userId, action: VerifyAction.APPROVE });
  }

  async rejectUser(userId: string, reason: string): Promise<{ message: string }> {
    await this.verifyStep({ userId, action: VerifyAction.REJECT, reason });
    return { message: `User ${userId} rejected. Reason: ${reason}` };
  }

  // ── Commission config ──────────────────────────────────────────────

  async getActiveCommission(): Promise<CommissionConfigEntity> {
    const config = await this.commissionRepo.findOne({ where: { isActive: true } });
    if (!config) {
      // Bootstrap default if missing
      const def = this.commissionRepo.create({ fixaiRate: 0.03, agencyRate: 0.02, artisanRate: 0.95, isActive: true });
      return this.commissionRepo.save(def);
    }
    return config;
  }

  async updateCommission(fixaiRate: number, agencyRate: number): Promise<CommissionConfigEntity> {
    if (fixaiRate + agencyRate >= 1) {
      throw new BadRequestException('fixaiRate + agencyRate must be < 1');
    }
    const existing = await this.getActiveCommission();
    existing.fixaiRate = fixaiRate;
    existing.agencyRate = agencyRate;
    existing.artisanRate = Math.round((1 - fixaiRate - agencyRate) * 1e10) / 1e10;
    this.logger.log(`Commission updated: fixai=${fixaiRate}, agency=${agencyRate}, artisan=${existing.artisanRate}`);
    return this.commissionRepo.save(existing);
  }

  // ── Escrow / orders overview ───────────────────────────────────────

  async seedAdmin(email: string, password: string, firstName: string, lastName: string) {
    const existing = await this.usersRepo.findOne({ where: { email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(password, 12);
    const admin = this.usersRepo.create({
      email,
      passwordHash,
      firstName,
      lastName,
      role: UserRole.ADMIN as any,
      verificationStatus: VerificationStatus.ACTIVE,
    });
    await this.usersRepo.save(admin);
    this.logger.log(`Admin account created: ${email}`);
    const { passwordHash: _, refreshToken: __, ...safe } = admin as any;
    return { message: 'Admin account created successfully', user: safe };
  }

  async getEscrowOverview(): Promise<{
    totalFunded: number;
    totalReleased: number;
    totalRefunded: number;
    pendingEscrow: number;
    orders: OrderEntity[];
  }> {
    const orders = await this.ordersRepo.find({ relations: ['client', 'artisan'] });
    const funded   = orders.filter(o => o.escrowStatus === EscrowStatus.FUNDED);
    const released = orders.filter(o => o.escrowStatus === EscrowStatus.RELEASED);
    const refunded = orders.filter(o => o.escrowStatus === EscrowStatus.REFUNDED);
    return {
      totalFunded:   funded.reduce((s, o) => s + Number(o.escrowAmount), 0),
      totalReleased: released.reduce((s, o) => s + Number(o.escrowAmount), 0),
      totalRefunded: refunded.reduce((s, o) => s + Number(o.escrowAmount), 0),
      pendingEscrow: funded.reduce((s, o) => s + Number(o.escrowAmount), 0),
      orders,
    };
  }

  async getDisputes(): Promise<OrderEntity[]> {
    return this.ordersRepo.find({
      where: { status: OrderStatus.DISPUTED },
      relations: ['client', 'artisan'],
      order: { createdAt: 'DESC' },
    });
  }
}
