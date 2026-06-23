export declare class SubscriptionPlanEntity {
    id: string;
    name: string;
    /** Prix mensuel en XOF (0 = gratuit) */
    priceMonthlyXof: number;
    /** Prix annuel en XOF */
    priceAnnualXof: number;
    /** Nombre de requêtes IA autorisées par mois (0 = illimité) */
    aiRequestsPerMonth: number;
    /** Nombre maximum de fichiers par appel DevisPro */
    devisProMaxFiles: number;
    /** Accès à la décoration IA */
    decorationEnabled: boolean;
    /** Accès au diagnostic rénovation */
    renovationDiagnosisEnabled: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=subscription-plan.entity.d.ts.map