import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateAgencyDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  readonly city: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2, { message: 'Estado deve ser abreviado (Ex : SP)' })
  readonly state: string;

  @IsString()
  @IsNotEmpty({ message: 'O endereço é obrigatório' })
  readonly address: string;
}
