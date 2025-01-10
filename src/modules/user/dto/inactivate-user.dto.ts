import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { UserInactivationReason } from '@/modules/user/enums/user-inactivation-reason.enum';
import { UserInactivationCategory } from '@/modules/user/enums/user-inactivation-category.enum';

export class InactivateUserDto {
  @ApiProperty({
    example: UserInactivationCategory.PerformanceOrConduct,
    description: 'Member inactivation category.',
  })
  @IsNotEmpty()
  @IsEnum(UserInactivationCategory)
  userInactivationCategory: string;

  @ApiProperty({
    example: UserInactivationReason.OrganizationalRestructure,
    description: 'Reason for member removal.',
  })
  @IsNotEmpty()
  @IsEnum(UserInactivationReason)
  userInactivationReason: string;
}
