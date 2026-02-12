import type { User } from './User';
import type { Car } from './Car';
import type { Agency } from './Agency';

export enum RentalStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Rental {
  id: string;
  startDate: string; // ISO String
  endDate: string;   // ISO String
  realReturnDate?: string;
  totalValue: number;
  dailyRateSnapshot: number;
  startMileage?: number;
  endMileage?: number;
  status: RentalStatus;
  
  // Relacionamentos populados
  user: User;
  car: Car;
  pickupAgency: Agency;
  returnAgency: Agency;
  
  createdAt: string;
}

export interface CreateRentalDto {
  userId: string;
  carId: string;
  startDate: string;
  endDate: string;
  pickupAgencyId: string;
  returnAgencyId?: string; // Opcional
}

export interface FinalizeRentalDto {
  status: RentalStatus.COMPLETED;
  endMileage: number;
  realReturnDate: string;
}