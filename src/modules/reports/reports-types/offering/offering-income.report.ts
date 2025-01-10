import { addDays, format } from 'date-fns';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';

import { footerSection } from '@/modules/reports/sections/footer.section';
import { headerSection } from '@/modules/reports/sections/header.section';

import {
  MemberType,
  MemberTypeNames,
} from '@/modules/offering/income/enums/member-type.enum';
import { OfferingIncomeCreationTypeNames } from '@/modules/offering/income/enums/offering-income-creation-type.enum';
import { OfferingIncomeCreationCategoryNames } from '@/modules/offering/income/enums/offering-income-creation-category.enum';
import { OfferingIncomeCreationSubTypeNames } from '@/modules/offering/income/enums/offering-income-creation-sub-type.enum';
import { OfferingIncomeCreationShiftTypeNames } from '@/modules/offering/income/enums/offering-income-creation-shift-type.enum';

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

export const getOfferingIncomeReport = (
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
          widths: [100, 60, 50, 60, 65, 75, 60, 60, '*'],

          body: [
            [
              {
                text: 'Tipo y sub-tipo',
                style: {
                  bold: true,
                },
              },
              {
                text: 'Categoría',
                style: {
                  bold: true,
                },
              },
              {
                text: 'Turno',
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
                text: 'F. Deposito',
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
                text: 'G. Familiar',
                style: {
                  bold: true,
                },
              },
              {
                text: 'Zona',
                style: {
                  bold: true,
                },
              },
              {
                text: 'Miembro (Tipo y Datos)',
                style: {
                  bold: true,
                },
              },
            ],
            ...data.map((item) => [
              item?.subType
                ? `${OfferingIncomeCreationTypeNames[item?.type]} - ${OfferingIncomeCreationSubTypeNames[item?.subType] ?? ''}`
                : `${OfferingIncomeCreationTypeNames[item?.type]} `,
              OfferingIncomeCreationCategoryNames[item?.category] ?? '-',
              OfferingIncomeCreationShiftTypeNames[item?.shift] ?? '-',
              `${item?.amount} ${item?.currency}`,
              format(new Date(addDays(item.date, 1)), 'dd/MM/yyyy'),
              `${item?.church?.abbreviatedChurchName ?? '-'}`,
              `${item?.familyGroup?.familyGroupCode ?? '-'}`,
              `${item?.zone?.zoneName ?? '-'}`,
              `${MemberTypeNames[item?.memberType] ?? '-'}
              ${
                item?.memberType === MemberType.Pastor
                  ? `${item?.pastor?.firstNames} ${item?.pastor?.lastNames}`
                  : item?.memberType === MemberType.Copastor
                    ? `${item?.copastor?.firstNames} ${item?.copastor?.lastNames}`
                    : item?.memberType === MemberType.Supervisor
                      ? `${item?.supervisor?.firstNames} ${item?.supervisor?.lastNames}`
                      : item?.memberType === MemberType.Preacher
                        ? `${item?.preacher?.firstNames} ${item?.preacher?.lastNames}`
                        : item?.memberType === MemberType.Disciple
                          ? `${item?.disciple?.firstNames} ${item?.disciple?.lastNames}`
                          : item?.memberType === MemberType.ExternalDonor
                            ? `${item?.externalDonor?.firstNames} ${item?.externalDonor?.lastNames}`
                            : '-'
              }`,
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
            100,
            'auto',
            'auto',
            'auto',
            'auto',
            'auto',
            'auto',
            'auto',
            '*',
          ],
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
              {},
              {},
            ],
          ],
        },
      },
    ],
  };
};
