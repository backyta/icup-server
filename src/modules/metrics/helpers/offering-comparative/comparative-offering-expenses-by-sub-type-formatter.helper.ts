import { CurrencyType } from '@/modules/offering/shared/enums/currency-type.enum';
import { OfferingExpense } from '@/modules/offering/expense/entities/offering-expense.entity';
import { OfferingExpenseSearchSubTypeNames } from '@/modules/offering/expense/enums/offering-expense-search-sub-type.enum';

interface Options {
  offeringExpenses: OfferingExpense[];
}

interface Church {
  isAnexe: boolean;
  abbreviatedChurchName: string;
}
export interface OfferingExpenseComparativeBySubTypeDataResult {
  subType: string;
  accumulatedOfferingPEN: number;
  accumulatedOfferingUSD: number;
  accumulatedOfferingEUR: number;
  church: Church;
  totalAmount: number;
}

export const ComparativeOfferingExpensesBySubTypeFormatter = ({
  offeringExpenses,
}: Options): OfferingExpenseComparativeBySubTypeDataResult[] => {
  const dataResult: OfferingExpenseComparativeBySubTypeDataResult[] =
    offeringExpenses?.reduce((acc, offering) => {
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
      } else {
        acc.push({
          subType: OfferingExpenseSearchSubTypeNames[offering?.subType],
          accumulatedOfferingPEN:
            offering?.currency === CurrencyType.PEN ? +offering?.amount : 0,
          accumulatedOfferingUSD:
            offering?.currency === CurrencyType.USD ? +offering?.amount : 0,
          accumulatedOfferingEUR:
            offering?.currency === CurrencyType.EUR ? +offering?.amount : 0,
          church: {
            isAnexe: offering?.church?.isAnexe,
            abbreviatedChurchName: offering?.church?.abbreviatedChurchName,
          },
          totalAmount: +offering.amount,
        });
      }

      return acc;
    }, []);

  return dataResult;
};
