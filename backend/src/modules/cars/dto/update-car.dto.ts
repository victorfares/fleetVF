import { PartialType } from '@nestjs/swagger';
import { CreateCarDto } from './create-car.dto';
import { OmitType } from '@nestjs/mapped-types';

export class UpdateCarDto extends PartialType(
  OmitType(CreateCarDto, ['licensePlate'] as const),
) {}
