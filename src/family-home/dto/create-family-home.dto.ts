import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateFamilyHomeDto {
  @IsString()
  @IsNotEmpty()
  zone: string;

  // @IsString()
  // @IsOptional()
  // @IsNotEmpty()
  // number_home?: string;

  // @IsString()
  // @IsOptional()
  // @IsNotEmpty()
  // code?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(30)
  @IsOptional()
  name_home?: string;

  //* Address

  @IsString()
  @IsNotEmpty()
  district: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  is_active?: boolean;

  //* Relations

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  their_preacher: string;
}
