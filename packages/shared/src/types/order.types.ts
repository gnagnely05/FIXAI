import { User } from './user.types';
import { Artisan } from './artisan.types';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
}

export enum EscrowStatus {
  NOT_FUNDED = 'NOT_FUNDED',
  FUNDED = 'FUNDED',
  RELEASED = 'RELEASED',
  REFUNDED = 'REFUNDED',
  DISPUTED = 'DISPUTED',
}

export interface Order {
  id: string;
  client: User;
  artisan: Artisan;
  description: string;
  status: OrderStatus;
  scheduledAt: Date;
  completedAt?: Date;
  escrowAmount: number;
  escrowStatus: EscrowStatus;
  address: string;
  city: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderDto {
  artisanId: string;
  description: string;
  scheduledAt: Date;
  address: string;
  city: string;
  notes?: string;
}
