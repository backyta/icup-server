import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
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

import { MaritalStatus, ValidMemberRoles } from '@/disciple/enums';

export class CreateDiscipleDto {
  // General and Personal info
  @ApiProperty({
    example: 'John Martin',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(40)
  firstName: string;

  @ApiProperty({
    example: 'Rojas Castro',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(40)
  lastName: string;

  @ApiProperty({
    example: 'male',
  })
  @IsIn(['male', 'female'])
  gender: string;

  @ApiProperty({
    example: 'single',
  })
  @IsEnum(MaritalStatus)
  @IsNotEmpty()
  maritalStatus: string;

  @ApiProperty({
    example: 'Colombia',
  })
  @IsString()
  @IsNotEmpty()
  originCountry: string;

  @ApiProperty({
    example: '1990/12/23',
  })
  @IsString()
  @IsNotEmpty()
  dateBirth: string | Date;

  @ApiProperty({
    example: '2',
  })
  @IsNumber()
  @IsOptional()
  numberChildren?: number;

  @ApiProperty({
    example: '2001/12/23',
  })
  @IsString()
  @IsOptional()
  conversionDate?: string | Date;

  // Contact Info
  @ApiProperty({
    example: 'example@example.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: '999333555',
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    example: 'Peru',
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(15)
  countryResidence?: string;

  @ApiProperty({
    example: 'Lima',
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(15)
  departmentResidence?: string;

  @ApiProperty({
    example: 'Lima',
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(15)
  provinceResidence?: string;

  @ApiProperty({
    example: 'Comas',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(20)
  districtResidence: string;

  @ApiProperty({
    example: 'Av.example 1234',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(30)
  urbanSectorResidence: string;

  @ApiProperty({
    example: 'Av.example 1234',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  addressResidence: string;

  @ApiProperty({
    example: 'Av.example 1234',
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(100)
  addressResidenceReference?: string;

  // Roles and Status
  @ApiProperty({
    example: ['member', 'preacher'],
  })
  @IsEnum(ValidMemberRoles, { each: true })
  @IsArray()
  @IsNotEmpty()
  roles: string[];

  @ApiProperty({
    example: 'Active',
  })
  @IsString()
  @IsOptional()
  status?: string;

  // Relations
  @ApiProperty({
    example: 'cf5a9ee3-cad7-4b73-a331-a5f3f76f6661',
  })
  @IsString()
  @IsUUID()
  @IsOptional()
  theirFamilyHouse?: string;

  @ApiProperty({
    example: 'cf5a9ee3-cad7-4b73-a331-a5f3f76f6661',
  })
  @IsString()
  @IsUUID()
  @IsOptional()
  theirPastor?: string;

  @ApiProperty({
    example: 'cf5a9ee3-cad7-4b73-a331-a5f3f76f6661',
  })
  @IsString()
  @IsUUID()
  @IsOptional()
  theirCopastor?: string;

  @ApiProperty({
    example: 'cf5a9ee3-cad7-4b73-a331-a5f3f76f6661',
  })
  @IsString()
  @IsUUID()
  @IsOptional()
  theirPreacher?: string;
}
