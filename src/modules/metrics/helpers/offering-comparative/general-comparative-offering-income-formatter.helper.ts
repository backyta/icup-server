import { CurrencyType } from '@/modules/offering/shared/enums/currency-type.enum';

import { OfferingIncome } from '@/modules/offering/income/entities/offering-income.entity';

import { OfferingIncomeCreationTypeNames } from '@/modules/offering/income/enums/offering-income-creation-type.enum';
import { OfferingIncomeCreationSubTypeNames } from '@/modules/offering/income/enums/offering-income-creation-sub-type.enum';

interface Options {
  offeringIncome: OfferingIncome[];
}

interface Church {
  isAnexe: boolean;
  abbreviatedChurchName: string;
}
export interface GeneralOfferingIncomeComparativeDataResult {
  type: string;
  subType: string;
  accumulatedOfferingPEN: number;
  accumulatedOfferingUSD: number;
  accumulatedOfferingEUR: number;
  church: Church;
  totalAmount: number;
}

export const generalComparativeOfferingIncomeFormatter = ({
  offeringIncome,
}: Options): GeneralOfferingIncomeComparativeDataResult[] => {
  const dataResult: GeneralOfferingIncomeComparativeDataResult[] =
    offeringIncome?.reduce((acc, offering) => {
      const existing = acc.find((item) =>
        item.subType !== 'Ajuste por Ingreso'
          ? item?.type === OfferingIncomeCreationTypeNames[offering?.type] &&
            item?.subType ===
              OfferingIncomeCreationSubTypeNames[offering?.subType]
          : item?.type === OfferingIncomeCreationTypeNames[offering?.type],
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
          type: OfferingIncomeCreationTypeNames[offering?.type],
          subType:
            OfferingIncomeCreationSubTypeNames[offering.subType] ??
            'Ajuste por Ingreso',
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

  const sortedDataResult = dataResult.sort((a, b) => {
    if (a.type > b.type) return -1;
    if (a.type < b.type) return 1;

    if (a.subType < b.subType) return -1;
    if (a.subType > b.subType) return 1;

    return 0;
  });

  return sortedDataResult;
};
