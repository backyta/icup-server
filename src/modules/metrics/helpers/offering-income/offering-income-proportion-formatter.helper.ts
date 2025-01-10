import { RecordStatus } from '@/common/enums/record-status.enum';
import { OfferingIncome } from '@/modules/offering/income/entities/offering-income.entity';

interface Options {
  offeringIncome: OfferingIncome[];
}

interface OfferingIncomeProportionDataResult {
  totalOfferingIncomeRecordsCount: number;
  activeOfferingIncomeRecordsCount: number;
  inactiveOfferingIncomeRecordsCount: number;
}

export const offeringIncomeProportionFormatter = ({
  offeringIncome,
}: Options): OfferingIncomeProportionDataResult => {
  const totalOfferingIncomeRecordsCount = offeringIncome.length;

  const activeOfferingIncomeRecordsCount = offeringIncome.filter(
    (offering) => offering.recordStatus === RecordStatus.Active,
  ).length;

  const inactiveOfferingIncomeRecordsCount = offeringIncome.filter(
    (offering) => offering.recordStatus === RecordStatus.Inactive,
  ).length;

  return {
    totalOfferingIncomeRecordsCount,
    activeOfferingIncomeRecordsCount,
    inactiveOfferingIncomeRecordsCount,
  };
};
