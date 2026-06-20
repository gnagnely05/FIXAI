export declare const APP_NAME = "FixAI";
export declare const APP_VERSION = "1.0.0";
export declare const SUPPORTED_CITIES: string[];
export declare const SERVICE_CATEGORIES: {
    id: string;
    label: string;
    icon: string;
}[];
export declare const CURRENCY: {
    code: string;
    symbol: string;
    locale: string;
};
export declare const API_ENDPOINTS: {
    AUTH: {
        LOGIN: string;
        REGISTER: string;
        REFRESH: string;
        LOGOUT: string;
    };
    USERS: {
        ME: string;
        UPDATE: string;
    };
    ARTISANS: {
        LIST: string;
        SEARCH: string;
        DETAIL: (id: string) => string;
    };
    ORDERS: {
        LIST: string;
        CREATE: string;
        DETAIL: (id: string) => string;
    };
    PAYMENTS: {
        INITIATE: string;
        STATUS: (id: string) => string;
    };
    AI: {
        VISUALIZE: string;
        ESTIMATE: string;
    };
};
export declare const ESCROW_COMMISSION_RATE = 0.05;
export declare const MIN_ORDER_AMOUNT = 5000;
export declare const MAX_ORDER_AMOUNT = 10000000;
//# sourceMappingURL=index.d.ts.map