import { PartialType } from '@nestjs/mapped-types';
import { CreateCoPastorDto } from './create-copastor.dto';
import {
  IsBoolean,
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
import { MaritalStatus } from '../../members/enums/marital-status.enum';

export class UpdateCoPastorDto extends PartialType(CreateCoPastorDto) {
  //* Info member
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(40)
  first_name?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(40)
  last_name?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  date_birth?: string | Date;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsIn(['male', 'female'])
  @IsOptional()
  gender?: string;

  @IsNumber()
  @IsOptional()
  number_children?: number;

  @IsNotEmpty()
  @IsEnum(MaritalStatus)
  @IsOptional()
  marital_status?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  date_joinig?: string | Date;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  origin_country?: string;

  //* Info adress
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(10)
  residence_country?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(15)
  departament?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(15)
  province?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(20)
  @IsOptional()
  district?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  @IsOptional()
  address?: string;
}
