import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { ZoneInactivationReason } from '@/modules/zone/enums/zone-inactivation-reason.enum';
import { ZoneInactivationCategory } from '@/modules/zone/enums/zone-inactivation-category.enum';

export class InactivateZoneDto {
  @ApiProperty({
    example: ZoneInactivationCategory.GroupFamilyRelatedReasons,
    description: 'Member inactivation category.',
  })
  @IsNotEmpty()
  @IsEnum(ZoneInactivationCategory)
  zoneInactivationCategory: string;

  @ApiProperty({
    example: ZoneInactivationReason.FamilyGroupRelocation,
    description: 'Reason for member removal.',
  })
  @IsNotEmpty()
  @IsEnum(ZoneInactivationReason)
  zoneInactivationReason: string;
}
