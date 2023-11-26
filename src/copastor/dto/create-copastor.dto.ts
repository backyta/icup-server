import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCoPastorDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  idMember: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  idPastor: string;
}
