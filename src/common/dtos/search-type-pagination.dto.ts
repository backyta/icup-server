import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { SearchTypeOfName } from '../enums/search-type-by-name';

export class SearchTypeAndPaginationDto {
  @IsNotEmpty()
  @IsString()
  type: string;

  @IsOptional()
  @Type(() => Number) // No use GlobalPipes with properties transform (enableImplicitConventions)
  limit?: number;

  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number;

  @IsEnum(SearchTypeOfName)
  @IsOptional()
  @IsString()
  type_of_name?: string;
}
