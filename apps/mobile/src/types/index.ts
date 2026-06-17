export type { User, Artisan, Order, Payment, UserRole, AuthTokens } from '@fixai/shared';

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface NavigationParams {
  artisanId?: string;
  orderId?: string;
}
