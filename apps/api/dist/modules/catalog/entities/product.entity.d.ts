export declare enum ProductCategory {
    CIMENT = "CIMENT",
    FER_BETON = "FER_BETON",
    BRIQUE = "BRIQUE",
    CARRELAGE = "CARRELAGE",
    PEINTURE = "PEINTURE",
    PLOMBERIE = "PLOMBERIE",
    ELECTRICITE = "ELECTRICITE",
    MENUISERIE = "MENUISERIE",
    QUINCAILLERIE_GENERALE = "QUINCAILLERIE_GENERALE",
    DECORATION = "DECORATION",
    OUTILLAGE = "OUTILLAGE",
    AUTRES = "AUTRES"
}
export declare enum MerchantType {
    BOUTIQUE = "BOUTIQUE",
    QUINCAILLERIE = "QUINCAILLERIE"
}
export declare class ProductEntity {
    id: string;
    name: string;
    description: string;
    category: ProductCategory;
    priceXof: number;
    merchantId: string;
    merchantName: string;
    merchantType: MerchantType;
    imageUrls: string[];
    isAvailable: boolean;
    stock: number;
    unit: string;
    /**
     * Produit promu : priorisé dans les suggestions IA et l'affichage catalogue.
     * Activé par la boutique (option payante).
     */
    isPromoted: boolean;
    /** Date d'expiration de la promotion (null = pas de limite) */
    promotedUntil?: Date;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=product.entity.d.ts.map