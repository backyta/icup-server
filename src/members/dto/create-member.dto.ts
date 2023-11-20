import {
  IsArray,
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';
import { MaritalStatus } from '../enums/marital-status.enum';

export class CreateMemberDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  lastName: string;

  @IsString()
  @IsNotEmpty()
  dateOfBirth: string | Date;

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
  @IsPositive()
  numberChildren?: number;

  @IsEnum(MaritalStatus)
  @IsNotEmpty()
  maritalStatus: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  dateJoinig?: string | Date;

  @IsString()
  @IsNotEmpty()
  nationality: string;

  @IsString({ each: true }) // cada uno de los elementos del array tiene que ser string
  @IsArray()
  @IsNotEmpty()
  roles: string[];
}
