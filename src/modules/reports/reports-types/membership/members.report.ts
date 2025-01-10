import { addDays, format } from 'date-fns';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';

import { MaritalStatusNames } from '@/common/enums/marital-status.enum';

import { Pastor } from '@/modules/pastor/entities/pastor.entity';
import { Copastor } from '@/modules/copastor/entities/copastor.entity';
import { Disciple } from '@/modules/disciple/entities/disciple.entity';
import { Preacher } from '@/modules/preacher/entities/preacher.entity';
import { Supervisor } from '@/modules/supervisor/entities/supervisor.entity';

import { footerSection } from '@/modules/reports/sections/footer.section';
import { headerSection } from '@/modules/reports/sections/header.section';

type MemberOptions = Pastor | Copastor | Supervisor | Preacher | Disciple;
type DataOptions =
  | Pastor[]
  | Copastor[]
  | Supervisor[]
  | Preacher[]
  | Disciple[];

interface ReportOptions {
  title?: string;
  subTitle?: string;
  description: string;
  searchTerm?: string;
  searchType?: string;
  searchSubType?: string;
  orderSearch?: string;
  churchName?: string;
  data: DataOptions;
}

export const getMembersReport = (
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
          widths: [100, 75, 30, 75, 80, 85, 100, '*'],

          body: [
            [
              {
                text: 'Nom. y Apellidos',
                style: {
                  bold: true,
                },
              },
              {
                text: 'F. Nacimiento',
                style: {
                  bold: true,
                },
              },
              {
                text: 'Edad',
                style: {
                  bold: true,
                },
              },
              {
                text: 'E. Civil',
                style: {
                  bold: true,
                },
              },
              {
                text: 'F. Conversion',
                style: {
                  bold: true,
                },
              },
              {
                text: 'N. Teléfono',
                style: {
                  bold: true,
                },
              },
              {
                text: 'Distrito (S.U)',
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
            ...data.map((item: MemberOptions) => [
              `${item?.member?.firstNames} ${item?.member?.lastNames}`,

              format(
                new Date(addDays(item?.member?.birthDate, 1)),
                'dd/MM/yyyy',
              ),
              item?.member?.age,
              MaritalStatusNames[item.member.maritalStatus],
              format(
                new Date(addDays(item.member.conversionDate, 1)),
                'dd/MM/yyyy',
              ),
              item.member.phoneNumber ?? '-',
              `${item?.member?.residenceDistrict} - ${item?.member?.residenceUrbanSector}`,
              `${item?.member?.residenceAddress} (${item?.member?.referenceAddress})`,
            ]),
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
          ],
        },
      },

      {
        layout: 'noBorders',
        table: {
          headerRows: 1,
          widths: [115, 75, 'auto', 'auto', 75, 'auto', 'auto', 'auto'],
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
            ],
          ],
        },
      },
    ],
  };
};
