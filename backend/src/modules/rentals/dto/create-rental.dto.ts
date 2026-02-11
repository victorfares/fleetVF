import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsInt,
  Min,
} from 'class-validator';

export class CreateRentalDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsUUID()
  carId: string;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @IsNotEmpty()
  @IsUUID()
  pickupAgencyId: string;

  @IsOptional()
  @IsUUID()
  returnAgencyId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  startMileage?: number;
}
