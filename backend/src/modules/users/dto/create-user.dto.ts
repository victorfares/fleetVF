import {
  IsString,
  IsEmail,
  IsEnum,
  IsStrongPassword,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { UserRole } from '../enums/user-role.enum';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  name: string;

  @IsEmail({}, { message: 'Forneça um endereço de email válido' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsStrongPassword(
    {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    },
    {
      message:
        'A senha é muito fraca. Use pelo menos 6 caracteres, com letras maiúsculas, minúsculas e números.',
    },
  )
  password: string;

  @IsEnum(UserRole, { message: 'Cargo inválido' })
  @IsOptional() // Se não mandar, o banco assume CLIENT (default)
  role?: UserRole;
}
