import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

import { SearchType, SearchTypeOfName } from '@/common/enums';

export class SearchTypeAndPaginationDto {
  @ApiProperty({
    enum: SearchType,
    description:
      'Choose one of types, to search for types (different entities).',
  })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({
    default: 10,
    description: 'How many rows do you need?',
  })
  @IsOptional()
  @Type(() => Number) // No use GlobalPipes with properties transform (enableImplicitConventions)
  limit?: number;

  @ApiProperty({
    default: 0,
    description: 'How many rows do you want to skip?',
  })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number;

  @ApiProperty({
    enum: SearchTypeOfName,
    description: 'Choose one of types, parameters for name search.',
  })
  @IsEnum(SearchTypeOfName)
  @IsOptional()
  @IsString()
  type_of_name?: string;
}
