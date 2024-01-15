import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { MaritalStatus } from '../enums/marital-status.enum';
import { ValidRoles } from '../enums/valid-roles.enum';

export class CreateMemberDto {
  //* Info member
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

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsIn(['male', 'female'])
  gender: string;

  @IsEnum(MaritalStatus)
  @IsNotEmpty()
  marital_status: string;

  @IsNumber()
  @IsOptional()
  number_children?: number;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  date_joinig?: string | Date;

  @IsString()
  @IsNotEmpty()
  origin_country: string;

  @IsEnum(ValidRoles, { each: true })
  @IsArray()
  @IsNotEmpty()
  roles: string[];

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
  district: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  address: string;

  //* Relations
  @IsString()
  @IsUUID()
  @IsOptional()
  their_family_home?: string;

  @IsString()
  @IsUUID()
  @IsOptional()
  their_pastor?: string;

  @IsString()
  @IsUUID()
  @IsOptional()
  their_copastor?: string;

  @IsString()
  @IsUUID()
  @IsOptional()
  their_preacher?: string;
}
