import type { TDocumentDefinitions } from 'pdfmake/interfaces';

import { footerSection } from '@/modules/reports/sections/footer.section';
import { headerSection } from '@/modules/reports/sections/header.section';

import { Church } from '@/modules/church/entities/church.entity';
import { MetricSearchType } from '@/modules/metrics/enums/metrics-search-type.enum';
import { MonthlyMemberDataResult } from '@/modules/metrics/helpers/member/member-formatter-by-birth-month.helper';
import { MembersByCategoryDataResult } from '@/modules/metrics/helpers/member/member-formatter-by-category.helper';
import { MembersByZoneDataResult } from '@/modules/metrics/helpers/member/disciple-formatter-by-zone-and-gender.helper';
import { MonthlyMemberFluctuationDataResult } from '@/modules/metrics/helpers/member/member-fluctuation-formatter.helper';
import { PreachersByZoneDataResult } from '@/modules/metrics/helpers/member/preacher-formatter-by-zone-and-gender.helper';
import { MembersByRecordStatusDataResult } from '@/modules/metrics/helpers/member/member-formatter-by-record-status.helper';
import { MemberByRoleAndGenderDataResult } from '@/modules/metrics/helpers/member/member-formatter-by-role-and-gender.helper';
import { MembersByMaritalStatusDataResult } from '@/modules/metrics/helpers/member/member-formatter-by-marital-status.helper';
import { MembersByCategoryAndGenderDataResult } from '@/modules/metrics/helpers/member/member-formatter-by-category-and-gender.helper';
import { MembersByDistrictAndGenderDataResult } from '@/modules/metrics/helpers/member/member-formatter-by-district-and-gender.helper';

interface ReportOptions {
  title?: string;
  subTitle?: string;
  year: string;
  church: Church;
  metricsTypesArray: string[];
  membersByBirthMonthDataResult: MonthlyMemberDataResult[];
  membersByCategoryDataResult: MembersByCategoryDataResult;
  disciplesByZoneAndGenderDataResult: MembersByZoneDataResult;
  preachersByZoneAndGenderDataResult: PreachersByZoneDataResult;
  membersByRecordStatusDataResult: MembersByRecordStatusDataResult;
  membersByRoleAndGenderDataResult: MemberByRoleAndGenderDataResult;
  membersByMaritalStatusDataResult: MembersByMaritalStatusDataResult;
  membersFluctuationByYearDataResult: MonthlyMemberFluctuationDataResult[];
  membersByCategoryAndGenderDataResult: MembersByCategoryAndGenderDataResult;
  membersByDistrictAndGenderDataResult: MembersByDistrictAndGenderDataResult;
}

function calculatePercentage(part: number, total: number) {
  if (total === 0) return 0;
  return ((part / total) * 100).toFixed(1);
}

export const getMemberMetricsReport = (
  options: ReportOptions,
): TDocumentDefinitions => {
  const {
    title,
    subTitle,
    year,
    church,
    metricsTypesArray,
    membersByCategoryDataResult,
    membersByBirthMonthDataResult,
    membersByRecordStatusDataResult,
    membersByRoleAndGenderDataResult,
    disciplesByZoneAndGenderDataResult,
    membersByMaritalStatusDataResult,
    membersFluctuationByYearDataResult,
    preachersByZoneAndGenderDataResult,
    membersByCategoryAndGenderDataResult,
    membersByDistrictAndGenderDataResult,
  } = options;

  return {
    pageOrientation: 'landscape',
    header: headerSection({
      title: title,
      subTitle: subTitle,
      yearSearch: year,
      startMonthSearch: '',
    }),
    footer: footerSection,
    pageMargins: [20, 110, 20, 60],
    content: [
      //* MembersFluctuationByYear
      metricsTypesArray.includes(MetricSearchType.MembersFluctuationByYear)
        ? [
            // Table Title
            {
              layout: 'noBorders',
              table: {
                headerRows: 1,
                widths: ['*'],
                body: [
                  [
                    {
                      text: `Fluctuación de Miembros por Año`,
                      color: '#1d96d3',
                      fontSize: 20,
                      bold: true,
                      alignment: 'center',
                      margin: [0, -10, 0, 5],
                    },
                  ],
                ],
              },
            },

            // Table body (content)
            {
              pageBreak: 'after',
              layout: 'customLayout01', // optional
              table: {
                headerRows: 1,
                widths: ['*', '*', '*', '*', '*'],

                body: [
                  [
                    {
                      text: 'Iglesia',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Año',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Mes',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Miembros Nuevos',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Miembros Bajas',
                      style: {
                        bold: true,
                      },
                    },
                  ],
                  ...membersFluctuationByYearDataResult.map((item) => [
                    item?.church?.abbreviatedChurchName,
                    year,
                    item?.month,
                    item?.newMembers,
                    item?.inactiveMembers,
                  ]),
                  ['', '', '', '', ''],
                  ['', '', '', '', ''],
                  [
                    '',
                    '',
                    {
                      text: 'Totales',
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: 'red',
                        alignment: 'center',
                      },
                    },
                    {
                      text: `${membersFluctuationByYearDataResult.reduce((acc, item) => acc + item?.newMembers, 0)} miembros`,
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: '#475569',
                      },
                    },
                    {
                      text: `${membersFluctuationByYearDataResult.reduce((acc, item) => acc + item?.inactiveMembers, 0)} miembros`,
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: '#475569',
                      },
                    },
                  ],
                ],
              },
            },
          ]
        : null,

      //* MembersByBirthMonth
      metricsTypesArray.includes(MetricSearchType.MembersByBirthMonth)
        ? [
            // Table Title
            {
              layout: 'noBorders',
              table: {
                headerRows: 1,
                widths: ['*'],
                body: [
                  [
                    {
                      text: `Miembros por Mes de Nacimiento`,
                      color: '#1d96d3',
                      fontSize: 19,
                      bold: true,
                      alignment: 'center',
                      margin: [0, -10, 0, 5],
                    },
                  ],
                ],
              },
            },

            // Table body (content)
            {
              pageBreak: 'after',
              layout: 'customLayout01', // optional
              table: {
                headerRows: 1,
                widths: ['*', '*', '*', '*'],

                body: [
                  [
                    {
                      text: 'Iglesia',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Mes',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Número de Miembros',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Edad Promedio',
                      style: {
                        bold: true,
                      },
                    },
                  ],
                  ...membersByBirthMonthDataResult.map((item) => [
                    item?.church?.abbreviatedChurchName,
                    `${item?.month}`,
                    `${item?.membersCount} (${calculatePercentage(
                      item?.membersCount,
                      membersByBirthMonthDataResult.reduce(
                        (acc, item) => acc + item?.membersCount,
                        0,
                      ),
                    )}%)`,
                    `${item?.averageAge} años`,
                  ]),
                  ['', '', '', ''],
                  ['', '', '', ''],
                  [
                    '',
                    {
                      text: 'Totales',
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: 'red',
                        alignment: 'center',
                      },
                    },
                    {
                      text: `${membersByBirthMonthDataResult.reduce((acc, item) => acc + item?.membersCount, 0)} miembros`,
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: '#475569',
                      },
                    },
                    {
                      text: `${(membersByBirthMonthDataResult.reduce((acc, item) => acc + +item?.averageAge, 0) / membersByBirthMonthDataResult.length).toFixed(2)} años`,
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: '#475569',
                      },
                    },
                  ],
                ],
              },
            },
          ]
        : null,

      //* MembersByCategory
      metricsTypesArray.includes(MetricSearchType.MembersByCategory)
        ? [
            // Table Title
            {
              layout: 'noBorders',
              table: {
                headerRows: 1,
                widths: ['*'],
                body: [
                  [
                    {
                      text: `Miembros por Categoría`,
                      color: '#1d96d3',
                      fontSize: 19,
                      bold: true,
                      alignment: 'center',
                      margin: [0, -10, 0, 5],
                    },
                  ],
                ],
              },
            },

            // Table body (content)
            {
              pageBreak: 'after',
              layout: 'customLayout01', // optional
              table: {
                headerRows: 1,
                widths: ['*', '*', '*', '*'],

                body: [
                  [
                    {
                      text: 'Iglesia',
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
                      text: 'Rango de edad',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Número de Miembros',
                      style: {
                        bold: true,
                      },
                    },
                  ],
                  ...Object.entries(membersByCategoryDataResult).map(
                    ([key, value]) => [
                      church?.abbreviatedChurchName,
                      key === 'child'
                        ? `Niños`
                        : key === 'teenager'
                          ? `Adolescente`
                          : key === 'youth'
                            ? `Jóvenes`
                            : key === 'adult'
                              ? `Adultos`
                              : key === 'middleAged'
                                ? `Adulto Mayor`
                                : `Ancianos`,

                      key === 'child'
                        ? `0-12 años`
                        : key === 'teenager'
                          ? '13-17 años'
                          : key === 'youth'
                            ? '18-29 años'
                            : key === 'adult'
                              ? '30-59 años'
                              : key === 'middleAged'
                                ? '60-74 años'
                                : '+75 años',
                      `${value} (${calculatePercentage(
                        value,
                        Object.values(membersByCategoryDataResult).reduce(
                          (acc, item) => acc + item,
                          0,
                        ),
                      )}%)`,
                    ],
                  ),
                  ['', '', '', ''],
                  ['', '', '', ''],
                  [
                    '',
                    '',
                    {
                      text: 'Totales',
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: 'red',
                        alignment: 'center',
                      },
                    },
                    {
                      text: `${Object.values(membersByCategoryDataResult).reduce((acc, item) => acc + item, 0)} miembros`,
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: '#475569',
                      },
                    },
                  ],
                ],
              },
            },
          ]
        : null,

      //* MembersByCategoryAndGender
      metricsTypesArray.includes(MetricSearchType.MembersByCategoryAndGender)
        ? [
            // Table Title
            {
              layout: 'noBorders',
              table: {
                headerRows: 1,
                widths: ['*'],
                body: [
                  [
                    {
                      text: `Miembros por Categoría y Género`,
                      color: '#1d96d3',
                      fontSize: 19,
                      bold: true,
                      alignment: 'center',
                      margin: [0, -10, 0, 5],
                    },
                  ],
                ],
              },
            },

            // Table body (content)
            {
              pageBreak: 'after',
              layout: 'customLayout01', // optional
              table: {
                headerRows: 1,
                widths: ['*', '*', '*', '*', '*'],

                body: [
                  [
                    {
                      text: 'Iglesia',
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
                      text: 'Rango de edad',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Nro. Miembros Varones',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Nro. Miembros Mujeres',
                      style: {
                        bold: true,
                      },
                    },
                  ],
                  ...Object.entries(membersByCategoryAndGenderDataResult).map(
                    ([key, value]) => [
                      church?.abbreviatedChurchName,
                      key === 'child'
                        ? `Niños (${calculatePercentage(
                            value.men + value.women,
                            Object.values(
                              membersByCategoryAndGenderDataResult,
                            ).reduce(
                              (acc, item) => acc + item?.men + item?.women,
                              0,
                            ),
                          )}%)`
                        : key === 'teenager'
                          ? `Adolescentes (${calculatePercentage(
                              value.men + value.women,
                              Object.values(
                                membersByCategoryAndGenderDataResult,
                              ).reduce(
                                (acc, item) => acc + item?.men + item?.women,
                                0,
                              ),
                            )}%)`
                          : key === 'youth'
                            ? `Jóvenes (${calculatePercentage(
                                value.men + value.women,
                                Object.values(
                                  membersByCategoryAndGenderDataResult,
                                ).reduce(
                                  (acc, item) => acc + item?.men + item?.women,
                                  0,
                                ),
                              )}%)`
                            : key === 'adult'
                              ? `Adultos (${calculatePercentage(
                                  value.men + value.women,
                                  Object.values(
                                    membersByCategoryAndGenderDataResult,
                                  ).reduce(
                                    (acc, item) =>
                                      acc + item?.men + item?.women,
                                    0,
                                  ),
                                )}%)`
                              : key === 'middleAged'
                                ? `Adulto Mayor (${calculatePercentage(
                                    value.men + value.women,
                                    Object.values(
                                      membersByCategoryAndGenderDataResult,
                                    ).reduce(
                                      (acc, item) =>
                                        acc + item?.men + item?.women,
                                      0,
                                    ),
                                  )}%)`
                                : `Ancianos (${calculatePercentage(
                                    value.men + value.women,
                                    Object.values(
                                      membersByCategoryAndGenderDataResult,
                                    ).reduce(
                                      (acc, item) =>
                                        acc + item?.men + item?.women,
                                      0,
                                    ),
                                  )}%)`,

                      key === 'child'
                        ? `0-12 años`
                        : key === 'teenager'
                          ? '13-17 años'
                          : key === 'youth'
                            ? '18-29 años'
                            : key === 'adult'
                              ? '30-59 años'
                              : key === 'middleAged'
                                ? '60-74 años'
                                : '+75 años',

                      `${value?.men} (${calculatePercentage(
                        value.men,
                        value?.men + value?.women,
                      )}%)`,
                      `${value?.women} (${calculatePercentage(
                        value.women,
                        value?.men + value?.women,
                      )}%)`,
                    ],
                  ),
                  ['', '', '', '', ''],
                  ['', '', '', '', ''],
                  [
                    '',
                    '',
                    {
                      text: 'Totales',
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: 'red',
                        alignment: 'center',
                      },
                    },
                    {
                      text: `${Object.values(membersByCategoryAndGenderDataResult).reduce((acc, item) => acc + item?.men, 0)} varones (${calculatePercentage(
                        Object.values(
                          membersByCategoryAndGenderDataResult,
                        ).reduce((acc, item) => acc + item?.men, 0),
                        Object.values(
                          membersByCategoryAndGenderDataResult,
                        ).reduce(
                          (acc, item) => acc + item?.men + item.women,
                          0,
                        ),
                      )}%)`,
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: '#475569',
                      },
                    },
                    {
                      text: `${Object.values(membersByCategoryAndGenderDataResult).reduce((acc, item) => acc + item?.women, 0)} mujeres (${calculatePercentage(
                        Object.values(
                          membersByCategoryAndGenderDataResult,
                        ).reduce((acc, item) => acc + item?.women, 0),
                        Object.values(
                          membersByCategoryAndGenderDataResult,
                        ).reduce(
                          (acc, item) => acc + item?.men + item.women,
                          0,
                        ),
                      )}%)`,
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: '#475569',
                      },
                    },
                  ],
                ],
              },
            },
          ]
        : null,

      //* MembersByRoleAndGender
      metricsTypesArray.includes(MetricSearchType.MembersByRoleAndGender)
        ? [
            // Table Title
            {
              layout: 'noBorders',
              table: {
                headerRows: 1,
                widths: ['*'],
                body: [
                  [
                    {
                      text: `Miembros por Roles y Género`,
                      color: '#1d96d3',
                      fontSize: 19,
                      bold: true,
                      alignment: 'center',
                      margin: [0, -10, 0, 5],
                    },
                  ],
                ],
              },
            },

            // Table body (content)
            {
              pageBreak: 'after',
              layout: 'customLayout01', // optional
              table: {
                headerRows: 1,
                widths: ['*', '*', '*', '*'],

                body: [
                  [
                    {
                      text: 'Iglesia',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Roles',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Nro. Miembros Varones',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Nro. Miembros Mujeres',
                      style: {
                        bold: true,
                      },
                    },
                  ],
                  ...Object.entries(membersByRoleAndGenderDataResult).map(
                    ([key, value]) => [
                      value?.church?.abbreviatedChurchName,
                      key === 'pastor'
                        ? `Pastor (${calculatePercentage(
                            value.men + value.women,
                            Object.values(
                              membersByRoleAndGenderDataResult,
                            ).reduce(
                              (acc, item) => acc + item?.men + item?.women,
                              0,
                            ),
                          )}%)`
                        : key === 'copastor'
                          ? `Co-Pastor (${calculatePercentage(
                              value.men + value.women,
                              Object.values(
                                membersByRoleAndGenderDataResult,
                              ).reduce(
                                (acc, item) => acc + item?.men + item?.women,
                                0,
                              ),
                            )}%)`
                          : key === 'supervisor'
                            ? `Supervisor (${calculatePercentage(
                                value.men + value.women,
                                Object.values(
                                  membersByRoleAndGenderDataResult,
                                ).reduce(
                                  (acc, item) => acc + item?.men + item?.women,
                                  0,
                                ),
                              )}%)`
                            : key === 'preacher'
                              ? `Predicador (${calculatePercentage(
                                  value.men + value.women,
                                  Object.values(
                                    membersByRoleAndGenderDataResult,
                                  ).reduce(
                                    (acc, item) =>
                                      acc + item?.men + item?.women,
                                    0,
                                  ),
                                )}%)`
                              : `Discípulo (${calculatePercentage(
                                  value.men + value.women,
                                  Object.values(
                                    membersByRoleAndGenderDataResult,
                                  ).reduce(
                                    (acc, item) =>
                                      acc + item?.men + item?.women,
                                    0,
                                  ),
                                )}%)`,
                      `${value?.men} (${calculatePercentage(
                        value.men,
                        value?.men + value?.women,
                      )}%)`,
                      `${value?.women} (${calculatePercentage(
                        value.women,
                        value?.men + value?.women,
                      )}%)`,
                    ],
                  ),
                  ['', '', '', ''],
                  [
                    '',
                    {
                      text: 'Totales',
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: 'red',
                        alignment: 'center',
                      },
                    },
                    {
                      text: `${Object.values(membersByRoleAndGenderDataResult).reduce((acc, item) => acc + item?.men, 0)} varones (${calculatePercentage(
                        Object.values(membersByRoleAndGenderDataResult).reduce(
                          (acc, item) => acc + item?.men,
                          0,
                        ),
                        Object.values(membersByRoleAndGenderDataResult).reduce(
                          (acc, item) => acc + item?.men + item.women,
                          0,
                        ),
                      )}%)`,
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: '#475569',
                      },
                    },
                    {
                      text: `${Object.values(membersByRoleAndGenderDataResult).reduce((acc, item) => acc + item?.women, 0)} mujeres (${calculatePercentage(
                        Object.values(membersByRoleAndGenderDataResult).reduce(
                          (acc, item) => acc + item?.women,
                          0,
                        ),
                        Object.values(membersByRoleAndGenderDataResult).reduce(
                          (acc, item) => acc + item?.men + item.women,
                          0,
                        ),
                      )}%)`,
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: '#475569',
                      },
                    },
                  ],
                ],
              },
            },
          ]
        : null,

      //* MembersByMaritalStatus
      metricsTypesArray.includes(MetricSearchType.MembersByMaritalStatus)
        ? [
            // Table Title
            {
              layout: 'noBorders',
              table: {
                headerRows: 1,
                widths: ['*'],
                body: [
                  [
                    {
                      text: `Miembros por Estado Civil`,
                      color: '#1d96d3',
                      fontSize: 19,
                      bold: true,
                      alignment: 'center',
                      margin: [0, -10, 0, 5],
                    },
                  ],
                ],
              },
            },

            // Table body (content)
            {
              pageBreak: 'after',
              layout: 'customLayout01', // optional
              table: {
                headerRows: 1,
                widths: ['*', '*', '*'],

                body: [
                  [
                    {
                      text: 'Iglesia',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Estado Civil',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Número de Miembros',
                      style: {
                        bold: true,
                      },
                    },
                  ],
                  ...Object.entries(membersByMaritalStatusDataResult).map(
                    ([key, value]) => [
                      church.abbreviatedChurchName,
                      key === 'single'
                        ? `Soltero(a)`
                        : key === 'married'
                          ? `Casado(a)`
                          : key === 'divorced'
                            ? `Divorciado(a)`
                            : key === 'windowed'
                              ? `Viudo(a)`
                              : `Otro(a)`,
                      `${value} (${calculatePercentage(
                        value,
                        Object.values(membersByMaritalStatusDataResult).reduce(
                          (acc, item) => acc + item,
                          0,
                        ),
                      )}%)`,
                    ],
                  ),
                  ['', '', ''],
                  [
                    '',
                    {
                      text: 'Totales',
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: 'red',
                        alignment: 'center',
                      },
                    },
                    {
                      text: `${Object.values(membersByMaritalStatusDataResult).reduce((acc, item) => acc + item, 0)} miembros`,
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: '#475569',
                      },
                    },
                  ],
                ],
              },
            },
          ]
        : null,

      //* DisciplesByZoneAndGender
      metricsTypesArray.includes(MetricSearchType.DisciplesByZoneAndGender)
        ? [
            // Table Title
            {
              layout: 'noBorders',
              table: {
                headerRows: 1,
                widths: ['*'],
                body: [
                  [
                    {
                      text: `Discípulos por Zona y Género`,
                      color: '#1d96d3',
                      fontSize: 19,
                      bold: true,
                      alignment: 'center',
                      margin: [0, -10, 0, 5],
                    },
                  ],
                ],
              },
            },

            // Table body (content)
            {
              pageBreak: 'after',
              layout: 'customLayout01', // optional
              table: {
                headerRows: 1,
                widths: [100, '*', '*', 100, '*', '*'],

                body: [
                  [
                    {
                      text: 'Iglesia',
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
                      text: 'Zona',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Nro. D. Varones',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Nro. D. Mujeres',
                      style: {
                        bold: true,
                      },
                    },
                  ],
                  ...Object.entries(disciplesByZoneAndGenderDataResult).map(
                    ([key, value]) => [
                      value?.church?.abbreviatedChurchName,
                      value.copastor,
                      value.supervisor,
                      `${key} (${calculatePercentage(
                        value.men + value.women,
                        Object.values(
                          disciplesByZoneAndGenderDataResult,
                        ).reduce((acc, item) => acc + item.men + item.women, 0),
                      )}%)`,
                      `${value.men} (${calculatePercentage(
                        value.men,
                        value.men + value.women,
                      )}%)`,
                      `${value.women} (${calculatePercentage(
                        value.women,
                        value.men + value.women,
                      )}%)`,
                    ],
                  ),
                  ['', '', '', '', '', ''],
                  ['', '', '', '', '', ''],
                  [
                    '',
                    '',
                    '',
                    {
                      text: 'Totales',
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: 'red',
                        alignment: 'center',
                      },
                    },
                    {
                      text: `${Object.values(disciplesByZoneAndGenderDataResult).reduce((acc, item) => acc + item.men, 0)} varones (${calculatePercentage(
                        Object.values(
                          disciplesByZoneAndGenderDataResult,
                        ).reduce((acc, item) => acc + item?.men, 0),
                        Object.values(
                          disciplesByZoneAndGenderDataResult,
                        ).reduce(
                          (acc, item) => acc + item?.men + item.women,
                          0,
                        ),
                      )}%)`,
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: '#475569',
                      },
                    },
                    {
                      text: `${Object.values(disciplesByZoneAndGenderDataResult).reduce((acc, item) => acc + item.women, 0)} mujeres (${calculatePercentage(
                        Object.values(
                          disciplesByZoneAndGenderDataResult,
                        ).reduce((acc, item) => acc + item?.women, 0),
                        Object.values(
                          disciplesByZoneAndGenderDataResult,
                        ).reduce(
                          (acc, item) => acc + item?.men + item.women,
                          0,
                        ),
                      )}%)`,
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: '#475569',
                      },
                    },
                  ],
                ],
              },
            },
          ]
        : null,

      //* PreachersByZoneAndGender
      metricsTypesArray.includes(MetricSearchType.PreachersByZoneAndGender)
        ? [
            // Table Title
            {
              layout: 'noBorders',
              table: {
                headerRows: 1,
                widths: ['*'],
                body: [
                  [
                    {
                      text: `Predicadores por Zona y Género`,
                      color: '#1d96d3',
                      fontSize: 19,
                      bold: true,
                      alignment: 'center',
                      margin: [0, -10, 0, 5],
                    },
                  ],
                ],
              },
            },

            // Table body (content)
            {
              pageBreak: 'after',
              layout: 'customLayout01', // optional
              table: {
                headerRows: 1,
                widths: [100, '*', '*', 100, '*', '*'],

                body: [
                  [
                    {
                      text: 'Iglesia',
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
                      text: 'Zona',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Nro. P. Varones',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Nro. P. Mujeres',
                      style: {
                        bold: true,
                      },
                    },
                  ],
                  ...Object.entries(preachersByZoneAndGenderDataResult).map(
                    ([key, value]) => [
                      value?.church?.abbreviatedChurchName,
                      value.copastor,
                      value.supervisor,
                      `${key} (${calculatePercentage(
                        value.men + value.women,
                        Object.values(
                          preachersByZoneAndGenderDataResult,
                        ).reduce((acc, item) => acc + item.men + item.women, 0),
                      )}%)`,
                      `${value.men} (${calculatePercentage(
                        value.men,
                        value.men + value.women,
                      )}%)`,
                      `${value.women} (${calculatePercentage(
                        value.women,
                        value.men + value.women,
                      )}%)`,
                    ],
                  ),
                  ['', '', '', '', '', ''],
                  ['', '', '', '', '', ''],
                  [
                    '',
                    '',
                    '',
                    {
                      text: 'Totales',
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: 'red',
                        alignment: 'center',
                      },
                    },
                    {
                      text: `${Object.values(preachersByZoneAndGenderDataResult).reduce((acc, item) => acc + item.men, 0)} varones (${calculatePercentage(
                        Object.values(
                          preachersByZoneAndGenderDataResult,
                        ).reduce((acc, item) => acc + item?.men, 0),
                        Object.values(
                          preachersByZoneAndGenderDataResult,
                        ).reduce(
                          (acc, item) => acc + item?.men + item.women,
                          0,
                        ),
                      )}%)`,
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: '#475569',
                      },
                    },
                    {
                      text: `${Object.values(preachersByZoneAndGenderDataResult).reduce((acc, item) => acc + item.women, 0)} mujeres (${calculatePercentage(
                        Object.values(
                          preachersByZoneAndGenderDataResult,
                        ).reduce((acc, item) => acc + item?.women, 0),
                        Object.values(
                          preachersByZoneAndGenderDataResult,
                        ).reduce(
                          (acc, item) => acc + item?.men + item.women,
                          0,
                        ),
                      )}%)`,
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: '#475569',
                      },
                    },
                  ],
                ],
              },
            },
          ]
        : null,

      //* MembersByDistrictAndGender
      metricsTypesArray.includes(MetricSearchType.MembersByDistrictAndGender)
        ? [
            // Table Title
            {
              layout: 'noBorders',
              table: {
                headerRows: 1,
                widths: ['*'],
                body: [
                  [
                    {
                      text: `Miembros por Distrito y Género`,
                      color: '#1d96d3',
                      fontSize: 19,
                      bold: true,
                      alignment: 'center',
                      margin: [0, -10, 0, 5],
                    },
                  ],
                ],
              },
            },

            // Table body (content)
            {
              pageBreak: 'after',
              layout: 'customLayout01', // optional
              table: {
                headerRows: 1,
                widths: ['*', '*', '*', '*', '*'],

                body: [
                  [
                    {
                      text: 'Iglesia',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Distrito',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Sector Urbano',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Nro. Miembros Varones',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Nro. Miembros Mujeres',
                      style: {
                        bold: true,
                      },
                    },
                  ],
                  ...Object.entries(membersByDistrictAndGenderDataResult).map(
                    ([key, value]) => [
                      value?.church?.abbreviatedChurchName,
                      value?.district,
                      `${key} (${calculatePercentage(
                        value.men + value.women,
                        Object.values(
                          membersByDistrictAndGenderDataResult,
                        ).reduce(
                          (acc, item) => acc + item?.men + item?.women,
                          0,
                        ),
                      )}%)`,
                      `${value?.men} (${calculatePercentage(
                        value.men,
                        value?.men + value?.women,
                      )}%)`,
                      `${value?.women} (${calculatePercentage(
                        value.women,
                        value?.men + value?.women,
                      )}%)`,
                    ],
                  ),
                  ['', '', '', '', ''],
                  ['', '', '', '', ''],
                  [
                    '',
                    '',
                    {
                      text: 'Totales',
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: 'red',
                        alignment: 'center',
                      },
                    },
                    {
                      text: `${Object.values(membersByDistrictAndGenderDataResult).reduce((acc, item) => acc + item?.men, 0)} varones (${calculatePercentage(
                        Object.values(
                          membersByDistrictAndGenderDataResult,
                        ).reduce((acc, item) => acc + item?.men, 0),
                        Object.values(
                          membersByDistrictAndGenderDataResult,
                        ).reduce(
                          (acc, item) => acc + item?.men + item.women,
                          0,
                        ),
                      )}%)`,
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: '#475569',
                      },
                    },
                    {
                      text: `${Object.values(membersByDistrictAndGenderDataResult).reduce((acc, item) => acc + item?.women, 0)} mujeres (${calculatePercentage(
                        Object.values(
                          membersByDistrictAndGenderDataResult,
                        ).reduce((acc, item) => acc + item?.women, 0),
                        Object.values(
                          membersByDistrictAndGenderDataResult,
                        ).reduce(
                          (acc, item) => acc + item?.men + item.women,
                          0,
                        ),
                      )}%)`,
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: '#475569',
                      },
                    },
                  ],
                ],
              },
            },
          ]
        : null,

      //* MembersByRecordStatus
      metricsTypesArray.includes(MetricSearchType.MembersByRecordStatus)
        ? [
            // Table Title
            {
              layout: 'noBorders',
              table: {
                headerRows: 1,
                widths: ['*'],
                body: [
                  [
                    {
                      text: `Miembros por Estado de Registro`,
                      color: '#1d96d3',
                      fontSize: 19,
                      bold: true,
                      alignment: 'center',
                      margin: [0, -10, 0, 5],
                    },
                  ],
                ],
              },
            },

            // Table body (content)
            {
              pageBreak: 'after',
              layout: 'customLayout01', // optional
              table: {
                headerRows: 1,
                widths: ['*', '*', '*', '*'],

                body: [
                  [
                    {
                      text: 'Iglesia',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Roles',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Nro. Miembros Activos',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Nro. Miembros Inactivos',
                      style: {
                        bold: true,
                      },
                    },
                  ],
                  ...Object.entries(membersByRecordStatusDataResult).map(
                    ([key, value]) => [
                      value?.church?.abbreviatedChurchName,
                      key === 'pastor'
                        ? `Pastor (${calculatePercentage(
                            value.active + value.inactive,
                            Object.values(
                              membersByRecordStatusDataResult,
                            ).reduce(
                              (acc, item) =>
                                acc + item?.active + item?.inactive,
                              0,
                            ),
                          )}%)`
                        : key === 'copastor'
                          ? `Co-Pastor (${calculatePercentage(
                              value.active + value.inactive,
                              Object.values(
                                membersByRecordStatusDataResult,
                              ).reduce(
                                (acc, item) =>
                                  acc + item?.active + item?.inactive,
                                0,
                              ),
                            )}%)`
                          : key === 'supervisor'
                            ? `Supervisor (${calculatePercentage(
                                value.active + value.inactive,
                                Object.values(
                                  membersByRecordStatusDataResult,
                                ).reduce(
                                  (acc, item) =>
                                    acc + item?.active + item?.inactive,
                                  0,
                                ),
                              )}%)`
                            : key === 'preacher'
                              ? `Predicador (${calculatePercentage(
                                  value.active + value.inactive,
                                  Object.values(
                                    membersByRecordStatusDataResult,
                                  ).reduce(
                                    (acc, item) =>
                                      acc + item?.active + item?.inactive,
                                    0,
                                  ),
                                )}%)`
                              : `Discípulo (${calculatePercentage(
                                  value.active + value.inactive,
                                  Object.values(
                                    membersByRecordStatusDataResult,
                                  ).reduce(
                                    (acc, item) =>
                                      acc + item?.active + item?.inactive,
                                    0,
                                  ),
                                )}%)`,
                      `${value?.active} (${calculatePercentage(
                        value.active,
                        value?.active + value?.inactive,
                      )}%)`,
                      `${value?.inactive} (${calculatePercentage(
                        value.inactive,
                        value?.active + value?.inactive,
                      )}%)`,
                    ],
                  ),
                  ['', '', '', ''],
                  [
                    '',
                    {
                      text: 'Totales',
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: 'red',
                        alignment: 'center',
                      },
                    },
                    {
                      text: `${Object.values(membersByRecordStatusDataResult).reduce((acc, item) => acc + item?.active, 0)} varones (${calculatePercentage(
                        Object.values(membersByRecordStatusDataResult).reduce(
                          (acc, item) => acc + item?.active,
                          0,
                        ),
                        Object.values(membersByRecordStatusDataResult).reduce(
                          (acc, item) => acc + item?.active + item.inactive,
                          0,
                        ),
                      )}%)`,
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: '#475569',
                      },
                    },
                    {
                      text: `${Object.values(membersByRecordStatusDataResult).reduce((acc, item) => acc + item?.inactive, 0)} mujeres (${calculatePercentage(
                        Object.values(membersByRecordStatusDataResult).reduce(
                          (acc, item) => acc + item?.inactive,
                          0,
                        ),
                        Object.values(membersByRecordStatusDataResult).reduce(
                          (acc, item) => acc + item?.active + item.inactive,
                          0,
                        ),
                      )}%)`,
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: '#475569',
                      },
                    },
                  ],
                ],
              },
            },
          ]
        : null,
    ],
  };
};
