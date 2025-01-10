import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { CreateZoneDto } from '@/modules/zone/dto/create-zone.dto';

export class UpdateZoneDto extends PartialType(CreateZoneDto) {
  @ApiProperty({
    example: 'cf5a9ee3-cad7-4b73-a331-a5f3f76f6661',
  })
  @IsOptional()
  @IsString()
  newTheirSupervisor?: string;
}
