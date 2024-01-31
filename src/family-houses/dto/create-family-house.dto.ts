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
  @IsString()
  @IsNotEmpty()
  zone: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(30)
  @IsOptional()
  name_home?: string;

  //* Address
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  province?: string;

  @IsString()
  @IsNotEmpty()
  district: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  is_active?: boolean;

  //* Relations

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  their_preacher: string;
}
