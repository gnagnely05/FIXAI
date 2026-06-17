import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity, OrderStatus, EscrowStatus } from './entities/order.entity';
import { UserEntity } from '../users/entities/user.entity';
import { ArtisanEntity } from '../artisans/entities/artisan.entity';

export interface CreateOrderData {
  artisanId: string;
  description: string;
  scheduledAt: Date;
  address: string;
  city: string;
  notes?: string;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly ordersRepo: Repository<OrderEntity>,
    @InjectRepository(ArtisanEntity)
    private readonly artisansRepo: Repository<ArtisanEntity>,
  ) {}

  async create(client: UserEntity, data: CreateOrderData): Promise<OrderEntity> {
    const artisan = await this.artisansRepo.findOne({ where: { id: data.artisanId } });
    if (!artisan) throw new NotFoundException('Artisan not found');
    if (!artisan.isAvailable) throw new BadRequestException('Artisan is not available');

    const order = this.ordersRepo.create({
      client,
      artisan,
      description: data.description,
      scheduledAt: data.scheduledAt,
      address: data.address,
      city: data.city,
      notes: data.notes,
      status: OrderStatus.PENDING,
      escrowStatus: EscrowStatus.NOT_FUNDED,
    });

    return this.ordersRepo.save(order);
  }

  async findByClient(clientId: string) {
    return this.ordersRepo.find({
      where: { client: { id: clientId } },
      relations: ['artisan', 'artisan.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByArtisan(artisanId: string) {
    return this.ordersRepo.find({
      where: { artisan: { id: artisanId } },
      relations: ['client'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<OrderEntity> {
    const order = await this.ordersRepo.findOne({
      where: { id },
      relations: ['client', 'artisan', 'artisan.user'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async confirm(orderId: string, artisanUserId: string): Promise<OrderEntity> {
    const order = await this.findById(orderId);
    if (order.artisan.user.id !== artisanUserId) throw new ForbiddenException();
    if (order.status !== OrderStatus.PENDING) throw new BadRequestException('Order cannot be confirmed');

    order.status = OrderStatus.CONFIRMED;
    return this.ordersRepo.save(order);
  }

  async markInProgress(orderId: string): Promise<OrderEntity> {
    const order = await this.findById(orderId);
    if (order.status !== OrderStatus.CONFIRMED) throw new BadRequestException('Order must be confirmed first');
    if (order.escrowStatus !== EscrowStatus.FUNDED) throw new BadRequestException('Payment must be funded first');

    order.status = OrderStatus.IN_PROGRESS;
    return this.ordersRepo.save(order);
  }

  async complete(orderId: string, clientId: string): Promise<OrderEntity> {
    const order = await this.findById(orderId);
    if (order.client.id !== clientId) throw new ForbiddenException();
    if (order.status !== OrderStatus.IN_PROGRESS) throw new BadRequestException('Order is not in progress');

    order.status = OrderStatus.COMPLETED;
    order.completedAt = new Date();
    order.escrowStatus = EscrowStatus.RELEASED;
    return this.ordersRepo.save(order);
  }

  async cancel(orderId: string, userId: string): Promise<OrderEntity> {
    const order = await this.findById(orderId);
    const isClient = order.client.id === userId;
    const isArtisan = order.artisan.user.id === userId;
    if (!isClient && !isArtisan) throw new ForbiddenException();

    if ([OrderStatus.COMPLETED, OrderStatus.CANCELLED].includes(order.status)) {
      throw new BadRequestException('Order cannot be cancelled');
    }

    order.status = OrderStatus.CANCELLED;
    if (order.escrowStatus === EscrowStatus.FUNDED) {
      order.escrowStatus = EscrowStatus.REFUNDED;
    }
    return this.ordersRepo.save(order);
  }

  async updateEscrow(orderId: string, amount: number, status: EscrowStatus, transactionId: string): Promise<void> {
    await this.ordersRepo.update(orderId, {
      escrowAmount: amount,
      escrowStatus: status,
      paymentTransactionId: transactionId,
    });
  }
}
