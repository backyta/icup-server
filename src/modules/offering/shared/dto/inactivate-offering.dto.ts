import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { OfferingInactivationReason } from '@/modules/offering/shared/enums/offering-inactivation-reason.enum';

export class InactivateOfferingDto {
  @ApiProperty({
    example: OfferingInactivationReason.FamilyGroupSelectionError,
    description: 'Type of reason for record deletion.',
  })
  @IsNotEmpty()
  @IsEnum(OfferingInactivationReason)
  offeringInactivationReason: string;

  @ApiProperty({
    example: '3.89',
    description: 'Type or amount of exchange.',
  })
  @IsString()
  @IsOptional()
  exchangeRate?: string;

  @ApiProperty({
    example: 'pen_to_usd',
    description: 'Currency for the exchange rate.',
  })
  @IsString()
  @IsOptional()
  exchangeCurrencyTypes?: string;
}
