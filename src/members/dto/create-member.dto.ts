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

  @IsString()
  @IsNotEmpty()
  date_birth: string | Date;

  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  age?: number;

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

  @IsString({ each: true }) // cada uno de los elementos del array tiene que ser string
  @IsArray()
  @IsNotEmpty()
  roles: string[];
}

// todo :  agregar min length
