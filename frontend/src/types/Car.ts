import type { Agency } from "./Agency";

export enum CarStatus {
  AVAILABLE = 'AVAILABLE',
  RENTED = 'RENTED',
  MAINTENANCE = 'MAINTENANCE',
}

export interface Car {
  id: string;
  model: string;
  brand: string;
  licensePlate: string;
  dailyRate: number;
  currentMileage: number;
  status: CarStatus;
  imageUrl?: string;
  agency?: Agency
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CarResponse {
  data: Car[];
  count: number;
  limit: number;
  offset: number;
}