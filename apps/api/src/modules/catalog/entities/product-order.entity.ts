import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { MerchantType } from './product.entity';

export enum ProductOrderStatus {
  /** Wallet client insuffisant — commande en attente de provisionnement */
  PENDING_PROVISIONING = 'PENDING_PROVISIONING',
  /** Wallet provisionné, en attente de validation artisan/devis */
  PENDING_ARTISAN = 'PENDING_ARTISAN',
  /** Fonds bloqués en escrow, commande transmise à la boutique */
  PROCESSING = 'PROCESSING',
  /** Boutique a préparé la commande — prête au retrait/livraison */
  READY = 'READY',
  /** Commande livrée/remise, escrow libéré */
  DELIVERED = 'DELIVERED',
  /** Annulée — escrow remboursé si provisionné */
  CANCELLED = 'CANCELLED',
}

export interface ProductOrderItem {
  productId: string;
  name: string;
  unit?: string;
  qty: number;
  unitPriceXof: number;
  subtotalXof: number;
}

@Entity('product_orders')
export class ProductOrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn()
  client: UserEntity;

  /**
   * Prestation liée (commande de service existante).
   * NULL seulement si linkedDevisProId est renseigné.
   */
  @Column({ nullable: true })
  linkedServiceOrderId?: string;

  /**
   * Devis Pro validé lié (exception e-commerce sans prestation).
   * NULL seulement si linkedServiceOrderId est renseigné.
   */
  @Column({ nullable: true })
  linkedDevisProId?: string;

  @Column()
  merchantId: string;

  @Column()
  merchantName: string;

  @Column({ type: 'enum', enum: MerchantType })
  merchantType: MerchantType;

  /** Items JSON : [{productId, name, unit, qty, unitPriceXof, subtotalXof}] */
  @Column({ type: 'json' })
  items: ProductOrderItem[];

  /** Montant total des produits en XOF */
  @Column({ type: 'bigint' })
  totalAmountXof: number;

  /** Commission FixAI prélevée (storeCommissionRate × totalAmountXof) */
  @Column({ type: 'bigint', default: 0 })
  commissionAmountXof: number;

  /** Montant net reversé au marchand */
  @Column({ type: 'bigint', default: 0 })
  netAmountXof: number;

  @Column({ type: 'enum', enum: ProductOrderStatus, default: ProductOrderStatus.PENDING_PROVISIONING })
  status: ProductOrderStatus;

  /** true quand les fonds sont bloqués en escrow côté platform */
  @Column({ default: false })
  escrowLocked: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
