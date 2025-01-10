import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class MetricsPaginationDto {
  @ApiProperty({
    example: '2024',
    description: 'Year in which metrics reports will be generated.',
  })
  @IsOptional()
  @Type(() => String)
  year?: string;

  @ApiProperty({
    example: 'January',
    description: 'Start month in which metrics reports will be generated.',
  })
  @IsOptional()
  @Type(() => String)
  startMonth?: string;

  @ApiProperty({
    example: 'March',
    description: 'End month in which metrics reports will be generated.',
  })
  @IsOptional()
  @Type(() => String)
  endMonth?: string;

  @ApiProperty({
    example: ['members_by_category', 'members_by_category_and_gender'],
    description: 'Types of metrics that will be generated in the report.',
  })
  @IsOptional()
  types?: string;

  @ApiProperty({
    description: 'ID of the church that is part of the search.',
    example: 'b740f708-f19d-4116-82b5-3d7b5653be9b',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  churchId?: string;
}
