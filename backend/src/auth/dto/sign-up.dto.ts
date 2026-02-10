import { PickType } from '@nestjs/swagger'; // ou @nestjs/mapped-types
import { CreateUserDto } from '../../modules/users/dto/create-user.dto';

export class SignupDto extends PickType(CreateUserDto, [
  'name',
  'email',
  'password',
] as const) {}
