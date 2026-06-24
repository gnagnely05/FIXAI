import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductOrderEntity, ProductOrderStatus, ProductOrderItem } from './entities/product-order.entity';
import { ProductEntity } from './entities/product.entity';
import { UserEntity } from '../users/entities/user.entity';
import { CommissionConfigEntity } from '../admin/entities/commission-config.entity';

export interface CreateProductOrderDto {
  items: Array<{ productId: string; qty: number }>;
  merchantId: string;
  notes?: string;
  linkedServiceOrderId?: string;
  linkedDevisProId?: string;
}

@Injectable()
export class ProductOrdersService {
  constructor(
    @InjectRepository(ProductOrderEntity)
    private readonly poRepo: Repository<ProductOrderEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(CommissionConfigEntity)
    private readonly commissionRepo: Repository<CommissionConfigEntity>,
  ) {}

  private async getCommissionRate(): Promise<number> {
    const config = await this.commissionRepo.findOne({ where: { isActive: true } });
    return config?.storeCommissionRate ?? 0.05;
  }

  /**
   * Règle 1 : une commande doit être liée à un service OU à un devis pro validé.
   */
  async create(client: UserEntity, dto: CreateProductOrderDto): Promise<ProductOrderEntity> {
    if (!dto.linkedServiceOrderId && !dto.linkedDevisProId) {
      throw new BadRequestException(
        'Une commande de matériel doit être liée à une prestation ou à un devis pro validé.',
      );
    }

    // Résoudre les produits
    const resolvedItems: ProductOrderItem[] = [];
    let totalAmountXof = 0;
    let merchantName = '';
    let merchantType: any = null;

    for (const lineItem of dto.items) {
      const product = await this.productRepo.findOne({ where: { id: lineItem.productId, merchantId: dto.merchantId } });
      if (!product) throw new NotFoundException(`Produit ${lineItem.productId} introuvable dans ce magasin`);
      if (!product.isAvailable) throw new BadRequestException(`Produit "${product.name}" non disponible`);
      if (product.stock > 0 && lineItem.qty > product.stock) {
        throw new BadRequestException(`Stock insuffisant pour "${product.name}" (stock: ${product.stock})`);
      }

      const subtotal = Number(product.priceXof) * lineItem.qty;
      resolvedItems.push({
        productId: product.id,
        name: product.name,
        unit: product.unit ?? undefined,
        qty: lineItem.qty,
        unitPriceXof: Number(product.priceXof),
        subtotalXof: subtotal,
      });
      totalAmountXof += subtotal;
      merchantName = product.merchantName;
      merchantType = product.merchantType;
    }

    if (resolvedItems.length === 0) throw new BadRequestException('Aucun produit valide dans la commande');

    const commissionRate = await this.getCommissionRate();
    const commissionAmountXof = Math.round(totalAmountXof * commissionRate);
    const netAmountXof = totalAmountXof - commissionAmountXof;

    // Règle 2 : vérifier si le wallet client est suffisant
    const walletBalance = Number(client.walletBalance ?? 0);
    const initialStatus = walletBalance >= totalAmountXof
      ? ProductOrderStatus.PENDING_ARTISAN
      : ProductOrderStatus.PENDING_PROVISIONING;

    const order = this.poRepo.create({
      client,
      merchantId: dto.merchantId,
      merchantName,
      merchantType,
      items: resolvedItems,
      totalAmountXof,
      commissionAmountXof,
      netAmountXof,
      status: initialStatus,
      linkedServiceOrderId: dto.linkedServiceOrderId,
      linkedDevisProId: dto.linkedDevisProId,
      notes: dto.notes,
      escrowLocked: false,
    });

    return this.poRepo.save(order);
  }

  /**
   * Règle 2 : déclenché quand wallet est plein ET artisan/devis validé.
   * Bloque les fonds en escrow et passe en PROCESSING (commande envoyée à la boutique).
   */
  async triggerEscrowAndProcess(orderId: string, requesterUserId: string): Promise<ProductOrderEntity> {
    const order = await this.findById(orderId);
    if (order.client.id !== requesterUserId) throw new ForbiddenException();

    if (order.escrowLocked) throw new BadRequestException('Escrow déjà bloqué');
    if (![ProductOrderStatus.PENDING_PROVISIONING, ProductOrderStatus.PENDING_ARTISAN].includes(order.status)) {
      throw new BadRequestException('Statut incompatible avec le déclenchement de l\'escrow');
    }

    // Vérifier wallet client
    const client = await this.userRepo.findOne({ where: { id: requesterUserId } });
    if (Number(client!.walletBalance) < order.totalAmountXof) {
      throw new BadRequestException('Portefeuille insuffisant — provisionnez avant de passer commande');
    }

    // Débiter le wallet client et bloquer en escrow
    await this.userRepo.update(requesterUserId, {
      walletBalance: Number(client!.walletBalance) - order.totalAmountXof as any,
    });

    order.escrowLocked = true;
    order.status = ProductOrderStatus.PROCESSING;
    return this.poRepo.save(order);
  }

  /** Boutique marque la commande comme prête */
  async markReady(orderId: string, merchantUserId: string): Promise<ProductOrderEntity> {
    const order = await this.findById(orderId);
    if (order.merchantId !== merchantUserId) throw new ForbiddenException();
    if (order.status !== ProductOrderStatus.PROCESSING) throw new BadRequestException('Commande non en cours de traitement');
    order.status = ProductOrderStatus.READY;
    return this.poRepo.save(order);
  }

  /** Client ou boutique confirme la livraison — libère l'escrow */
  async markDelivered(orderId: string, requesterUserId: string): Promise<ProductOrderEntity> {
    const order = await this.findById(orderId);
    const isClient = order.client.id === requesterUserId;
    const isMerchant = order.merchantId === requesterUserId;
    if (!isClient && !isMerchant) throw new ForbiddenException();
    if (order.status !== ProductOrderStatus.READY) throw new BadRequestException('Commande non prête');

    // Libérer le net vers le marchand
    const merchant = await this.userRepo.findOne({ where: { id: order.merchantId } });
    if (merchant) {
      await this.userRepo.update(order.merchantId, {
        walletBalance: (Number(merchant.walletBalance) + order.netAmountXof) as any,
      });
    }

    order.status = ProductOrderStatus.DELIVERED;
    order.deliveredAt = new Date();
    return this.poRepo.save(order);
  }

  async cancelOrder(orderId: string, requesterUserId: string): Promise<ProductOrderEntity> {
    const order = await this.findById(orderId);
    if (order.client.id !== requesterUserId) throw new ForbiddenException();
    if ([ProductOrderStatus.DELIVERED, ProductOrderStatus.CANCELLED].includes(order.status)) {
      throw new BadRequestException('Impossible d\'annuler');
    }

    // Rembourser si escrow bloqué
    if (order.escrowLocked) {
      const client = await this.userRepo.findOne({ where: { id: requesterUserId } });
      await this.userRepo.update(requesterUserId, {
        walletBalance: (Number(client!.walletBalance) + order.totalAmountXof) as any,
      });
      order.escrowLocked = false;
    }

    order.status = ProductOrderStatus.CANCELLED;
    return this.poRepo.save(order);
  }

  async findByClient(clientId: string): Promise<ProductOrderEntity[]> {
    return this.poRepo.find({
      where: { client: { id: clientId } },
      relations: ['client'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByMerchant(merchantId: string): Promise<ProductOrderEntity[]> {
    return this.poRepo.find({
      where: { merchantId },
      relations: ['client'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<ProductOrderEntity> {
    const order = await this.poRepo.findOne({ where: { id }, relations: ['client'] });
    if (!order) throw new NotFoundException('Commande produit introuvable');
    return order;
  }

  /** Stats pour le dashboard marchant */
  async getMerchantStats(merchantId: string) {
    const orders = await this.findByMerchant(merchantId);
    const products = await this.productRepo.find({ where: { merchantId } });

    const activeProducts = products.filter(p => p.isAvailable).length;
    const promotedProducts = products.filter(p => p.isPromoted).length;
    const toProcess = orders.filter(o => o.status === ProductOrderStatus.PROCESSING).length;
    const ready = orders.filter(o => o.status === ProductOrderStatus.READY).length;
    const totalRevenue = orders
      .filter(o => o.status === ProductOrderStatus.DELIVERED)
      .reduce((s, o) => s + Number(o.netAmountXof), 0);

    return { activeProducts, promotedProducts, toProcess, ready, totalRevenue };
  }
}
