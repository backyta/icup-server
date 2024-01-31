import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCoPastorDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  member_id: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  their_pastor: string;
}
