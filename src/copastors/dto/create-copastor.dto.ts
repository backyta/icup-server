import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCoPastorDto {
  @ApiProperty({
    example: '47d03b60-3c8b-4a24-8802-1917e5b49be3',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  member_id: string;

  @ApiProperty({
    example: '47d03b60-3c8b-4a24-8802-1917e5b49be3',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  their_pastor: string;
}
