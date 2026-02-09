import { CarStatus } from '../enums/car-status.enum';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
} from 'class-validator';

export class CreateCarDto {
  @IsString()
  @IsNotEmpty()
  readonly model: string;

  @IsString()
  @IsNotEmpty()
  readonly brand: string;

  @IsString()
  @IsNotEmpty()
  readonly licensePlate: string;

  @IsNumber()
  @IsNotEmpty()
  readonly dailyRate: number;

  @IsNumber()
  @IsNotEmpty()
  readonly currentMileage: number;

  @IsString()
  @IsOptional()
  readonly imageUrl?: string;

  @IsOptional()
  @IsEnum(CarStatus)
  readonly status?: CarStatus;

  @IsUUID()
  @IsNotEmpty()
  readonly agencyId: string;
}
