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

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ nullable: true })
  unit: string; // e.g. "sac 50kg", "m²", "pièce"

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
