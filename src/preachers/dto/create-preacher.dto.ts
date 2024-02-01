import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreatePreacherDto {
  @ApiProperty({
    example: '8c89ee3e-3105-41c7-a544-58414588176a',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  member_id: string;

  @ApiProperty({
    example: '8c89ee3e-3105-41c7-a544-58414588176a',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  their_copastor: string;
}
