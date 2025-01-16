import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { OfferingInactivationReason } from '@/modules/offering/shared/enums/offering-inactivation-reason.enum';
import { ExchangeCurrencyTypes } from '../../income/enums/exchange-currency-type.enum';

export class InactivateOfferingDto {
  @ApiProperty({
    enum: OfferingInactivationReason,
    example: OfferingInactivationReason.FamilyGroupSelectionError,
    required: false,
    description:
      'The reason for the deactivation of the record, indicating the specific cause for the inactivation.',
  })
  @IsNotEmpty()
  @IsEnum(OfferingInactivationReason)
  offeringInactivationReason: string;

  @ApiProperty({
    example: '3.89',
    required: false,
    description:
      'The exchange rate value applied to the transaction, representing the amount of currency conversion.',
  })
  @IsString()
  @IsOptional()
  exchangeRate?: string;

  @ApiProperty({
    enum: ExchangeCurrencyTypes,
    example: ExchangeCurrencyTypes.PENtoUSD,
    required: false,
    description:
      'The currency pair for the exchange rate, specifying the conversion from one currency to another (e.g., PEN to USD).',
  })
  @IsString()
  @IsOptional()
  exchangeCurrencyTypes?: string;
}
