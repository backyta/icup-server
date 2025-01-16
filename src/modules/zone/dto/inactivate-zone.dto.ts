import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { ZoneInactivationReason } from '@/modules/zone/enums/zone-inactivation-reason.enum';
import { ZoneInactivationCategory } from '@/modules/zone/enums/zone-inactivation-category.enum';

export class InactivateZoneDto {
  @ApiProperty({
    enum: ZoneInactivationCategory,
    example: ZoneInactivationCategory.FamilyGroupsRelatedReasons,
    description:
      'The category that defines the reason for the zone inactivation, such as administrative changes, leadership issues, or other external factors.',
  })
  @IsNotEmpty()
  @IsEnum(ZoneInactivationCategory)
  zoneInactivationCategory: string;

  @ApiProperty({
    enum: ZoneInactivationReason,
    example: ZoneInactivationReason.FamilyGroupsRelocation,
    description:
      'The specific reason for the removal or inactivation of a zone, such as structural reorganization, supervisor resignation, or other external factors.',
  })
  @IsNotEmpty()
  @IsEnum(ZoneInactivationReason)
  zoneInactivationReason: string;
}
