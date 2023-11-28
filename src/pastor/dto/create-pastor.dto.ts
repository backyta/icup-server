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
  idMember: string;

  @IsArray()
  @IsNotEmpty()
  @IsOptional()
  idCopastores?: string[];
}
