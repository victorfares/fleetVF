import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AgencyResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  city: string;

  @Expose()
  state: string;
}
