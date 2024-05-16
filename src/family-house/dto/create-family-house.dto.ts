import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateFamilyHouseDto {
  @ApiProperty({
    example: 'A',
  })
  @IsString()
  @IsNotEmpty()
  zone_house: string;

  @ApiProperty({
    example: 'Family House 1',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(30)
  @IsOptional()
  name_house?: string;
  //TODO : corregir todos los home
  //* Address
  @ApiProperty({
    example: 'Peru',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  country?: string;

  @ApiProperty({
    example: 'Lima',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  department?: string;

  @ApiProperty({
    example: 'Lima',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  province?: string;

  @ApiProperty({
    example: 'Comas',
  })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty({
    example: 'Jr. Example 123',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  is_active?: boolean;

  //* Relations

  @ApiProperty({
    example: '38137648-cf88-4010-a0fd-10e3648440d3',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  their_preacher: string;
}
