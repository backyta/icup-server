import { CurrencyType } from '@/modules/offering/shared/enums/currency-type.enum';
import { OfferingIncome } from '@/modules/offering/income/entities/offering-income.entity';

interface DataResultOptions {
  date: string | Date;
  category: string;
  accumulatedOfferingPEN: number;
  accumulatedOfferingUSD: number;
  accumulatedOfferingEUR: number;
  familyGroup: {
    id: string;
    familyGroupName: string;
    familyGroupCode: string;
    disciples: number;
  };
  preacher: {
    id: string;
    firstNames: string;
    lastNames: string;
  };
  church: {
    isAnexe: boolean;
    abbreviatedChurchName: string;
  };
  allOfferings: {
    offering: number;
    currency: string;
    date: Date;
  }[];
}

interface Options {
  offeringIncome: OfferingIncome[];
}

export const topOfferingsFamilyGroupsDataFormatter = ({
  offeringIncome,
}: Options) => {
  const dataResult: DataResultOptions[] = offeringIncome?.reduce<
    DataResultOptions[]
  >((acc, offering) => {
    const existing = acc.find(
      (item) => item.familyGroup?.id === offering.familyGroup?.id,
    );

    if (existing) {
      if (offering.currency === CurrencyType.PEN) {
        existing.accumulatedOfferingPEN += +offering.amount;
      } else if (offering.currency === CurrencyType.USD) {
        existing.accumulatedOfferingUSD += +offering.amount;
      } else if (offering.currency === CurrencyType.EUR) {
        existing.accumulatedOfferingEUR += +offering.amount;
      }

      existing.allOfferings.push({
        offering: +offering.amount,
        currency: offering.currency,
        date: offering.date,
      });
    } else {
      acc.push({
        date: offering.date,
        category: offering.category,
        accumulatedOfferingPEN:
          offering.currency === CurrencyType.PEN ? +offering.amount : 0,
        accumulatedOfferingUSD:
          offering.currency === CurrencyType.USD ? +offering.amount : 0,
        accumulatedOfferingEUR:
          offering.currency === CurrencyType.EUR ? +offering.amount : 0,
        familyGroup: {
          id: offering?.familyGroup?.id,
          familyGroupName: offering?.familyGroup?.familyGroupName,
          familyGroupCode: offering?.familyGroup?.familyGroupCode,
          disciples: offering?.familyGroup?.disciples?.length,
        },
        preacher: {
          id: offering?.familyGroup?.theirPreacher?.id,
          firstNames: offering?.familyGroup?.theirPreacher?.member?.firstNames,
          lastNames: offering?.familyGroup?.theirPreacher?.member?.lastNames,
        },
        church: {
          isAnexe: offering?.church?.isAnexe,
          abbreviatedChurchName: offering?.church?.abbreviatedChurchName,
        },
        allOfferings: [
          {
            offering: +offering?.amount,
            currency: offering?.currency,
            date: offering?.date,
          },
        ],
      });
    }

    return acc;
  }, []);

  const top10DataResult = dataResult
    .sort(
      (a, b) =>
        b.accumulatedOfferingPEN +
        b.accumulatedOfferingUSD +
        b.accumulatedOfferingEUR -
        (a.accumulatedOfferingPEN +
          a.accumulatedOfferingUSD +
          a.accumulatedOfferingEUR),
    )
    .slice(0, 10);

  return top10DataResult;
};
