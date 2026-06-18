import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { ArtisanEntity } from '../artisans/entities/artisan.entity';
import { OrderEntity, OrderStatus, EscrowStatus } from '../orders/entities/order.entity';

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
  ) {}

  async getPendingVerifications(): Promise<{ users: UserEntity[]; artisans: ArtisanEntity[] }> {
    const [users, artisans] = await Promise.all([
      this.usersRepo.find({ where: { isVerified: false } }),
      this.artisansRepo.find({ where: { isVerified: false }, relations: ['user'] }),
    ]);
    return { users, artisans };
  }

  async verifyUser(userId: string): Promise<UserEntity> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    user.isVerified = true;
    this.logger.log(`Admin verified user ${userId}`);
    return this.usersRepo.save(user);
  }

  async rejectUser(userId: string, reason: string): Promise<{ message: string }> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    // In production: send rejection notification with reason
    this.logger.warn(`Admin rejected user ${userId}: ${reason}`);
    return { message: `User ${userId} rejected. Reason: ${reason}` };
  }

  async getEscrowOverview(): Promise<{
    totalFunded: number;
    totalReleased: number;
    totalRefunded: number;
    pendingEscrow: number;
    orders: OrderEntity[];
  }> {
    const orders = await this.ordersRepo.find({ relations: ['client', 'artisan'] });

    const funded = orders.filter(o => o.escrowStatus === EscrowStatus.FUNDED);
    const released = orders.filter(o => o.escrowStatus === EscrowStatus.RELEASED);
    const refunded = orders.filter(o => o.escrowStatus === EscrowStatus.REFUNDED);

    return {
      totalFunded: funded.reduce((sum, o) => sum + Number(o.escrowAmount), 0),
      totalReleased: released.reduce((sum, o) => sum + Number(o.escrowAmount), 0),
      totalRefunded: refunded.reduce((sum, o) => sum + Number(o.escrowAmount), 0),
      pendingEscrow: funded.reduce((sum, o) => sum + Number(o.escrowAmount), 0),
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
