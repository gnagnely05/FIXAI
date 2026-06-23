export declare enum RoomType {
    SALON = "SALON",
    CHAMBRE = "CHAMBRE",
    BUREAU = "BUREAU",
    CUISINE = "CUISINE",
    SALLE_A_MANGER = "SALLE_A_MANGER",
    SALLE_DE_BAIN = "SALLE_DE_BAIN"
}
export declare enum DecoStyle {
    MODERNE_EPURE = "MODERNE_EPURE",
    CHAUD_NATUREL = "CHAUD_NATUREL",
    COLORE_VIVANT = "COLORE_VIVANT",
    CLASSIQUE_ELEGANT = "CLASSIQUE_ELEGANT"
}
export type OccupantType = 'SEUL' | 'COUPLE' | 'FAMILLE' | 'FAMILLE_ENFANTS';
export type BudgetRange = 'MOINS_100K' | '100K_300K' | '300K_500K' | 'PLUS_500K';
export type Problem = 'TROP_CHARGE' | 'PAS_LUMINEUX' | 'COULEURS_TERNES' | 'MEUBLES_VIEUX' | 'MANQUE_RANGEMENT' | 'ENVIE_CHANGEMENT';
export declare class GenerateDecorationDto {
    /** URL de la photo de la pièce actuelle (obligatoire) */
    roomPhotoUrl: string;
    roomType: RoomType;
    problems: Problem[];
    style: DecoStyle;
    /** true = locataire (pas de travaux, pas de peinture murale, pas de perçage) */
    isTenant: boolean;
    occupants: OccupantType;
    budget: BudgetRange;
    /** IDs de produits catalogue à intégrer dans le rendu */
    productIds?: string[];
    /** Description des meubles à conserver */
    keepItemsDescription?: string;
    /** URL photo des meubles à conserver */
    keepItemsPhotoUrl?: string;
    /** Salon en open space avec cuisine ? */
    isOpenSpace?: boolean;
}
//# sourceMappingURL=decoration.dto.d.ts.map