import { compareAsc, parse } from 'date-fns';

import { getInitialFullNames } from '@/common/helpers/get-initial-full-names.helper';
import { dateFormatterToDDMMYY } from '@/common/helpers/date-formatter-to-ddmmyyy.helper';

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

export interface OfferingIncomeBySundaySchoolDataResult {
  date: Date;
  category: string;
  dayPEN: number;
  afternoonPEN: number;
  dayUSD: number;
  afternoonUSD: number;
  dayEUR: number;
  afternoonEUR: number;
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
  church: Church;
  accumulatedOfferingPEN: number;
  accumulatedOfferingUSD: number;
  accumulatedOfferingEUR: number;
  allOfferings: Array<{
    offering: number;
    currency: string;
    date: Date;
  }>;
}

export const offeringIncomeBySundaySchoolFormatter = ({
  offeringIncome,
}: Options): OfferingIncomeBySundaySchoolDataResult[] => {
  const dataResult: OfferingIncomeBySundaySchoolDataResult[] =
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
        if (offering.shift === 'day') {
          if (offering.currency === CurrencyType.PEN)
            existingEntry.dayPEN += +offering.amount;
          if (offering.currency === CurrencyType.USD)
            existingEntry.dayUSD += +offering.amount;
          if (offering.currency === CurrencyType.EUR)
            existingEntry.dayEUR += +offering.amount;
        } else if (offering.shift === 'afternoon') {
          if (offering.currency === CurrencyType.PEN)
            existingEntry.afternoonPEN += +offering.amount;
          if (offering.currency === CurrencyType.USD)
            existingEntry.afternoonUSD += +offering.amount;
          if (offering.currency === CurrencyType.EUR)
            existingEntry.afternoonEUR += +offering.amount;
        }

        if (offering.category !== OfferingIncomeCreationCategory.OfferingBox) {
          if (offering.currency === CurrencyType.PEN)
            existingEntry.accumulatedOfferingPEN += +offering.amount;
          if (offering.currency === CurrencyType.USD)
            existingEntry.accumulatedOfferingUSD += +offering.amount;
          if (offering.currency === CurrencyType.EUR)
            existingEntry.accumulatedOfferingEUR += +offering.amount;
        }

        existingEntry.allOfferings.push({
          offering: +offering.amount,
          currency: offering.currency,
          date: offering.date,
        });
      } else {
        acc.push({
          date: offering.date,
          category: offering.category,
          dayPEN:
            offering.shift === 'day' && offering.currency === CurrencyType.PEN
              ? +offering.amount
              : 0,
          afternoonPEN:
            offering.shift === 'afternoon' &&
            offering.currency === CurrencyType.PEN
              ? +offering.amount
              : 0,
          dayUSD:
            offering.shift === 'day' && offering.currency === CurrencyType.USD
              ? +offering.amount
              : 0,
          afternoonUSD:
            offering.shift === 'afternoon' &&
            offering.currency === CurrencyType.USD
              ? +offering.amount
              : 0,
          dayEUR:
            offering.shift === 'day' && offering.currency === CurrencyType.EUR
              ? +offering.amount
              : 0,
          afternoonEUR:
            offering.shift === 'afternoon' &&
            offering.currency === CurrencyType.EUR
              ? +offering.amount
              : 0,
          accumulatedOfferingPEN:
            offering.category !== OfferingIncomeCreationCategory.OfferingBox &&
            offering.currency === CurrencyType.PEN
              ? +offering.amount
              : 0,
          accumulatedOfferingUSD:
            offering.category !== OfferingIncomeCreationCategory.OfferingBox &&
            offering.currency === CurrencyType.USD
              ? +offering.amount
              : 0,
          accumulatedOfferingEUR:
            offering.category !== OfferingIncomeCreationCategory.OfferingBox &&
            offering.currency === CurrencyType.EUR
              ? +offering.amount
              : 0,
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
          church: {
            isAnexe: offering?.church?.isAnexe,
            abbreviatedChurchName: offering?.church?.abbreviatedChurchName,
          },
          allOfferings:
            offering.category !== OfferingIncomeCreationCategory.OfferingBox
              ? [
                  {
                    offering: +offering.amount,
                    currency: offering.currency,
                    date: offering.date,
                  },
                ]
              : [],
        });
      }
      // console.log(acc);
      return acc;
    }, []);

  // Ordenar los resultados por fecha
  const resultSorted = dataResult.sort((a, b) => {
    const dateA = parse(dateFormatterToDDMMYY(a.date), 'dd/MM/yy', new Date());
    const dateB = parse(dateFormatterToDDMMYY(b.date), 'dd/MM/yy', new Date());
    return compareAsc(dateA, dateB);
  });

  // console.log(resultSorted);

  return resultSorted;
};
