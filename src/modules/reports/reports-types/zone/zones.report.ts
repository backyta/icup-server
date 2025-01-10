import type { TDocumentDefinitions } from 'pdfmake/interfaces';

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
  data: any[];
}

export const getZonesReport = (
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
          widths: [80, 60, '*', '*', '*', 85, 50, 50, 50],

          body: [
            [
              {
                text: 'Nombre',
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
                text: 'Pastor',
                style: {
                  bold: true,
                },
              },
              {
                text: 'Co-Pastor',
                style: {
                  bold: true,
                },
              },
              {
                text: 'Supervisor',
                style: {
                  bold: true,
                },
              },
              {
                text: 'Ubicación',
                style: {
                  bold: true,
                },
              },
              {
                text: 'Disc.',
                style: {
                  bold: true,
                },
              },
              {
                text: 'G. Fam.',
                style: {
                  bold: true,
                },
              },
              {
                text: 'Pred.',
                style: {
                  bold: true,
                },
              },
            ],
            ...data.map((item) => [
              item?.zoneName,
              `${item?.theirChurch?.abbreviatedChurchName}`,
              `${item?.theirPastor?.firstNames} ${item?.theirPastor?.lastNames}`,
              `${item?.theirCopastor?.firstNames} ${item?.theirCopastor?.lastNames}`,
              `${item?.theirSupervisor?.firstNames} ${item?.theirSupervisor?.lastNames}`,
              `${item?.country}-${item?.department}-${item?.province}-${item?.district}`,
              item?.disciples.length,
              item?.familyGroups.length,
              item?.preachers.length,
            ]),
            ['', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', ''],
          ],
        },
      },

      {
        layout: 'noBorders',
        table: {
          headerRows: 1,
          widths: [
            'auto',
            'auto',
            'auto',
            50,
            'auto',
            'auto',
            'auto',
            'auto',
            'auto',
          ],
          body: [
            [
              {
                text: `Total de ${description}:`,
                colSpan: 1,
                fontSize: 13,
                bold: true,
                margin: [0, 10, 0, 0],
              },
              {
                text: `${data.length} ${description}.`,
                bold: true,
                fontSize: 13,
                colSpan: 2,
                margin: [0, 10, 0, 0],
              },
              {},
              {},
              {},
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
