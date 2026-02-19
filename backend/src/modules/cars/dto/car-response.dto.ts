import { Exclude, Expose, Type } from 'class-transformer';
import { AgencyResponseDto } from '../../agencies/dto/agency-response.dto';
import { CarStatus } from '../enums/car-status.enum';

@Exclude() // Garante que campos novos no banco não vazem
export class CarResponseDto {
  @Expose()
  id: string;

  @Expose()
  model: string;

  @Expose()
  brand: string;

  @Expose()
  licensePlate: string;

  @Expose()
  dailyRate: number;

  @Expose()
  currentMileage: number;

  @Expose()
  status: CarStatus;

  @Expose()
  imageUrl: string;

  @Expose()
  @Type(() => AgencyResponseDto)
  agency: AgencyResponseDto;
}