import { PartialType } from '@nestjs/mapped-types';
import { CreatePreacherDto } from './create-preacher.dto';
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
import { MaritalStatus } from 'src/members/enums/marital-status.enum';
import { ValidRoles } from 'src/members/enums/valid-roles.enum';

export class UpdatePreacherDto extends PartialType(CreatePreacherDto) {
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
  date_birth: string | Date;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEmail()
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
  nationality?: string;

  @IsEnum(ValidRoles, { each: true })
  @IsArray()
  @IsNotEmpty()
  @IsOptional()
  roles?: string[];
}
