import type { TDocumentDefinitions } from 'pdfmake/interfaces';

import { headerSection } from '@/modules/reports/sections/header.section';
import { footerSection } from '@/modules/reports/sections/footer.section';

import { formatDateToLimaDayMonthYear } from '@/common/helpers/format-date-to-lima';

import { MetricSearchType } from '@/modules/metrics/enums/metrics-search-type.enum';

import { OfferingExpenseDataResult } from '@/modules/metrics/helpers/offering-expense/offering-expense-chart-formatter.helper';
import { OfferingExpensesAdjustmentDataResult } from '@/modules/metrics/helpers/offering-expense/offering-expenses-adjustment-formatter.helper';

interface ReportOptions {
  title?: string;
  subTitle?: string;
  year: string;
  startMonth: string;
  endMonth: string;
  metricsTypesArray: string[];
  operationalOfferingExpensesDataResult: OfferingExpenseDataResult[];
  maintenanceAndRepairOfferingExpensesDataResult: OfferingExpenseDataResult[];
  decorationOfferingExpensesDataResult: OfferingExpenseDataResult[];
  equipmentAndTechnologyOfferingExpensesDataResult: OfferingExpenseDataResult[];
  suppliesOfferingExpensesDataResult: OfferingExpenseDataResult[];
  planingEventsOfferingExpensesDataResult: OfferingExpenseDataResult[];
  othersOfferingExpensesDataResult: OfferingExpenseDataResult[];
  offeringExpensesAdjustmentsDataResult: OfferingExpensesAdjustmentDataResult[];
}

export const getOfferingExpensesMetricsReport = (
  options: ReportOptions,
): TDocumentDefinitions => {
  const {
    title,
    subTitle,
    year,
    startMonth,
    endMonth,
    metricsTypesArray,
    operationalOfferingExpensesDataResult,
    maintenanceAndRepairOfferingExpensesDataResult,
    decorationOfferingExpensesDataResult,
    equipmentAndTechnologyOfferingExpensesDataResult,
    suppliesOfferingExpensesDataResult,
    planingEventsOfferingExpensesDataResult,
    othersOfferingExpensesDataResult,
    offeringExpensesAdjustmentsDataResult,
  } = options;

  return {
    pageOrientation: 'landscape',
    header: headerSection({
      title: title,
      subTitle: subTitle,
      yearSearch: year,
      startMonthSearch: startMonth,
      endMonthSearch: endMonth,
    }),
    footer: footerSection,
    pageMargins: [20, 110, 20, 60],
    content: [
      //* OperationalOfferingExpenses
      metricsTypesArray.includes(MetricSearchType.OperationalOfferingExpenses)
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
                      text: `Gastos de Ofrenda Operativos`,
                      color: '#1d96d3',
                      fontSize: 20,
                      bold: true,
                      alignment: 'center',
                      margin: [0, -10, 0, 0],
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
                widths: [80, 70, 100, '*', 80, 80, 80],
                body: [
                  [
                    {
                      text: 'Iglesia',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Fecha',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Sub-Tipo',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Detalles',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Total (PEN)',
                      style: {
                        color: 'blue',
                        bold: true,
                      },
                    },
                    {
                      text: 'Total (USD)',
                      style: {
                        color: 'purple',
                        bold: true,
                      },
                    },
                    {
                      text: 'Total (EUR)',
                      style: {
                        color: 'green',
                        bold: true,
                      },
                    },
                  ],
                  ...operationalOfferingExpensesDataResult?.map((expense) => [
                    expense?.church?.abbreviatedChurchName,
                    formatDateToLimaDayMonthYear(expense?.date),
                    expense.subType,
                    expense.comments,
                    expense.accumulatedOfferingPEN.toFixed(2),
                    expense.accumulatedOfferingUSD.toFixed(2),
                    expense.accumulatedOfferingEUR.toFixed(2),
                  ]),
                  ['', '', '', '', '', '', ''],
                  ['', '', '', '', '', '', ''],
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
                        alignment: 'right',
                      },
                    },
                    {
                      text: `${operationalOfferingExpensesDataResult.reduce((acc, offering) => acc + offering?.accumulatedOfferingPEN, 0).toFixed(2)} PEN`,
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: '#475569',
                      },
                    },
                    {
                      text: `${operationalOfferingExpensesDataResult.reduce((acc, offering) => acc + offering?.accumulatedOfferingUSD, 0).toFixed(2)} USD`,
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: '#475569',
                      },
                    },
                    {
                      text: `${operationalOfferingExpensesDataResult.reduce((acc, offering) => acc + offering?.accumulatedOfferingEUR, 0).toFixed(2)} EUR`,
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

      //* MaintenanceAndRepairOfferingExpenses
      metricsTypesArray.includes(
        MetricSearchType.MaintenanceAndRepairOfferingExpenses,
      )
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
                      text: `Gastos de Ofrenda de Mantenimiento y Reparación`,
                      color: '#1d96d3',
                      fontSize: 20,
                      bold: true,
                      alignment: 'center',
                      margin: [0, -10, 0, 0],
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
                widths: [80, 70, 100, '*', 80, 80, 80],
                body: [
                  [
                    {
                      text: 'Iglesia',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Fecha',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Sub-Tipo',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Detalles',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Total (PEN)',
                      style: {
                        color: 'blue',
                        bold: true,
                      },
                    },
                    {
                      text: 'Total (USD)',
                      style: {
                        color: 'purple',
                        bold: true,
                      },
                    },
                    {
                      text: 'Total (EUR)',
                      style: {
                        color: 'green',
                        bold: true,
                      },
                    },
                  ],
                  ...maintenanceAndRepairOfferingExpensesDataResult.map(
                    (expense) => [
                      expense?.church?.abbreviatedChurchName,
                      formatDateToLimaDayMonthYear(expense?.date),
                      expense.subType,
                      expense.comments,
                      expense.accumulatedOfferingPEN.toFixed(2),
                      expense.accumulatedOfferingUSD.toFixed(2),
                      expense.accumulatedOfferingEUR.toFixed(2),
                    ],
                  ),
                  ['', '', '', '', '', '', ''],
                  ['', '', '', '', '', '', ''],
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
                        alignment: 'right',
                      },
                    },
                    {
                      text: `${maintenanceAndRepairOfferingExpensesDataResult.reduce((acc, offering) => acc + offering?.accumulatedOfferingPEN, 0).toFixed(2)} PEN`,
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: '#475569',
                      },
                    },
                    {
                      text: `${maintenanceAndRepairOfferingExpensesDataResult.reduce((acc, offering) => acc + offering?.accumulatedOfferingUSD, 0).toFixed(2)} USD`,
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: '#475569',
                      },
                    },
                    {
                      text: `${maintenanceAndRepairOfferingExpensesDataResult.reduce((acc, offering) => acc + offering?.accumulatedOfferingEUR, 0).toFixed(2)} EUR`,
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

      //* DecorationOfferingExpenses
      metricsTypesArray.includes(MetricSearchType.DecorationOfferingExpenses)
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
                      text: `Gastos de Ofrenda de Decoración`,
                      color: '#1d96d3',
                      fontSize: 20,
                      bold: true,
                      alignment: 'center',
                      margin: [0, -10, 0, 0],
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
                widths: [80, 70, 100, '*', 80, 80, 80],
                body: [
                  [
                    {
                      text: 'Iglesia',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Fecha',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Sub-Tipo',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Detalles',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Total (PEN)',
                      style: {
                        color: 'blue',
                        bold: true,
                      },
                    },
                    {
                      text: 'Total (USD)',
                      style: {
                        color: 'purple',
                        bold: true,
                      },
                    },
                    {
                      text: 'Total (EUR)',
                      style: {
                        color: 'green',
                        bold: true,
                      },
                    },
                  ],
                  ...decorationOfferingExpensesDataResult.map((expense) => [
                    expense?.church?.abbreviatedChurchName,
                    formatDateToLimaDayMonthYear(expense?.date),
                    expense.subType,
                    expense.comments,
                    expense.accumulatedOfferingPEN.toFixed(2),
                    expense.accumulatedOfferingUSD.toFixed(2),
                    expense.accumulatedOfferingEUR.toFixed(2),
                  ]),
                  ['', '', '', '', '', '', ''],
                  ['', '', '', '', '', '', ''],
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
                        alignment: 'right',
                      },
                    },
                    {
                      text: `${decorationOfferingExpensesDataResult.reduce((acc, offering) => acc + offering?.accumulatedOfferingPEN, 0).toFixed(2)} PEN`,
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: '#475569',
                      },
                    },
                    {
                      text: `${decorationOfferingExpensesDataResult.reduce((acc, offering) => acc + offering?.accumulatedOfferingUSD, 0).toFixed(2)} USD`,
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: '#475569',
                      },
                    },
                    {
                      text: `${decorationOfferingExpensesDataResult.reduce((acc, offering) => acc + offering?.accumulatedOfferingEUR, 0).toFixed(2)} EUR`,
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

      //* EquipmentAndTechnologyOfferingExpenses
      metricsTypesArray.includes(
        MetricSearchType.EquipmentAndTechnologyOfferingExpenses,
      )
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
                      text: `Gastos de Ofrenda de Equipamiento y Tecnología`,
                      color: '#1d96d3',
                      fontSize: 20,
                      bold: true,
                      alignment: 'center',
                      margin: [0, -10, 0, 0],
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
                widths: [80, 70, 100, '*', 80, 80, 80],
                body: [
                  [
                    {
                      text: 'Iglesia',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Fecha',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Sub-Tipo',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Detalles',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Total (PEN)',
                      style: {
                        color: 'blue',
                        bold: true,
                      },
                    },
                    {
                      text: 'Total (USD)',
                      style: {
                        color: 'purple',
                        bold: true,
                      },
                    },
                    {
                      text: 'Total (EUR)',
                      style: {
                        color: 'green',
                        bold: true,
                      },
                    },
                  ],
                  ...equipmentAndTechnologyOfferingExpensesDataResult.map(
                    (expense) => [
                      expense?.church?.abbreviatedChurchName,
                      formatDateToLimaDayMonthYear(expense?.date),
                      expense.subType,
                      expense.comments,
                      expense.accumulatedOfferingPEN.toFixed(2),
                      expense.accumulatedOfferingUSD.toFixed(2),
                      expense.accumulatedOfferingEUR.toFixed(2),
                    ],
                  ),
                  ['', '', '', '', '', '', ''],
                  ['', '', '', '', '', '', ''],
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
                        alignment: 'right',
                      },
                    },
                    {
                      text: `${equipmentAndTechnologyOfferingExpensesDataResult.reduce((acc, offering) => acc + offering?.accumulatedOfferingPEN, 0).toFixed(2)} PEN`,
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: '#475569',
                      },
                    },
                    {
                      text: `${equipmentAndTechnologyOfferingExpensesDataResult.reduce((acc, offering) => acc + offering?.accumulatedOfferingUSD, 0).toFixed(2)} USD`,
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: '#475569',
                      },
                    },
                    {
                      text: `${equipmentAndTechnologyOfferingExpensesDataResult.reduce((acc, offering) => acc + offering?.accumulatedOfferingEUR, 0).toFixed(2)} EUR`,
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

      //* SuppliesOfferingExpenses
      metricsTypesArray.includes(MetricSearchType.SuppliesOfferingExpenses)
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
                      text: `Gastos de Ofrenda de Suministros`,
                      color: '#1d96d3',
                      fontSize: 20,
                      bold: true,
                      alignment: 'center',
                      margin: [0, -10, 0, 0],
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
                widths: [80, 70, 100, '*', 80, 80, 80],
                body: [
                  [
                    {
                      text: 'Iglesia',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Fecha',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Sub-Tipo',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Detalles',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Total (PEN)',
                      style: {
                        color: 'blue',
                        bold: true,
                      },
                    },
                    {
                      text: 'Total (USD)',
                      style: {
                        color: 'purple',
                        bold: true,
                      },
                    },
                    {
                      text: 'Total Acu. (EUR)',
                      style: {
                        color: 'green',
                        bold: true,
                      },
                    },
                  ],
                  ...suppliesOfferingExpensesDataResult.map((expense) => [
                    expense?.church?.abbreviatedChurchName,
                    formatDateToLimaDayMonthYear(expense?.date),
                    expense.subType,
                    expense.comments,
                    expense.accumulatedOfferingPEN.toFixed(2),
                    expense.accumulatedOfferingUSD.toFixed(2),
                    expense.accumulatedOfferingEUR.toFixed(2),
                  ]),
                  ['', '', '', '', '', '', ''],
                  ['', '', '', '', '', '', ''],
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
                        alignment: 'right',
                      },
                    },
                    {
                      text: `${suppliesOfferingExpensesDataResult.reduce((acc, offering) => acc + offering?.accumulatedOfferingPEN, 0).toFixed(2)} PEN`,
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: '#475569',
                      },
                    },
                    {
                      text: `${suppliesOfferingExpensesDataResult.reduce((acc, offering) => acc + offering?.accumulatedOfferingUSD, 0).toFixed(2)} USD`,
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: '#475569',
                      },
                    },
                    {
                      text: `${suppliesOfferingExpensesDataResult.reduce((acc, offering) => acc + offering?.accumulatedOfferingEUR, 0).toFixed(2)} EUR`,
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

      //* PlaningEventsOfferingExpenses
      metricsTypesArray.includes(MetricSearchType.PlaningEventsOfferingExpenses)
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
                      text: `Gastos de Ofrenda de Suministros`,
                      color: '#1d96d3',
                      fontSize: 20,
                      bold: true,
                      alignment: 'center',
                      margin: [0, -10, 0, 0],
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
                widths: [80, 70, 100, '*', 80, 80, 80],
                body: [
                  [
                    {
                      text: 'Iglesia',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Fecha',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Sub-Tipo',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Detalles',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Total (PEN)',
                      style: {
                        color: 'blue',
                        bold: true,
                      },
                    },
                    {
                      text: 'Total (USD)',
                      style: {
                        color: 'purple',
                        bold: true,
                      },
                    },
                    {
                      text: 'Total (EUR)',
                      style: {
                        color: 'green',
                        bold: true,
                      },
                    },
                  ],
                  ...planingEventsOfferingExpensesDataResult.map((expense) => [
                    expense?.church?.abbreviatedChurchName,
                    formatDateToLimaDayMonthYear(expense?.date),
                    expense.subType,
                    expense.comments,
                    expense.accumulatedOfferingPEN.toFixed(2),
                    expense.accumulatedOfferingUSD.toFixed(2),
                    expense.accumulatedOfferingEUR.toFixed(2),
                  ]),
                  ['', '', '', '', '', '', ''],
                  ['', '', '', '', '', '', ''],
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
                        alignment: 'right',
                      },
                    },
                    {
                      text: `${planingEventsOfferingExpensesDataResult.reduce((acc, offering) => acc + offering?.accumulatedOfferingPEN, 0).toFixed(2)} PEN`,
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: '#475569',
                      },
                    },
                    {
                      text: `${planingEventsOfferingExpensesDataResult.reduce((acc, offering) => acc + offering?.accumulatedOfferingUSD, 0).toFixed(2)} USD`,
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: '#475569',
                      },
                    },
                    {
                      text: `${planingEventsOfferingExpensesDataResult.reduce((acc, offering) => acc + offering?.accumulatedOfferingEUR, 0).toFixed(2)} EUR`,
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

      //* \OthersExpenses
      metricsTypesArray.includes(MetricSearchType.OtherOfferingExpenses)
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
                      text: `Otros Gastos de Ofrenda`,
                      color: '#1d96d3',
                      fontSize: 20,
                      bold: true,
                      alignment: 'center',
                      margin: [0, -10, 0, 0],
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
                widths: [80, 70, 100, '*', 80, 80, 80],
                body: [
                  [
                    {
                      text: 'Iglesia',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Fecha',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Sub-Tipo',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Detalles',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Total (PEN)',
                      style: {
                        color: 'blue',
                        bold: true,
                      },
                    },
                    {
                      text: 'Total (USD)',
                      style: {
                        color: 'purple',
                        bold: true,
                      },
                    },
                    {
                      text: 'Total (EUR)',
                      style: {
                        color: 'green',
                        bold: true,
                      },
                    },
                  ],
                  ...othersOfferingExpensesDataResult.map((expense) => [
                    expense?.church?.abbreviatedChurchName,
                    formatDateToLimaDayMonthYear(expense?.date),
                    expense.subType,
                    expense.comments,
                    expense.accumulatedOfferingPEN.toFixed(2),
                    expense.accumulatedOfferingUSD.toFixed(2),
                    expense.accumulatedOfferingEUR.toFixed(2),
                  ]),
                  ['', '', '', '', '', '', ''],
                  ['', '', '', '', '', '', ''],
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
                        alignment: 'right',
                      },
                    },
                    {
                      text: `${othersOfferingExpensesDataResult.reduce((acc, offering) => acc + offering?.accumulatedOfferingPEN, 0).toFixed(2)} PEN`,
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: '#475569',
                      },
                    },
                    {
                      text: `${othersOfferingExpensesDataResult.reduce((acc, offering) => acc + offering?.accumulatedOfferingUSD, 0).toFixed(2)} USD`,
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: '#475569',
                      },
                    },
                    {
                      text: `${othersOfferingExpensesDataResult.reduce((acc, offering) => acc + offering?.accumulatedOfferingEUR, 0).toFixed(2)} EUR`,
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

      //* OfferingExpensesAdjustment
      metricsTypesArray.includes(MetricSearchType.OfferingExpensesAdjustment)
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
                      text: `Ajustes de Ofrenda (Salida)`,
                      color: '#1d96d3',
                      fontSize: 20,
                      bold: true,
                      alignment: 'center',
                      margin: [0, -10, 0, 0],
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
                widths: [100, 100, '*', 100, 100, 100],
                body: [
                  [
                    {
                      text: 'Iglesia',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Fecha',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Detalles',
                      style: {
                        bold: true,
                      },
                    },
                    {
                      text: 'Total (PEN)',
                      style: {
                        color: 'blue',
                        bold: true,
                      },
                    },
                    {
                      text: 'Total (USD)',
                      style: {
                        color: 'purple',
                        bold: true,
                      },
                    },
                    {
                      text: 'Total (EUR)',
                      style: {
                        color: 'green',
                        bold: true,
                      },
                    },
                  ],
                  ...offeringExpensesAdjustmentsDataResult.map((expense) => [
                    expense?.church?.abbreviatedChurchName,
                    formatDateToLimaDayMonthYear(expense?.date),
                    expense.comments,
                    `${expense.accumulatedOfferingPEN.toFixed(2)} PEN`,
                    `${expense.accumulatedOfferingUSD.toFixed(2)} USD`,
                    `${expense.accumulatedOfferingEUR.toFixed(2)} EUR`,
                  ]),
                  ['', '', '', '', '', ''],
                  ['', '', '', '', '', ''],
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
                        alignment: 'right',
                      },
                    },
                    {
                      text: `${offeringExpensesAdjustmentsDataResult.reduce((acc, offering) => acc + offering?.accumulatedOfferingPEN, 0).toFixed(2)} PEN`,
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: '#475569',
                      },
                    },
                    {
                      text: `${offeringExpensesAdjustmentsDataResult.reduce((acc, offering) => acc + offering?.accumulatedOfferingUSD, 0).toFixed(2)} USD`,
                      style: {
                        bold: true,
                        fontSize: 13,
                        italics: true,
                        color: '#475569',
                      },
                    },
                    {
                      text: `${offeringExpensesAdjustmentsDataResult.reduce((acc, offering) => acc + offering?.accumulatedOfferingEUR, 0).toFixed(2)} EUR`,
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
