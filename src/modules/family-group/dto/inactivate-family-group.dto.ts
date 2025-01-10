import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { FamilyGroupInactivationReason } from '@/modules/family-group/enums/family-group-inactivation-reason.enum';
import { FamilyGroupInactivationCategory } from '@/modules/family-group/enums/family-group-inactivation-category.enum';

export class InactivateFamilyGroupDto {
  @ApiProperty({
    example: FamilyGroupInactivationCategory.HostUnavailability,
    description: 'Member inactivation category.',
  })
  @IsNotEmpty()
  @IsEnum(FamilyGroupInactivationCategory)
  familyGroupInactivationCategory: string;

  @ApiProperty({
    example: FamilyGroupInactivationReason.HostFamilyDecision,
    description: 'Reason for member removal.',
  })
  @IsNotEmpty()
  @IsEnum(FamilyGroupInactivationReason)
  familyGroupInactivationReason: string;
}
