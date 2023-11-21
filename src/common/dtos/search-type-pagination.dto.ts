import { Type } from 'class-transformer';
import { IsOptional, IsString, Min } from 'class-validator';

export class SearchTypeAndPaginationDto {
  @IsString()
  type: string;

  @IsOptional()
  @Type(() => Number) // No use GlobalPipes with properties transform (eneableImplicitConvertions)
  limit?: number;

  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number;
}
