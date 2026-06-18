import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('subscription_plans')
export class SubscriptionPlanEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // ex: "Standard", "Pro"

  /** Prix mensuel en XOF (0 = gratuit) */
  @Column({ type: 'bigint', default: 0 })
  priceMonthlyXof: number;

  /** Prix annuel en XOF */
  @Column({ type: 'bigint', default: 0 })
  priceAnnualXof: number;

  /** Nombre de requêtes IA autorisées par mois (0 = illimité) */
  @Column({ default: 10 })
  aiRequestsPerMonth: number;

  /** Nombre maximum de fichiers par appel DevisPro */
  @Column({ default: 1 })
  devisProMaxFiles: number;

  /** Accès à la décoration IA */
  @Column({ default: true })
  decorationEnabled: boolean;

  /** Accès au diagnostic rénovation */
  @Column({ default: false })
  renovationDiagnosisEnabled: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
