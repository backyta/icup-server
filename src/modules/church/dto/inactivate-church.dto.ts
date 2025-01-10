import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { ChurchInactivationReason } from '@/modules/church/enums/church-inactivation-reason.enum';
import { ChurchInactivationCategory } from '@/modules/church/enums/church-inactivation-category.enum';

export class InactivateChurchDto {
  @ApiProperty({
    example: ChurchInactivationCategory.FinancialChallenges,
    description: 'Member inactivation category.',
  })
  @IsNotEmpty()
  @IsEnum(ChurchInactivationCategory)
  churchInactivationCategory: string;

  @ApiProperty({
    example: ChurchInactivationReason.FinancialInfeasibility,
    description: 'Reason for member removal.',
  })
  @IsNotEmpty()
  @IsEnum(ChurchInactivationReason)
  churchInactivationReason: string;
}
