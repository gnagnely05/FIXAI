import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ProductCategory {
  CIMENT = 'CIMENT',
  FER_BETON = 'FER_BETON',
  BRIQUE = 'BRIQUE',
  CARRELAGE = 'CARRELAGE',
  PEINTURE = 'PEINTURE',
  PLOMBERIE = 'PLOMBERIE',
  ELECTRICITE = 'ELECTRICITE',
  MENUISERIE = 'MENUISERIE',
  QUINCAILLERIE_GENERALE = 'QUINCAILLERIE_GENERALE',
  DECORATION = 'DECORATION',
  OUTILLAGE = 'OUTILLAGE',
  AUTRES = 'AUTRES',
}

export enum MerchantType {
  BOUTIQUE = 'BOUTIQUE',
  QUINCAILLERIE = 'QUINCAILLERIE',
}

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ProductCategory })
  category: ProductCategory;

  @Column({ type: 'bigint' })
  priceXof: number; // XOF integer, no decimals

  @Column()
  merchantId: string;

  @Column()
  merchantName: string;

  @Column({ type: 'enum', enum: MerchantType })
  merchantType: MerchantType;

  @Column({ type: 'simple-array', nullable: true })
  imageUrls: string[];

  /** Photo principale du produit (URL ou data URI base64) */
  @Column({ type: 'longtext', nullable: true })
  imageUrl?: string;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ nullable: true })
  unit: string; // e.g. "sac 50kg", "m²", "pièce"

  /** Dimensions du produit (cm) */
  @Column({ type: 'float', nullable: true })
  lengthCm?: number;

  @Column({ type: 'float', nullable: true })
  widthCm?: number;

  @Column({ type: 'float', nullable: true })
  heightCm?: number;

  /** Poids du produit (kg) */
  @Column({ type: 'float', nullable: true })
  weightKg?: number;

  /**
   * Produit promu : priorisé dans les suggestions IA et l'affichage catalogue.
   * Activé par la boutique (option payante).
   */
  @Column({ default: false })
  isPromoted: boolean;

  /** Date d'expiration de la promotion (null = pas de limite) */
  @Column({ type: 'timestamp', nullable: true })
  promotedUntil?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
