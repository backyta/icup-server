import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { UserInactivationReason } from '@/modules/user/enums/user-inactivation-reason.enum';
import { UserInactivationCategory } from '@/modules/user/enums/user-inactivation-category.enum';

export class InactivateUserDto {
  @ApiProperty({
    enum: UserInactivationCategory,
    example: UserInactivationCategory.PerformanceOrConduct,
    description:
      'The category that defines the reason for the member inactivation, such as administrative changes, performance or conduct, or other issues.',
  })
  @IsNotEmpty()
  @IsEnum(UserInactivationCategory)
  userInactivationCategory: string;

  @ApiProperty({
    enum: UserInactivationReason,
    example: UserInactivationReason.OrganizationalRestructure,
    description:
      'The specific reason for the removal or inactivation of a member, such as role reassignment, obsolete role, or other related factors.',
  })
  @IsNotEmpty()
  @IsEnum(UserInactivationReason)
  userInactivationReason: string;
}
