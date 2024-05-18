import { ApiProperty } from '@nestjs/swagger';
import {
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

import { SubTypesOffering, CurrencyType } from '@/modules/offering/enums';

export class CreateOfferingDto {
  @ApiProperty({
    example: 'offering',
  })
  @IsIn(['offering', 'tithe'])
  type: string;

  @ApiProperty({
    enum: SubTypesOffering,
  })
  @IsEnum(SubTypesOffering)
  @IsNotEmpty()
  @IsOptional()
  sub_type?: string;

  @ApiProperty({
    example: 50,
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    enum: CurrencyType,
  })
  @IsEnum(CurrencyType)
  @IsNotEmpty()
  currency: string;

  @ApiProperty({
    example: 'Comments .....',
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(100)
  comments?: string;

  @ApiProperty({
    example: 'http://... url created whit file service',
  })
  @IsString()
  @IsOptional()
  url_file?: string;

  //* Relations

  @ApiProperty({
    example: '0b46eb7e-7730-4cbb-8c61-3ccdfa6da391',
  })
  @IsString()
  @IsUUID()
  @IsOptional()
  family_home_id?: string;

  @ApiProperty({
    example: '0b46eb7e-7730-4cbb-8c61-3ccdfa6da391',
  })
  @IsString()
  @IsUUID()
  @IsOptional()
  member_id?: string;

  @ApiProperty({
    example: '0b46eb7e-7730-4cbb-8c61-3ccdfa6da391',
  })
  @IsString()
  @IsUUID()
  @IsOptional()
  copastor_id?: string;
}
