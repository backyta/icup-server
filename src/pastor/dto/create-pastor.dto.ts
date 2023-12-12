import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreatePastorDto {
  @IsNotEmpty()
  @IsUUID()
  id_member: string;
}
