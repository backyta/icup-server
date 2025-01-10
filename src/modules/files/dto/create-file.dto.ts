import {
  IsEnum,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { OfferingIncomeCreationType } from '@/modules/offering/income/enums/offering-income-creation-type.enum';
import { OfferingIncomeCreationSubType } from '@/modules/offering/income/enums/offering-income-creation-sub-type.enum';

import { OfferingFileType } from '@/common/enums/offering-file-type.enum';

export class CreateFileDto {
  @ApiProperty({
    example: OfferingFileType.Income,
    description: 'Type of file to be used for the image path.',
  })
  @IsEnum(OfferingFileType)
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(20)
  fileType: string;

  @ApiProperty({
    example: OfferingIncomeCreationType.Offering,
    description: 'Type of offering to be used for the image path.',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(40)
  offeringType: string;

  @ApiProperty({
    example: OfferingIncomeCreationSubType.ChurchGround,
    description: 'Sub-type of offering to be used for the image path.',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(40)
  offeringSubType?: string;
}
