import { compareAsc, parse } from 'date-fns';

import { dateFormatterToDDMMYY } from '@/common/helpers/date-formatter-to-ddmmyyy.helper';

import { CurrencyType } from '@/modules/offering/shared/enums/currency-type.enum';
import { OfferingIncome } from '@/modules/offering/income/entities/offering-income.entity';

interface Options {
  offeringIncome: OfferingIncome[];
}

interface DataResultOptions {
  date: Date;
  category: string;
  dayPEN: number;
  afternoonPEN: number;
  dayUSD: number;
  afternoonUSD: number;
  dayEUR: number;
  afternoonEUR: number;
  church: {
    isAnexe: boolean;
    abbreviatedChurchName: string;
  };
}

export const lastSundayOfferingsDataFormatter = ({
  offeringIncome,
}: Options) => {
  const dataResult: DataResultOptions[] = offeringIncome?.reduce<
    DataResultOptions[]
  >((acc, offering) => {
    const existing = acc.find((item) => item.date === offering.date);

    if (existing) {
      if (offering.shift === 'day' && offering.currency === CurrencyType.PEN) {
        existing.dayPEN += +offering.amount;
      } else if (
        offering.shift === 'day' &&
        offering.currency === CurrencyType.USD
      ) {
        existing.dayUSD += +offering.amount;
      } else if (
        offering.shift === 'day' &&
        offering.currency === CurrencyType.EUR
      ) {
        existing.dayEUR += +offering.amount;
      } else if (
        offering.shift === 'afternoon' &&
        offering.currency === CurrencyType.PEN
      ) {
        existing.afternoonPEN += +offering.amount;
      } else if (
        offering.shift === 'afternoon' &&
        offering.currency === CurrencyType.USD
      ) {
        existing.afternoonUSD += +offering.amount;
      } else if (
        offering.shift === 'afternoon' &&
        offering.currency === CurrencyType.EUR
      ) {
        existing.afternoonEUR += +offering.amount;
      }
    } else {
      acc.push({
        date: offering.date,
        category: offering?.category,
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
      });
    }

    return acc;
  }, []);

  const resultSorted = dataResult.sort((a, b) => {
    const dateA = parse(dateFormatterToDDMMYY(a.date), 'dd/MM/yy', new Date());
    const dateB = parse(dateFormatterToDDMMYY(b.date), 'dd/MM/yy', new Date());
    return compareAsc(dateA, dateB);
  });

  return resultSorted;
};
