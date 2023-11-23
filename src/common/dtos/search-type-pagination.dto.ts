import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class SearchTypeAndPaginationDto {
  @IsNotEmpty()
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
