import { PartialType } from '@nestjs/swagger';
import { CreateOfferingIncomeDto } from '@/modules/offering/income/dto/create-offering-income.dto';

export class UpdateOfferingIncomeDto extends PartialType(
  CreateOfferingIncomeDto,
) {}
