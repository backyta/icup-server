import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreatePastorDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id_member: string;
}
