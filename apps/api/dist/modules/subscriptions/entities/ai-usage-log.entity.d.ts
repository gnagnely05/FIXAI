/**
 * Journal d'usage IA — une ligne par requête IA facturée au quota
 * (Décoration, Rénovation, Devis Pro). Permet de compter la consommation
 * mensuelle réelle, y compris pour les utilisateurs sans abonnement.
 */
export declare class AiUsageLogEntity {
    id: string;
    userId: string;
    /** Service consommé : DECORATION | RENOVATION | DEVIS_PRO */
    service?: string;
    createdAt: Date;
}
//# sourceMappingURL=ai-usage-log.entity.d.ts.map