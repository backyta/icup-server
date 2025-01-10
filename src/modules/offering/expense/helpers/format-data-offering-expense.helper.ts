import { OfferingExpense } from '@/modules/offering/expense/entities/offering-expense.entity';

interface Options {
  offeringExpenses: OfferingExpense[];
}

export const formatDataOfferingExpense = ({ offeringExpenses }: Options) => {
  return offeringExpenses.map((offering) => ({
    ...offering,
    church: {
      id: offering.church?.id,
      churchName: offering.church?.churchName,
      abbreviatedChurchName: offering.church?.abbreviatedChurchName,
      district: offering.church?.district,
      urbanSector: offering.church?.urbanSector,
    },
  }));
};
