export interface Car {
  id: number;
  model: string;
  brand: string;
  licensePlate: string;
  dailyRate: number;
  currentMileage: number;
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';
  imageUrl?: string;
  agency?: {
    city: string;
    state: string;
  };
}