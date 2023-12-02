import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCoPastorDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id_member: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  @IsOptional()
  id_pastor?: string;
}
