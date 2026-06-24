import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('commission_config')
export class CommissionConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Percentage retained by FixAI (e.g. 0.03 = 3%) */
  @Column({ type: 'float', default: 0.03 })
  fixaiRate: number;

  /** Percentage for the affiliated agency (e.g. 0.02 = 2%) */
  @Column({ type: 'float', default: 0.02 })
  agencyRate: number;

  /** Net percentage going to the artisan = 1 - fixaiRate - agencyRate */
  @Column({ type: 'float', default: 0.95 })
  artisanRate: number;

  /** Commission FixAI prélevée sur chaque vente de produit en boutique/quincaillerie */
  @Column({ type: 'float', default: 0.05 })
  storeCommissionRate: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
