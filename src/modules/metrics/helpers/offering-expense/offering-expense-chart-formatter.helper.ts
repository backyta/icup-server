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

export interface OfferingExpenseDataResult {
  subType: string;
  date: Date;
  comments: string;
  accumulatedOfferingPEN: number;
  accumulatedOfferingUSD: number;
  accumulatedOfferingEUR: number;
  church: Church;
  allOfferings: Array<{
    offering: number;
    currency: string;
    date: string;
  }>;
  totalAmount: number;
}

export const offeringExpenseChartFormatter = ({
  offeringExpenses,
}: Options): OfferingExpenseDataResult[] => {
  const dataResult: OfferingExpenseDataResult[] = offeringExpenses?.reduce(
    (acc, offering) => {
      const existing = acc.find(
        (item) =>
          item?.subType ===
          OfferingExpenseSearchSubTypeNames[offering?.subType],
      );

      if (existing) {
        if (offering?.currency === CurrencyType?.PEN) {
          existing.accumulatedOfferingPEN += +offering.amount;
        } else if (offering.currency === CurrencyType.USD) {
          existing.accumulatedOfferingUSD += +offering.amount;
        } else if (offering.currency === CurrencyType.EUR) {
          existing.accumulatedOfferingEUR += +offering.amount;
        }

        existing.totalAmount += +offering.amount;

        existing.allOfferings.push({
          offering: +offering?.amount,
          currency: offering.currency,
          date: offering.date,
        });
      } else {
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
          allOfferings: [
            {
              offering: +offering?.amount,
              currency: offering?.currency,
              date: offering?.date,
            },
          ],
          totalAmount: +offering.amount,
        });
      }

      return acc;
    },
    [],
  );

  return dataResult;
};
