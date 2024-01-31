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
import { SubTypesOffering } from '../enums/sub-type-offering.enum';
import { CurrencyType } from '../enums/currency-type.enum';

export class CreateOfferingDto {
  @IsIn(['offering', 'tithe'])
  type: string;

  @IsEnum(SubTypesOffering)
  @IsNotEmpty()
  @IsOptional()
  sub_type?: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsEnum(CurrencyType)
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(100)
  comments?: string;

  @IsString()
  @IsOptional()
  url_file?: string;

  //* Relations

  @IsString()
  @IsUUID()
  @IsOptional()
  family_home_id?: string;

  @IsString()
  @IsUUID()
  @IsOptional()
  member_id?: string;

  @IsString()
  @IsUUID()
  @IsOptional()
  copastor_id?: string;
}
