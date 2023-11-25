import {
  IsArray,
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { MaritalStatus } from '../enums/marital-status.enum';
import { ValidRoles } from '../enums/valid-roles.enum';

export class CreateMemberDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(40)
  first_name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(40)
  last_name: string;

  //! Cuando se mande fecha desde el front siempre sera fecha ahi probar y midificar el string y Date
  @IsString()
  @IsNotEmpty()
  date_birth: string | Date;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsIn(['male', 'female'])
  gender: string;

  @IsNumber()
  @IsOptional()
  number_children?: number;

  @IsEnum(MaritalStatus)
  @IsNotEmpty()
  marital_status: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  date_joinig?: string | Date;

  @IsString()
  @IsNotEmpty()
  nationality: string;

  @IsEnum(ValidRoles, { each: true }) // cada uno de los elementos del array tiene que ser algo de tipo Enum
  @IsArray()
  @IsNotEmpty()
  roles: string[];
}
