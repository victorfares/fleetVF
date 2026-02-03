import { PartialType } from '@nestjs/swagger';
import { CreateAgencyDto } from './create-agency.dto';

export class UpdateAgencyDto extends PartialType(CreateAgencyDto) {
  readonly name?: string;
  readonly city?: string;
  readonly state?: string;
}
