import {
  IsUUID,
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { RecordStatus } from '@/common/enums/record-status.enum';

import { FamilyGroupInactivationReason } from '@/modules/family-group/enums/family-group-inactivation-reason.enum';
import { FamilyGroupInactivationCategory } from '@/modules/family-group/enums/family-group-inactivation-category.enum';

export class CreateFamilyGroupDto {
  //* General info
  @ApiProperty({
    example: 'Guerreros de Jehova',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(30)
  familyGroupName: string;

  @ApiProperty({
    example: '17:30',
  })
  @IsString()
  @IsNotEmpty()
  serviceTime: string;

  //* Contact Info
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
    example: 'La Merced',
  })
  @IsString()
  @IsNotEmpty()
  urbanSector: string;

  @ApiProperty({
    example: 'Jr. Central 123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(80)
  address: string;

  @ApiProperty({
    example: 'Cerca del parque central',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(150)
  referenceAddress: string;

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
  @IsNotEmpty()
  @IsOptional()
  @IsUUID()
  theirPreacher?: string;

  @ApiProperty({
    example: '38137648-cf88-4010-a0fd-10e3648440d3',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @IsUUID()
  theirZone?: string;

  //! Properties record inactivation (optional)
  @ApiProperty({
    example: FamilyGroupInactivationCategory.HostUnavailability,
    description: 'Member inactivation category.',
  })
  @IsOptional()
  @IsEnum(FamilyGroupInactivationCategory)
  familyGroupInactivationCategory?: string;

  @ApiProperty({
    example: FamilyGroupInactivationReason.HostFamilyDecision,
    description: 'Reason for member removal.',
  })
  @IsOptional()
  @IsEnum(FamilyGroupInactivationReason)
  familyGroupInactivationReason?: string;
}
