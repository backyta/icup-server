import { addDays, format } from 'date-fns';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';

import { OfferingExpenseSearchTypeNames } from '@/modules/offering/expense/enums/offering-expense-search-type.enum';
import { OfferingExpenseSearchSubTypeNames } from '@/modules/offering/expense/enums/offering-expense-search-sub-type.enum';

import { OfferingExpense } from '@/modules/offering/expense/entities/offering-expense.entity';

import { headerSection } from '@/modules/reports/sections/header.section';
import { footerSection } from '@/modules/reports/sections/footer.section';

interface ReportOptions {
  title?: string;
  subTitle?: string;
  description: string;
  searchTerm?: string;
  searchType?: string;
  searchSubType?: string;
  orderSearch?: string;
  churchName?: string;
  data: OfferingExpense[];
}

export const getOfferingExpensesReport = (
  options: ReportOptions,
): TDocumentDefinitions => {
  const {
    title,
    subTitle,
    data,
    description,
    searchTerm,
    searchType,
    searchSubType,
    orderSearch,
    churchName,
  } = options;

  return {
    pageOrientation: 'landscape',
    header: headerSection({
      title: title,
      subTitle: subTitle,
      searchTerm: searchTerm,
      searchType: searchType,
      searchSubType: searchSubType,
      orderSearch: orderSearch,
      churchName: churchName,
    }),
    footer: footerSection,
    pageMargins: [20, 120, 20, 60],
    content: [
      {
        layout: 'customLayout01', // optional
        table: {
          headerRows: 1,
          widths: [130, 120, 55, 55, 70, 80, '*'],

          body: [
            [
              {
                text: 'Tipo',
                style: {
                  bold: true,
                },
              },
              {
                text: 'Sub-tipo',
                style: {
                  bold: true,
                },
              },
              {
                text: 'Monto',
                style: {
                  bold: true,
                },
              },
              {
                text: 'Divisa',
                style: {
                  bold: true,
                },
              },
              {
                text: 'F. de Gasto',
                style: {
                  bold: true,
                },
              },
              {
                text: 'Iglesia',
                style: {
                  bold: true,
                },
              },
              {
                text: 'Comentarios',
                style: {
                  bold: true,
                },
              },
            ],
            ...data.map((item) => [
              OfferingExpenseSearchTypeNames[item?.type],
              OfferingExpenseSearchSubTypeNames[item?.subType] ?? '-',
              item?.amount ?? '-',
              item?.currency ?? '-',
              format(new Date(addDays(item.date, 1)), 'dd/MM/yyyy'),
              `${item?.church?.abbreviatedChurchName ?? '-'}`,
              item?.comments ?? '-',
            ]),
            ['', '', '', '', '', '', ''],
            ['', '', '', '', '', '', ''],
          ],
        },
      },

      {
        layout: 'noBorders',
        table: {
          headerRows: 1,
          widths: [100, 'auto', 'auto', 'auto', 'auto', 'auto', '*'],
          body: [
            [
              {
                text: `Total de ${description}:`,
                colSpan: 2,
                fontSize: 13,
                bold: true,
                margin: [0, 10, 0, 0],
              },
              {},
              {
                text: `${data.length} ${description}.`,
                bold: true,
                fontSize: 13,
                colSpan: 1,
                margin: [-50, 10, 0, 0],
              },
              {},
              {},
              {},
              {},
            ],
          ],
        },
      },
    ],
  };
};
