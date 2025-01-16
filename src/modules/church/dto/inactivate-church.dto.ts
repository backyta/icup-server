import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { ChurchInactivationReason } from '@/modules/church/enums/church-inactivation-reason.enum';
import { ChurchInactivationCategory } from '@/modules/church/enums/church-inactivation-category.enum';

export class InactivateChurchDto {
  @ApiProperty({
    enum: ChurchInactivationCategory,
    example: ChurchInactivationCategory.FinancialChallenges,
    description:
      'The category that defines the reason for the church inactivation, such as financial challenges, low attendance, or other operational issues.',
  })
  @IsNotEmpty()
  @IsEnum(ChurchInactivationCategory)
  churchInactivationCategory: string;

  @ApiProperty({
    enum: ChurchInactivationReason,
    example: ChurchInactivationReason.FinancialInfeasibility,
    description:
      'The specific reason for the removal or inactivation of a church, such as financial infeasibility, lack of resources, or other related factors.',
  })
  @IsNotEmpty()
  @IsEnum(ChurchInactivationReason)
  churchInactivationReason: string;
}
