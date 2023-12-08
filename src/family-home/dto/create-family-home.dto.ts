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
  code: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(20)
  name_home: string;

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

  // @IsString()
  // @IsNotEmpty()
  // @IsUUID()
  // their_pastor: string;

  // @IsString()
  // @IsNotEmpty()
  // @IsUUID()
  // their_copastor: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  their_preacher: string;
}
