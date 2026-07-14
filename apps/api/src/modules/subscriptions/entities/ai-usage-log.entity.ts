import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

/**
 * Journal d'usage IA — une ligne par requête IA facturée au quota
 * (Décoration, Rénovation, Devis Pro). Permet de compter la consommation
 * mensuelle réelle, y compris pour les utilisateurs sans abonnement.
 */
@Entity('ai_usage_logs')
export class AiUsageLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  userId: string;

  /** Service consommé : DECORATION | RENOVATION | DEVIS_PRO */
  @Column({ nullable: true })
  service?: string;

  @CreateDateColumn()
  createdAt: Date;
}
