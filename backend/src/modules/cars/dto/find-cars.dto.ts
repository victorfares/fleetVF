import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { Type } from 'class-transformer';
export class FindCarsDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
  agencyId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;
}
