import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Artisan } from '../artisans/entities/artisan.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Artisan)
    private readonly artisanRepo: Repository<Artisan>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {}

  async getPendingVerifications(): Promise<Artisan[]> {
    return this.artisanRepo.find({
      where: { isVerified: false },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async approveVerification(userId: string): Promise<{ success: boolean }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    await this.userRepo.update(userId, { isVerified: true });

    const artisan = await this.artisanRepo.findOne({ where: { userId } });
    if (artisan) await this.artisanRepo.update(artisan.id, { isVerified: true });

    return { success: true };
  }

  async rejectVerification(userId: string, reason: string): Promise<{ success: boolean }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    // TODO: envoyer notification au prestataire avec la raison du rejet
    return { success: true };
  }

  async getEscrowOverview(): Promise<{
    totalFunded: number;
    totalReleased: number;
    totalRefunded: number;
    pendingRelease: number;
    payments: Payment[];
  }> {
    const payments = await this.paymentRepo.find({ order: { createdAt: 'DESC' } });

    const funded = payments.filter((p) => p.status === PaymentStatus.COMPLETED && !p.releasedAt && !p.refundedAt);
    const released = payments.filter((p) => !!p.releasedAt);
    const refunded = payments.filter((p) => p.status === PaymentStatus.REFUNDED);

    return {
      totalFunded: funded.reduce((s, p) => s + Number(p.amount), 0),
      totalReleased: released.reduce((s, p) => s + Number(p.amount), 0),
      totalRefunded: refunded.reduce((s, p) => s + Number(p.amount), 0),
      pendingRelease: funded.length,
      payments,
    };
  }
}
