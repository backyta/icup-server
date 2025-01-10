import {
  IsEnum,
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { Gender } from '@/common/enums/gender.enum';
export class CreateExternalDonorDto {
  @ApiProperty({
    example: 'John Martin',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  externalDonorFirstNames: string;

  @ApiProperty({
    example: 'Rojas Castro',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  externalDonorLastNames: string;

  @ApiProperty({
    example: Gender.Male,
  })
  @IsEnum(Gender, {
    message:
      'El género debe ser uno de los siguientes valores: Masculino o Femenino',
  })
  externalDonorGender: string;

  @ApiProperty({
    example: '1990-12-23',
  })
  @IsString()
  @IsOptional()
  externalDonorBirthDate?: Date;

  @ApiProperty({
    example: '+51 999333555',
  })
  @IsString()
  @IsOptional()
  externalDonorPhoneNumber?: string;

  @ApiProperty({
    example: 'example@example.com',
  })
  @IsEmail()
  @IsOptional()
  externalDonorEmail?: string;

  @ApiProperty({
    example: 'Perú',
  })
  @IsString()
  @IsOptional()
  @MinLength(0)
  @MaxLength(40)
  externalDonorOriginCountry?: string;

  @ApiProperty({
    example: 'Italia',
  })
  @IsString()
  @IsOptional()
  @MinLength(0)
  @MaxLength(40)
  externalDonorResidenceCountry?: string;

  @ApiProperty({
    example: 'Roma',
  })
  @IsString()
  @IsOptional()
  @MinLength(0)
  @MaxLength(40)
  externalDonorResidenceCity?: string;

  @ApiProperty({
    example: 'A 2 cuadras al colegio',
  })
  @IsString()
  @IsOptional()
  @MinLength(0)
  @MaxLength(40)
  externalDonorPostalCode?: string;
}
