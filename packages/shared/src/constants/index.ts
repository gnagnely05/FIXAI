export const APP_NAME = 'FixAI';
export const APP_VERSION = '1.0.0';

export const SUPPORTED_CITIES = [
  'Abidjan',
  'Bouaké',
  'Daloa',
  'Yamoussoukro',
  'San-Pédro',
  'Korhogo',
  'Man',
  'Gagnoa',
];

export const SERVICE_CATEGORIES = [
  { id: 'plomberie', label: 'Plomberie', icon: 'water' },
  { id: 'electricite', label: 'Électricité', icon: 'flash' },
  { id: 'maconnerie', label: 'Maçonnerie', icon: 'home' },
  { id: 'menuiserie', label: 'Menuiserie', icon: 'construct' },
  { id: 'peinture', label: 'Peinture', icon: 'color-palette' },
  { id: 'decoration', label: 'Décoration', icon: 'star' },
  { id: 'carrelage', label: 'Carrelage', icon: 'grid' },
  { id: 'climatisation', label: 'Climatisation', icon: 'snow' },
];

export const CURRENCY = {
  code: 'XOF',
  symbol: 'FCFA',
  locale: 'fr-CI',
};

export const API_ENDPOINTS = {
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
    DETAIL: (id: string) => `/artisans/${id}`,
  },
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
  },
  PAYMENTS: {
    INITIATE: '/payments/initiate',
    STATUS: (id: string) => `/payments/${id}/status`,
  },
  AI: {
    VISUALIZE: '/ai/visualize',
    ESTIMATE: '/ai/estimate',
  },
};

export const ESCROW_COMMISSION_RATE = 0.05;
export const MIN_ORDER_AMOUNT = 5000;
export const MAX_ORDER_AMOUNT = 10000000;
