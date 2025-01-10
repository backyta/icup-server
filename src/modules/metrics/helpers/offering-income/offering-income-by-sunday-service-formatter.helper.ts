import { compareAsc, parse } from 'date-fns';

import { dateFormatterToDDMMYY } from '@/common/helpers/date-formatter-to-ddmmyyy.helper';

import { CurrencyType } from '@/modules/offering/shared/enums/currency-type.enum';
import { OfferingIncome } from '@/modules/offering/income/entities/offering-income.entity';

interface Options {
  offeringIncome: OfferingIncome[];
}

interface Church {
  isAnexe: boolean;
  abbreviatedChurchName: string;
}

export interface OfferingIncomeBySundayServiceDataResult {
  date: Date;
  category: string;
  dayPEN: number;
  afternoonPEN: number;
  dayUSD: number;
  afternoonUSD: number;
  dayEUR: number;
  afternoonEUR: number;
  church: Church;
}

export const offeringIncomeBySundayServiceFormatter = ({
  offeringIncome,
}: Options): OfferingIncomeBySundayServiceDataResult[] => {
  const dataResult: OfferingIncomeBySundayServiceDataResult[] =
    offeringIncome.reduce((acc, offering) => {
      const existingEntry = acc.find((item) => item.date === offering.date);

      const updateValues = (entry: OfferingIncomeBySundayServiceDataResult) => {
        const isDayShift = offering.shift === 'day';
        switch (offering.currency) {
          case CurrencyType.PEN:
            isDayShift
              ? (entry.dayPEN += +offering.amount)
              : (entry.afternoonPEN += +offering.amount);
            break;
          case CurrencyType.USD:
            isDayShift
              ? (entry.dayUSD += +offering.amount)
              : (entry.afternoonUSD += +offering.amount);
            break;
          case CurrencyType.EUR:
            isDayShift
              ? (entry.dayEUR += +offering.amount)
              : (entry.afternoonEUR += +offering.amount);
            break;
        }
      };

      if (existingEntry) {
        updateValues(existingEntry);
      } else {
        const newEntry: OfferingIncomeBySundayServiceDataResult = {
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
          church: {
            isAnexe: offering?.church?.isAnexe,
            abbreviatedChurchName: offering?.church?.abbreviatedChurchName,
          },
        };
        acc.push(newEntry);
      }

      return acc;
    }, []);

  return dataResult.sort((a, b) => {
    const dateA = parse(dateFormatterToDDMMYY(a.date), 'dd/MM/yy', new Date());
    const dateB = parse(dateFormatterToDDMMYY(b.date), 'dd/MM/yy', new Date());
    return compareAsc(dateA, dateB);
  });
};
