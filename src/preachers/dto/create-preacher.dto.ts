import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreatePreacherDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  member_id: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  their_copastor: string;
}
