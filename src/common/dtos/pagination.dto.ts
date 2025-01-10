import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, Min } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({
    default: 10,
    example: 5,
    description: 'How many rows do you need?',
  })
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @ApiProperty({
    default: 0,
    example: 2,
    description: 'How many rows do you want to skip?',
  })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number;

  @ApiProperty({
    default: 'ASC',
    example: 'DESC',
    description: 'What type of order do you need the records in?',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  order?: string;

  //* For zone module when search supervisors and return supervisors with zone or not
  @ApiProperty({
    example: 'true',
    description: 'Do you want null relationships to be returned?',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  isNullZone?: boolean;

  @ApiProperty({
    example: 'true',
    description:
      'Is it a simple query (does not need to load relationships) or a complete query (does need to load relationships)?',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  isSimpleQuery?: boolean;

  @ApiProperty({
    description: 'ID of the church that is part of the search.',
    example: 'b740f708-f19d-4116-82b5-3d7b5653be9b',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  churchId?: string;
}
