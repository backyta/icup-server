import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { MemberInactivationReason } from '@/common/enums/member-inactivation-reason.enum';
import { MemberInactivationCategory } from '@/common/enums/member-inactivation-category.enum';

export class InactivateMemberDto {
  @ApiProperty({
    enum: MemberInactivationCategory,
    example: MemberInactivationCategory.PersonalChallenges,
    description:
      'The category that defines the reason for the member inactivation, such as personal challenges, low attendance, or other issues.',
  })
  @IsNotEmpty()
  @IsEnum(MemberInactivationCategory)
  memberInactivationCategory: string;

  @ApiProperty({
    enum: MemberInactivationReason,
    example: MemberInactivationReason.HealthIssues,
    description:
      'The specific reason for the removal or inactivation of a member, such as lack of commitment, health issues, or other related factors.',
  })
  @IsNotEmpty()
  @IsEnum(MemberInactivationReason)
  memberInactivationReason: string;
}
