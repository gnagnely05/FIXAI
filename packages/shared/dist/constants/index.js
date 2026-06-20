"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_ORDER_AMOUNT = exports.MIN_ORDER_AMOUNT = exports.ESCROW_COMMISSION_RATE = exports.API_ENDPOINTS = exports.CURRENCY = exports.SERVICE_CATEGORIES = exports.SUPPORTED_CITIES = exports.APP_VERSION = exports.APP_NAME = void 0;
exports.APP_NAME = 'FixAI';
exports.APP_VERSION = '1.0.0';
exports.SUPPORTED_CITIES = [
    'Abidjan',
    'Bouaké',
    'Daloa',
    'Yamoussoukro',
    'San-Pédro',
    'Korhogo',
    'Man',
    'Gagnoa',
];
exports.SERVICE_CATEGORIES = [
    { id: 'plomberie', label: 'Plomberie', icon: 'water' },
    { id: 'electricite', label: 'Électricité', icon: 'flash' },
    { id: 'maconnerie', label: 'Maçonnerie', icon: 'home' },
    { id: 'menuiserie', label: 'Menuiserie', icon: 'construct' },
    { id: 'peinture', label: 'Peinture', icon: 'color-palette' },
    { id: 'decoration', label: 'Décoration', icon: 'star' },
    { id: 'carrelage', label: 'Carrelage', icon: 'grid' },
    { id: 'climatisation', label: 'Climatisation', icon: 'snow' },
];
exports.CURRENCY = {
    code: 'XOF',
    symbol: 'FCFA',
    locale: 'fr-CI',
};
exports.API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        REFRESH: '/auth/refresh',
        LOGOUT: '/auth/logout',
    },
    USERS: {
        ME: '/users/me',
        UPDATE: '/users/me',
    },
    ARTISANS: {
        LIST: '/artisans',
        SEARCH: '/artisans/search',
        DETAIL: (id) => `/artisans/${id}`,
    },
    ORDERS: {
        LIST: '/orders',
        CREATE: '/orders',
        DETAIL: (id) => `/orders/${id}`,
    },
    PAYMENTS: {
        INITIATE: '/payments/initiate',
        STATUS: (id) => `/payments/${id}/status`,
    },
    AI: {
        VISUALIZE: '/ai/visualize',
        ESTIMATE: '/ai/estimate',
    },
};
exports.ESCROW_COMMISSION_RATE = 0.05;
exports.MIN_ORDER_AMOUNT = 5000;
exports.MAX_ORDER_AMOUNT = 10000000;
//# sourceMappingURL=index.js.map