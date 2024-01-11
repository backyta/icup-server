import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreatePreacherDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id_member: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  their_copastor: string;
}
