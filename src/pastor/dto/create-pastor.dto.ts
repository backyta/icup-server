import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreatePastorDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  idMember: string;

  @IsArray()
  @IsNotEmpty()
  idCopastor: string[];
}
