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
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
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

  async findByArtisanUserId(userId: string) {
    return this.ordersRepo.find({
      where: { artisan: { user: { id: userId } } },
      relations: ['client'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByAgency(agencyUserId: string) {
    return this.ordersRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.client', 'client')
      .leftJoinAndSelect('order.artisan', 'artisan')
      .leftJoinAndSelect('artisan.user', 'artisanUser')
      .where('artisanUser.agencyId = :agencyUserId', { agencyUserId })
      .orderBy('order.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Litiges dont l'agence/BTP est gestionnaire.
   * Si disputeHandlerId est null → visible uniquement dans l'interface admin.
   */
  async findDisputesByHandler(handlerUserId: string) {
    return this.ordersRepo.find({
      where: { disputeHandlerId: handlerUserId, status: OrderStatus.DISPUTED },
      relations: ['client', 'artisan', 'artisan.user'],
      order: { updatedAt: 'DESC' },
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

  /**
   * Règle 3 : seuls ARTISAN et ENTREPRISE_BTP peuvent confirmer.
   * AGENCE_HOTE est explicitement bloquée.
   */
  async confirm(orderId: string, requesterUserId: string, requesterRole: string): Promise<OrderEntity> {
    if (requesterRole === 'AGENCE_HOTE') {
      throw new ForbiddenException(
        'Les agences hôtes ne peuvent pas confirmer directement une commande. Assignez un artisan pour que celui-ci confirme.',
      );
    }

    const order = await this.findById(orderId);

    const isArtisan = order.artisan?.user?.id === requesterUserId;
    const isEntrepriseBtp = requesterRole === 'ENTREPRISE_BTP' && order.artisan?.user?.agencyId === requesterUserId;

    if (!isArtisan && !isEntrepriseBtp) throw new ForbiddenException();
    if (order.status !== OrderStatus.PENDING) throw new BadRequestException('Order cannot be confirmed');

    order.status = OrderStatus.CONFIRMED;
    return this.ordersRepo.save(order);
  }

  /**
   * Règle 3 : AGENCE_HOTE assigne un artisan mais garde le statut PENDING
   * (l'artisan doit lui-même confirmer).
   * ENTREPRISE_BTP assigne ET confirme directement.
   */
  async assignArtisan(orderId: string, artisanId: string, requesterUserId: string, requesterRole: string): Promise<OrderEntity> {
    const order = await this.findById(orderId);
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be assigned');
    }

    const artisan = await this.artisansRepo.findOne({
      where: { id: artisanId },
      relations: ['user'],
    });
    if (!artisan) throw new NotFoundException('Artisan not found');

    // Vérifier que l'artisan appartient à l'agence/BTP requérante
    if (artisan.user?.agencyId !== requesterUserId) {
      throw new ForbiddenException('Cet artisan n\'est pas affilié à votre organisation');
    }

    order.artisan = artisan;

    if (requesterRole === 'ENTREPRISE_BTP') {
      // BTP a le pouvoir de confirmation directe
      order.status = OrderStatus.CONFIRMED;
    }
    // AGENCE_HOTE : statut reste PENDING, l'artisan doit confirmer

    return this.ordersRepo.save(order);
  }

  async updateStatus(orderId: string, status: string, userId: string): Promise<OrderEntity> {
    const order = await this.findById(orderId);
    const isArtisan = order.artisan?.user?.id === userId;
    if (!isArtisan) throw new ForbiddenException();
    const validTransitions: Record<string, OrderStatus> = {
      CONFIRMED: OrderStatus.CONFIRMED,
      IN_PROGRESS: OrderStatus.IN_PROGRESS,
      COMPLETED: OrderStatus.COMPLETED,
    };
    const newStatus = validTransitions[status];
    if (!newStatus) throw new BadRequestException('Invalid status');
    order.status = newStatus;
    if (newStatus === OrderStatus.COMPLETED) order.completedAt = new Date();
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
    const isArtisan = order.artisan?.user?.id === userId;
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

  /**
   * Règle 2 : passage en DISPUTED → auto-assignation du gestionnaire.
   * Priority : agencyId de l'artisan → sinon null (géré par admin fixAI).
   */
  async openDispute(orderId: string, requesterId: string, reason?: string): Promise<OrderEntity> {
    const order = await this.findById(orderId);

    const isClient = order.client.id === requesterId;
    const isArtisan = order.artisan?.user?.id === requesterId;
    if (!isClient && !isArtisan) throw new ForbiddenException();

    if ([OrderStatus.COMPLETED, OrderStatus.CANCELLED, OrderStatus.DISPUTED].includes(order.status)) {
      throw new BadRequestException('Ce statut ne permet pas d\'ouvrir un litige');
    }

    order.status = OrderStatus.DISPUTED;
    order.escrowStatus = EscrowStatus.DISPUTED;
    order.disputeReason = reason ?? null;

    // Auto-assignation au gestionnaire (agence/BTP de l'artisan)
    const artisanUser = await this.usersRepo.findOne({ where: { id: order.artisan?.user?.id } });
    order.disputeHandlerId = artisanUser?.agencyId ?? null; // null = admin fixAI

    return this.ordersRepo.save(order);
  }

  /**
   * Résolution d'un litige par l'agence/BTP ou l'admin.
   * outcome : 'CLIENT' (remboursement) | 'ARTISAN' (libération escrow)
   */
  async resolveDispute(
    orderId: string,
    resolverId: string,
    resolverRole: string,
    outcome: 'CLIENT' | 'ARTISAN',
    resolution: string,
  ): Promise<OrderEntity> {
    const order = await this.findById(orderId);
    if (order.status !== OrderStatus.DISPUTED) throw new BadRequestException('Order is not disputed');

    const isAdmin = resolverRole === 'ADMIN';
    const isHandler = order.disputeHandlerId === resolverId;
    if (!isAdmin && !isHandler) throw new ForbiddenException('Vous n\'êtes pas gestionnaire de ce litige');

    order.disputeResolution = resolution;
    order.status = OrderStatus.COMPLETED;
    order.escrowStatus = outcome === 'ARTISAN' ? EscrowStatus.RELEASED : EscrowStatus.REFUNDED;
    order.completedAt = new Date();
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
