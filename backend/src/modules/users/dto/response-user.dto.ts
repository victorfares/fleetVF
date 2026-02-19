import { Exclude, Expose } from 'class-transformer';
import { UserRole } from '../enums/user-role.enum';

@Exclude()
export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  role: UserRole;
}
