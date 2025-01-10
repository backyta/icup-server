import { PartialType } from '@nestjs/swagger';
import { CreateOfferingExpenseDto } from '@/modules/offering/expense/dto/create-offering-expense.dto';

export class UpdateOfferingExpenseDto extends PartialType(
  CreateOfferingExpenseDto,
) {}
