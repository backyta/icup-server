import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

import { CreateFamilyGroupDto } from '@/modules/family-group/dto/create-family-group.dto';

export class UpdateFamilyGroupDto extends PartialType(CreateFamilyGroupDto) {
  @ApiProperty({
    example: '38137648-cf88-4010-a0fd-10e3648440d3',
  })
  @IsOptional()
  @IsString()
  newTheirPreacher?: string;
}
