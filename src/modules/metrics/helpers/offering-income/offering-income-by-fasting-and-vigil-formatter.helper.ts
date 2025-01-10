import { getInitialFullNames } from '@/common/helpers/get-initial-full-names.helper';

import { CurrencyType } from '@/modules/offering/shared/enums/currency-type.enum';

import { OfferingIncome } from '@/modules/offering/income/entities/offering-income.entity';
import { OfferingIncomeCreationSubType } from '@/modules/offering/income/enums/offering-income-creation-sub-type.enum';

interface Options {
  offeringIncome: OfferingIncome[];
}

interface Church {
  isAnexe: boolean;
  abbreviatedChurchName: string;
}

interface Zone {
  id: string;
  zoneName: string;
  district: string;
  disciples: number;
}

interface Copastor {
  id: string;
  firstNames: string;
  lastNames: string;
}

interface Supervisor {
  id: string;
  firstNames: string;
  lastNames: string;
}

export interface OfferingIncomeByFastingAndVigilDataResult {
  type: string;
  date: Date;
  category: string;
  accumulatedOfferingPEN: number;
  accumulatedOfferingUSD: number;
  accumulatedOfferingEUR: number;
  copastor: Copastor | null;
  supervisor: Supervisor | null;
  zone?: Zone | null;
  church: Church;
  allOfferings: {
    offering: number;
    currency: string;
    date: Date;
  }[];
}

export const offeringIncomeByFastingAndVigilFormatter = ({
  offeringIncome,
}: Options): OfferingIncomeByFastingAndVigilDataResult[] => {
  const dataResult: OfferingIncomeByFastingAndVigilDataResult[] =
    offeringIncome?.reduce((acc, offering) => {
      const existing = acc.find(
        (item) => item.date === offering.date && item.type === offering.subType,
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
          offering: +offering?.amount,
          currency: offering?.currency,
          date: offering?.date,
        });
      } else {
        acc.push({
          date: offering?.date,
          category: offering.category,
          type: offering?.subType as OfferingIncomeCreationSubType,
          accumulatedOfferingPEN:
            offering.currency === CurrencyType.PEN ? +offering.amount : 0,
          accumulatedOfferingUSD:
            offering.currency === CurrencyType.USD ? +offering.amount : 0,
          accumulatedOfferingEUR:
            offering.currency === CurrencyType.EUR ? +offering.amount : 0,
          zone: {
            id: offering?.zone?.id,
            zoneName: offering?.zone?.zoneName,
            district: offering?.zone?.district,
            disciples: offering?.zone?.disciples?.length,
          },
          copastor: {
            id: offering?.zone?.theirCopastor?.id,
            firstNames: getInitialFullNames({
              firstNames:
                offering?.zone?.theirCopastor?.member?.firstNames ?? '',
              lastNames: '',
            }),
            lastNames: offering?.zone?.theirCopastor?.member?.lastNames,
          },
          supervisor: {
            id: offering?.zone?.theirSupervisor?.id,
            firstNames: getInitialFullNames({
              firstNames:
                offering?.zone?.theirSupervisor?.member?.firstNames ?? '',
              lastNames: '',
            }),
            lastNames: offering?.zone?.theirSupervisor?.member?.lastNames,
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

  return dataResult.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
};
