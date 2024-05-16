import { ApiProperty, PartialType } from '@nestjs/swagger';
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

import { CreatePastorDto } from '@/pastor/dto';

import { MaritalStatus } from '@/disciple/enums';

export class UpdatePastorDto extends PartialType(CreatePastorDto) {
  //* Info member
  @ApiProperty({
    example: 'John Martin',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(40)
  first_name: string;

  @ApiProperty({
    example: 'Rojas Castro',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(40)
  last_name: string;

  @ApiProperty({
    example: '1990/12/23',
  })
  @IsString()
  @IsNotEmpty()
  date_birth: string | Date;

  @ApiProperty({
    example: 'example@example.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  status?: string;

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
  marital_status: string;

  @ApiProperty({
    example: '2',
  })
  @IsNumber()
  @IsOptional()
  number_children?: number;

  @ApiProperty({
    example: '999333555',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: '2001/12/23',
  })
  @IsString()
  @IsOptional()
  date_joining?: string | Date;

  @ApiProperty({
    example: 'Colombia',
  })
  @IsString()
  @IsNotEmpty()
  origin_country: string;

  //* Info address
  @ApiProperty({
    example: 'Peru',
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(10)
  residence_country?: string;

  @ApiProperty({
    example: 'Lima',
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(15)
  department?: string;

  @ApiProperty({
    example: 'Lima',
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(15)
  province?: string;

  @ApiProperty({
    example: 'Comas',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(20)
  district: string;

  @ApiProperty({
    example: 'Av.example 1234',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  address: string;
}
