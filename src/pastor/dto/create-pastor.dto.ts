import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreatePastorDto {
  // @IsString()
  @IsNotEmpty()
  @IsUUID()
  idMember: string;
}
