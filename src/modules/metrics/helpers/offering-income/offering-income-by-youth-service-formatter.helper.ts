import { getInitialFullNames } from '@/common/helpers/get-initial-full-names.helper';

import { CurrencyType } from '@/modules/offering/shared/enums/currency-type.enum';
import { OfferingIncome } from '@/modules/offering/income/entities/offering-income.entity';
import { OfferingIncomeCreationCategory } from '@/modules/offering/income/enums/offering-income-creation-category.enum';

interface Options {
  offeringIncome: OfferingIncome[];
}

interface Church {
  isAnexe: boolean;
  abbreviatedChurchName: string;
}

export interface OfferingIncomeByYouthServiceDataResult {
  date: Date;
  category: string;
  accumulatedOfferingPEN: number;
  accumulatedOfferingUSD: number;
  accumulatedOfferingEUR: number;
  church: Church;
  internalDonor: {
    memberType: string | null;
    memberId: string | null;
    memberFullName: string | null;
  };
  externalDonor: {
    donorId: string | null;
    donorFullName: string | null;
    sendingCountry: string | null;
  };
  allOfferings: Array<{
    offering: number;
    currency: string;
    date: Date;
  }>;
}

export const offeringIncomeByYouthServiceFormatter = ({
  offeringIncome,
}: Options): OfferingIncomeByYouthServiceDataResult[] => {
  const dataResult: OfferingIncomeByYouthServiceDataResult[] =
    offeringIncome?.reduce((acc, offering) => {
      const existingEntry = acc.find((item) => {
        if (
          offering.category === OfferingIncomeCreationCategory.InternalDonation
        ) {
          return (
            item.date === offering.date &&
            item.category === offering.category &&
            (item?.internalDonor?.memberId === offering?.pastor?.id ||
              item?.internalDonor?.memberId === offering?.copastor?.id ||
              item?.internalDonor?.memberId === offering?.supervisor?.id ||
              item?.internalDonor?.memberId === offering?.preacher?.id ||
              item?.internalDonor?.memberId === offering?.disciple?.id)
          );
        }

        if (
          offering.category === OfferingIncomeCreationCategory.ExternalDonation
        ) {
          return (
            item.date === offering.date &&
            item.category === offering.category &&
            item.externalDonor?.donorId === offering?.externalDonor?.id
          );
        }

        if (
          offering.category ===
          OfferingIncomeCreationCategory.FundraisingProMinistry
        ) {
          return (
            item.date === offering.date && item.category === offering.category
          );
        }

        return (
          item.date === offering.date && item.category === offering.category
        );
      });

      if (existingEntry) {
        if (offering.currency === CurrencyType.PEN) {
          existingEntry.accumulatedOfferingPEN += +offering.amount;
        } else if (offering.currency === CurrencyType.USD) {
          existingEntry.accumulatedOfferingUSD += +offering.amount;
        } else if (offering.currency === CurrencyType.EUR) {
          existingEntry.accumulatedOfferingEUR += +offering.amount;
        }
        existingEntry.allOfferings.push({
          offering: +offering?.amount,
          currency: offering?.currency,
          date: offering?.date,
        });
      } else {
        acc.push({
          date: offering?.date,
          category: offering?.category,
          accumulatedOfferingPEN:
            offering.currency === CurrencyType.PEN ? +offering.amount : 0,
          accumulatedOfferingUSD:
            offering.currency === CurrencyType.USD ? +offering.amount : 0,
          accumulatedOfferingEUR:
            offering.currency === CurrencyType.EUR ? +offering.amount : 0,
          church: {
            isAnexe: offering?.church?.isAnexe,
            abbreviatedChurchName: offering?.church?.abbreviatedChurchName,
          },
          internalDonor: {
            memberType:
              offering.category ===
              OfferingIncomeCreationCategory.InternalDonation
                ? offering.memberType
                : null,
            memberFullName: offering?.pastor
              ? `${getInitialFullNames({ firstNames: offering?.pastor?.member?.firstNames ?? '', lastNames: '' })} ${offering?.pastor?.member?.lastNames}`
              : offering?.copastor
                ? `${getInitialFullNames({ firstNames: offering?.copastor?.member?.firstNames ?? '', lastNames: '' })} ${offering?.copastor?.member?.lastNames}`
                : offering?.supervisor
                  ? `${getInitialFullNames({ firstNames: offering?.supervisor?.member?.firstNames ?? '', lastNames: '' })} ${offering?.supervisor?.member?.lastNames}`
                  : offering?.preacher
                    ? `${getInitialFullNames({ firstNames: offering?.preacher?.member?.firstNames ?? '', lastNames: '' })} ${offering?.preacher?.member?.lastNames}`
                    : offering?.disciple
                      ? `${getInitialFullNames({ firstNames: offering?.disciple?.member?.firstNames ?? '', lastNames: '' })} ${offering?.disciple?.member?.lastNames}`
                      : null,
            memberId: offering?.pastor
              ? offering?.pastor?.id
              : offering?.copastor
                ? offering?.copastor?.id
                : offering?.supervisor
                  ? offering?.supervisor?.id
                  : offering?.preacher
                    ? offering?.preacher?.id
                    : offering?.disciple
                      ? offering?.disciple?.id
                      : null,
          },
          externalDonor: {
            donorFullName: offering?.externalDonor
              ? `${getInitialFullNames({ firstNames: offering?.externalDonor?.firstNames ?? '', lastNames: '' })} ${offering?.externalDonor?.lastNames}`
              : null,
            donorId: offering?.externalDonor?.id ?? null,
            sendingCountry:
              offering?.externalDonor?.residenceCity ?? 'País anónimo',
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
