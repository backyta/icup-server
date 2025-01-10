import {
  IsEnum,
  IsUUID,
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { RecordStatus } from '@/common/enums/record-status.enum';

import { ZoneInactivationReason } from '@/modules/zone/enums/zone-inactivation-reason.enum';
import { ZoneInactivationCategory } from '@/modules/zone/enums/zone-inactivation-category.enum';

export class CreateZoneDto {
  //* General info
  @ApiProperty({
    example: 'Zona-A',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(30)
  @IsOptional()
  zoneName?: string;

  @ApiProperty({
    example: 'Perú',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  country?: string;

  @ApiProperty({
    example: 'Lima',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  department?: string;

  @ApiProperty({
    example: 'Lima',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  province?: string;

  @ApiProperty({
    example: 'Comas',
  })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty({
    example: 'active',
  })
  @IsString()
  @IsEnum(RecordStatus, {
    message:
      'El estado de registro debe ser uno de los siguientes valores: Activo o Inactivo',
  })
  @IsOptional()
  recordStatus?: string;

  //* Relations
  @ApiProperty({
    example: '38137648-cf88-4010-a0fd-10e3648440d3',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @IsUUID()
  theirSupervisor?: string;

  //! Properties record inactivation (optional)
  @ApiProperty({
    example: ZoneInactivationCategory.GroupFamilyRelatedReasons,
    description: 'Member inactivation category.',
  })
  @IsOptional()
  @IsEnum(ZoneInactivationCategory)
  zoneInactivationCategory?: string;

  @ApiProperty({
    example: ZoneInactivationReason.FamilyGroupDissolution,
    description: 'Reason for member removal.',
  })
  @IsOptional()
  @IsEnum(ZoneInactivationReason)
  zoneInactivationReason?: string;
}
