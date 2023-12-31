import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCoPastorDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id_member: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  their_pastor: string;
}
