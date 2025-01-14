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
          widths: [100, 'auto', '*', '*', '*', '*', 45, 45, 45],

          body: [
            [
              {
                text: 'Iglesia',
                style: {
                  bold: true,
                },
              },
              {
                text: 'Nombre',
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
                  color:'green',
                  bold: true,
                },
              },
              {
                text: 'G.Fam.',
                style: {
                  color:'blue',
                  bold: true,
                },
              },
              {
                text: 'Pred.',
                style: {
                  color:'purple',
                  bold: true,
                },
              },
            ],
            ...data.map((item) => [
              `${item?.theirChurch?.abbreviatedChurchName}`,
              item?.zoneName,
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
