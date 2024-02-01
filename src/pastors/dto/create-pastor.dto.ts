import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreatePastorDto {
  @ApiProperty({
    example: 'b8927516-2f2a-46c0-aad1-d2e18f47372d',
  })
  @IsNotEmpty()
  @IsUUID()
  member_id: string;
}
