import { ApiProperty } from '@nestjs/swagger';

import { Transform, Type } from 'class-transformer';
import {
  Min,
  IsEnum,
  IsString,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

import { SearchType } from '@/common/enums/search-types.enum';
import { SearchSubType } from '@/common/enums/search-sub-type.enum';

export class SearchAndPaginationDto {
  // @ApiProperty({
  //   enum: SearchType,
  //   description: 'Choose one of the types to perform a search.',
  //   example: SearchType.ChurchName,
  // })
  @IsEnum(SearchType)
  @IsNotEmpty({ message: 'El tipo de búsqueda es requerido.' })
  @IsString()
  @IsOptional()
  'search-type'?: string;

  @IsEnum(SearchType)
  @IsNotEmpty({ message: 'El tipo de búsqueda es requerido.' })
  @IsString()
  @IsOptional()
  searchType?: string;

  // @ApiProperty({
  //   enum: SearchSubType,
  //   description: 'Choose one of the sub types to perform a search.',
  //   example: SearchSubType.KitchenFurniture,
  // })
  @IsEnum(SearchSubType)
  @IsOptional()
  @IsString()
  'search-sub-type'?: string;

  @IsEnum(SearchSubType)
  @IsOptional()
  @IsString()
  searchSubType?: string;

  @ApiProperty({
    default: 10,
    example: 10,
    description: 'How many rows do you need?',
    required: false,
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

  // @ApiProperty({
  //   description: 'Unique identifier of the church to be used for filtering or retrieving related records in the search.',
  //   example: 'b740f708-f19d-4116-82b5-3d7b5653be9b',
  //   required: false,
  // })
  @IsOptional()
  @IsString()
  @Type(() => String)
  churchId?: string;

  //* For preacher module when search by zone id and return preacher with family groups or not
  // @ApiProperty({
  //   example: 'true',
  //   description: 'Do you want null relationships to be returned?',
  // })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  isNullFamilyGroup?: boolean;

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

  //* For Zones and Family groups in metrics
  // @ApiProperty({
  //   example: 'true',
  //   description: 'Do you want returned all zones?',
  // })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  allZones?: boolean;

  //* For Family groups in metrics
  // @ApiProperty({
  //   example: 'true',
  //   description: 'Do you want returned all family groups?',
  // })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  allFamilyGroups?: boolean;

  // @ApiProperty({
  //   example: 'true',
  //   description: 'Do you want returned all family districts?',
  // })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  allDistricts?: boolean;

  //* For Offerings (income and expenses) and Metrics
  // @ApiProperty({
  //   example: 'true',
  //   description: 'Do you want search by simple month or range months?',
  // })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  isSingleMonth?: boolean;
}
