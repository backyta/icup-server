import { CurrencyType } from '@/modules/offering/shared/enums/currency-type.enum';

import { OfferingExpense } from '@/modules/offering/expense/entities/offering-expense.entity';
import { OfferingExpenseSearchSubTypeNames } from '@/modules/offering/expense/enums/offering-expense-search-sub-type.enum';

interface Options {
  offeringExpenses: OfferingExpense[];
}

interface Church {
  id: string;
  abbreviatedChurchName: string;
}

interface OfferingExpenseDataResult {
  subType: string;
  date: Date;
  comments: string;
  accumulatedOfferingPEN: number;
  accumulatedOfferingUSD: number;
  accumulatedOfferingEUR: number;
  church: Church;
  totalAmount: number;
}

export const offeringExpenseReportFormatter = ({
  offeringExpenses,
}: Options): OfferingExpenseDataResult[] => {
  const dataResult: OfferingExpenseDataResult[] = offeringExpenses?.reduce(
    (acc, offering) => {
      acc.push({
        subType: OfferingExpenseSearchSubTypeNames[offering.subType],
        date: offering.date,
        comments: offering.comments,
        accumulatedOfferingPEN:
          offering?.currency === CurrencyType.PEN ? +offering?.amount : 0,
        accumulatedOfferingUSD:
          offering?.currency === CurrencyType.USD ? +offering?.amount : 0,
        accumulatedOfferingEUR:
          offering?.currency === CurrencyType.EUR ? +offering?.amount : 0,
        church: {
          id: offering?.church?.id,
          abbreviatedChurchName: offering?.church?.abbreviatedChurchName,
        },
        totalAmount: +offering.amount,
      });

      return acc;
    },
    [],
  );

  dataResult.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return dataResult;
};
