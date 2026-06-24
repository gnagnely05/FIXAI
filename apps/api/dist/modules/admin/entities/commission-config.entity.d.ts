export declare class CommissionConfigEntity {
    id: string;
    /** Percentage retained by FixAI (e.g. 0.03 = 3%) */
    fixaiRate: number;
    /** Percentage for the affiliated agency (e.g. 0.02 = 2%) */
    agencyRate: number;
    /** Net percentage going to the artisan = 1 - fixaiRate - agencyRate */
    artisanRate: number;
    /** Commission FixAI prélevée sur chaque vente de produit en boutique/quincaillerie */
    storeCommissionRate: number;
    isActive: boolean;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=commission-config.entity.d.ts.map