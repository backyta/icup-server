import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class MetricsPaginationDto {
  @ApiProperty({
    example: '2024',
    description:
      'The year for which the metrics reports are to be generated. This is important for filtering reports by a specific year.',
  })
  @IsOptional()
  @Type(() => String)
  year?: string;

  @ApiProperty({
    required: false,
    example: 'January',
    description:
      'The starting month for the metrics report generation. This parameter helps define the time frame for which the report will include data.',
  })
  @IsOptional()
  @Type(() => String)
  startMonth?: string;

  @ApiProperty({
    required: false,
    example: 'March',
    description:
      'The ending month for the metrics report generation. This completes the time frame for the report, indicating the last month of data to include.',
  })
  @IsOptional()
  @Type(() => String)
  endMonth?: string;

  @ApiProperty({
    example: 'members_by_category+members_by_category_and_gender',
    description:
      'A list of report types that will be generated. This can include various predefined metric categories, such as "members_by_category" or "members_by_category_and_gender". The values determine the content and structure of the report.',
  })
  @IsOptional()
  types?: string;

  @ApiProperty({
    description:
      'The unique identifier (ID) of the church for which the metrics will be generated. This helps narrow down the report to specific church data.',
    example: 'b740f708-f19d-4116-82b5-3d7b5653be9b',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  churchId?: string;
}
