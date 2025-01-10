import { RecordStatus } from '@/common/enums/record-status.enum';

import { OfferingIncome } from '@/modules/offering/income/entities/offering-income.entity';
import { OfferingExpense } from '@/modules/offering/expense/entities/offering-expense.entity';

interface Options {
  offeringIncome: OfferingIncome[];
  offeringExpenses: OfferingExpense[];
}

export interface OfferingRecordsCount {
  totalOfferingRecordsCount: number;
  offeringIncomeRecordsCount: number;
  offeringExpenseRecordsCount: number;
}

export const offeringExpensesAndOfferingIncomeProportionFormatter = ({
  offeringIncome,
  offeringExpenses,
}: Options): OfferingRecordsCount => {
  const totalOfferingRecordsCount =
    offeringExpenses.length + offeringIncome.length;

  const offeringIncomeRecordsCount = offeringIncome.filter(
    (offering) => offering.recordStatus === RecordStatus.Active,
  ).length;

  const offeringExpenseRecordsCount = offeringExpenses.filter(
    (offering) => offering.recordStatus === RecordStatus.Active,
  ).length;

  return {
    totalOfferingRecordsCount,
    offeringIncomeRecordsCount,
    offeringExpenseRecordsCount,
  };
};
