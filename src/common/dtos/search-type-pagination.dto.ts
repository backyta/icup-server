import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { searchTypeByName } from '../enums/search-type-by-name';

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

  @IsEnum(searchTypeByName)
  @IsOptional()
  @IsString()
  type_of_name?: string;
}
