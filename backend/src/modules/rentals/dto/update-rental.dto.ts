import { PartialType } from '@nestjs/mapped-types';
import { CreateRentalDto } from './create-rental.dto';
import { IsDateString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { RentalStatus } from '../enums/rental-status.enum';

export class UpdateRentalDto extends PartialType(CreateRentalDto) {
  // Usado para cancelar ou confirmar manualmente
  @IsOptional()
  @IsEnum(RentalStatus)
  status?: RentalStatus;

  @IsOptional()
  @IsDateString()
  realReturnDate?: string; // Data real que o cliente entregou

  @IsOptional()
  @IsInt()
  @Min(0)
  endMileage?: number;
}
