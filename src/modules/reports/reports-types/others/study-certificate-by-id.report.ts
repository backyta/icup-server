import type { StyleDictionary, TDocumentDefinitions } from 'pdfmake/interfaces';

import { DateFormatter } from '@/modules/reports/helpers/date-formatter';
import { headerSection } from '@/modules/reports/sections/header.section';

interface ReportValues {
  directorName?: string;
  studentName: string;
  classSchedule?: string;
  hoursNumber?: number;
  studyStartDate?: Date | string;
  studyEndDate?: Date | string;
  city?: string;
}

const styles: StyleDictionary = {
  header: {
    fontSize: 22,
    bold: true,
    alignment: 'center',
    margin: [0, 15, 0, 20],
  },
  body: {
    alignment: 'justify',
    margin: [0, 0, 0, 70],
  },
  signature: {
    fontSize: 14,
    bold: true,
  },
  footer: {
    fontSize: 10,
    bold: true,
    alignment: 'center',
    margin: [0, 0, 0, 10],
  },
};

export const getStudyCertificateByIdReport = (
  values: ReportValues,
): TDocumentDefinitions => {
  const {
    directorName,
    studentName,
    classSchedule,
    hoursNumber,
    studyStartDate,
    studyEndDate,
  } = values;

  const docDefinition: TDocumentDefinitions = {
    styles: styles,
    pageMargins: [40, 70, 40, 60],

    header: headerSection({ showLogo: true, showDate: true }),
    content: [
      {
        text: `CONSTANCIA DE ESTUDIO`,
        style: 'header',
      },
      {
        text: `Yo, ${directorName}, en mi calidad de Director de la Escuela Bíblica ICUP (Iglesia Cristiana Unidos en Su Presencia), hago constar que ${studentName} ha completado satisfactoriamente el curso de "Apologética 1" en nuestra institución, el cual se desarrolló desde el ${studyStartDate} hasta el ${studyEndDate}. \n\n
        El Sr./Sra. ${studentName} ha demostrado dedicación, compromiso y un desempeño sobresaliente en el cumplimiento de las actividades y evaluaciones de dicho curso, de acuerdo con los estándares y valores que promovemos en la Escuela Bíblica ICUP.\n\n
        La formación académica y espiritual impartida en nuestra institución ha sido diseñada para fortalecer los conocimientos bíblicos y principios cristianos, y el Sr./Sra. ${studentName} ha cumplido con los requisitos de estudio de manera íntegra, asistiendo en un horario de ${classSchedule} hrs y completando ${hoursNumber} horas semanales.\n\n
        Esta constancia se expide a solicitud del interesado, para los fines que estime convenientes, en la ciudad de Lima, el día ${DateFormatter.getDDMMYYYY(new Date())}.`,
        style: 'body',
      },
      {
        text: `Atentamente \n\n`,
        style: {
          fontSize: 13,
          bold: true,
        },
      },
      {
        text: `Marcos Alberto Reyes Quispe\n`,
        style: {
          fontSize: 13,
          bold: true,
        },
      },
      {
        text: `Director de la Escuela Bíblica ICUP \n\n`,
        style: {
          fontSize: 12,
          italics: true,
          bold: true,
        },
      },
      {
        text: `Maritza Marta Sifuntes Suyon\n`,
        style: {
          fontSize: 13,
          bold: true,
        },
      },
      {
        text: `Subdirector de la Escuela Bíblica ICUP\n\n`,
        style: {
          fontSize: 12,
          italics: true,
          bold: true,
        },
      },
      {
        text: `Marcos Alberto Reyes Quispe\n`,
        style: {
          fontSize: 13,
          bold: true,
        },
      },
      {
        text: `Pastor de la Iglesia Cristiana Unidos en Su Presencia\n\n\n`,
        style: {
          fontSize: 12,
          italics: true,
          bold: true,
        },
      },
      {
        text: `Escuela Bíblica ICUP (Iglesia Cristiana Unidos en Su Presencia)`,
        style: {
          italics: true,
          fontSize: 13,
          bold: true,
        },
      },
    ],
    footer: {
      text: 'Este documento es una constancia de estudio y no representa un compromiso laboral.',
      style: 'footer',
    },
  };

  return docDefinition;
};
