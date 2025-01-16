import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, Min } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({
    default: 10,
    example: 10,
    required: false,
    description: 'How many rows do you need?',
  })
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @ApiProperty({
    default: 0,
    example: 0,
    required: false,
    description: 'How many rows do you want to skip?',
  })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number;

  @ApiProperty({
    default: 'DESC',
    example: 'DESC',
    required: false,
    description: 'What type of order do you need the records in?',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  order?: string;

  //* For zone module when search supervisors and return supervisors with zone or not
  // @ApiProperty({
  //   example: 'true',
  //   description: 'Do you want null relationships to be returned?',
  // })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  isNullZone?: boolean;

  // @ApiProperty({
  //   example: 'true',
  //   description:
  //     'Is it a simple query (does not need to load relationships) or a complete query (does need to load relationships)?',
  // })
  @IsOptional()
  // @IsBoolean()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  isSimpleQuery?: boolean;

  // @ApiProperty({
  //   description: 'Unique identifier of the church to be used for filtering or retrieving related records in the search.',
  //   example: 'b740f708-f19d-4116-82b5-3d7b5653be9b',
  //   required: false,
  // })
  @IsOptional()
  @IsString()
  @Type(() => String)
  churchId?: string;
}
