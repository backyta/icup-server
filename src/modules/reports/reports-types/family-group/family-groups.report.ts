import type { TDocumentDefinitions } from 'pdfmake/interfaces';

import { footerSection } from '@/modules/reports/sections/footer.section';
import { headerSection } from '@/modules/reports/sections/header.section';

import { FamilyGroupServiceTimeNames } from '@/modules/family-group/enums/family-group-service-time.enum';

interface ReportOptions {
  title?: string;
  subTitle?: string;
  description: string;
  searchTerm?: string;
  searchType?: string;
  searchSubType?: string;
  orderSearch?: string;
  churchName?: string;
  data: any;
}

export const getFamilyGroupsReport = (
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
          widths: [80, '*', '*', 75, 60, '*', '*'],

          body: [
            [
              {
                text: 'Iglesia',
                style: {
                  bold: true,
                },
              },
              {
                text: 'Supervisor / Zona',
                style: {
                  bold: true,
                },
              },
              {
                text: 'Predicador',
                style: {
                  bold: true,
                },
              },
              {
                text: 'Nom. / Cód.',
                style: {
                  bold: true,
                },
              },
              {
                text: 'H.C / C.M',
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
                text: 'Dirección',
                style: {
                  bold: true,
                },
              },
            ],
            ...data.map((item: any) => [
              `${item?.theirChurch?.abbreviatedChurchName}`,
              `${item?.theirSupervisor?.firstNames} ${item?.theirSupervisor?.lastNames}\nZona: ${item?.theirZone?.zoneName}`,
              `${item?.theirPreacher?.firstNames} ${item?.theirPreacher?.lastNames}`,
              `${item?.familyGroupName}\n(${item?.familyGroupCode})`,
              `${FamilyGroupServiceTimeNames[item?.serviceTime]}\nMbs.: ${item?.disciples.length}`,
              `${item?.province}-${item?.district}-${item?.urbanSector}`,
              `${item?.address} (${item?.referenceAddress})`,
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
          widths: [90, '*', '*', 75, '*', '*', '*'],
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
            ],
          ],
        },
      },
    ],
  };
};
