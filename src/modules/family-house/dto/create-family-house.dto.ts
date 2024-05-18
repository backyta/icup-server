import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateFamilyHouseDto {
  //General info
  @ApiProperty({
    example: 'Family House 1',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(30)
  @IsOptional()
  houseName?: string;

  @ApiProperty({
    example: 'A',
  })
  @IsString()
  @IsNotEmpty()
  houseZone: string;

  // Contact Info
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
    example: 'Las Lomas',
  })
  @IsString()
  @IsNotEmpty()
  urbanSector: string;

  @ApiProperty({
    example: 'Jr. Example 123',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    example: 'Cerca del Parque Cantuta',
  })
  @IsString()
  @IsNotEmpty()
  referenceAddress: string;

  @ApiProperty({
    example: true,
  })
  @IsString()
  @IsOptional()
  status?: string;

  // Relations
  @ApiProperty({
    example: '38137648-cf88-4010-a0fd-10e3648440d3',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  theirPreacher: string;
}
