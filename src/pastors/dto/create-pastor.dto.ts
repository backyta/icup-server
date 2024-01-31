import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreatePastorDto {
  @IsNotEmpty()
  @IsUUID()
  member_id: string;
}
