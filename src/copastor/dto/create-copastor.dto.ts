import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCoPastorDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  idMember: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  @IsOptional()
  idPastor?: string;
}
