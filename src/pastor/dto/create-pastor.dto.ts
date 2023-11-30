import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreatePastorDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id_member: string;

  @IsArray()
  @IsNotEmpty()
  @IsOptional()
  id_copastores?: string[];
}
