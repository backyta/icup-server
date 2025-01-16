import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { FamilyGroupInactivationReason } from '@/modules/family-group/enums/family-group-inactivation-reason.enum';
import { FamilyGroupInactivationCategory } from '@/modules/family-group/enums/family-group-inactivation-category.enum';

export class InactivateFamilyGroupDto {
  @ApiProperty({
    enum: FamilyGroupInactivationCategory,
    example: FamilyGroupInactivationCategory.HostUnavailability,
    description:
      'The category that defines the reason for the family group inactivation, such as administrative changes, leadership issues, or other operational issues.',
  })
  @IsNotEmpty()
  @IsEnum(FamilyGroupInactivationCategory)
  familyGroupInactivationCategory: string;

  @ApiProperty({
    enum: FamilyGroupInactivationReason,
    example: FamilyGroupInactivationReason.HostFamilyDecision,
    description:
      'The specific reason for the removal or inactivation of a family group, such as preacher resignation, host family decision, or other related factors.',
  })
  @IsNotEmpty()
  @IsEnum(FamilyGroupInactivationReason)
  familyGroupInactivationReason: string;
}
