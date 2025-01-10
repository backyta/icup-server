import type { StyleDictionary, TDocumentDefinitions } from 'pdfmake/interfaces';
import { headerSection } from '@/modules/reports/sections/header.section';

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

// For independent form in frontend, generate certificate whit data form
export const getStudyCertificateReport = (): TDocumentDefinitions => {
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
        text: `Yo, [Nombre del Director], en mi calidad de Director de la Escuela Bíblica ICUP (Iglesia Cristiana Unidos en Su Presencia), hago constar que [Nombre del Estudiante] ha completado satisfactoriamente el curso de [Nombre del Curso o Grado] en nuestra institución, el cual se desarrolló desde el [Fecha de Inicio del Curso] hasta el [Fecha de Fin del Curso]. \n\n
        El Sr./Sra. [Nombre del Estudiante] ha demostrado dedicación, compromiso y un desempeño sobresaliente en el cumplimiento de las actividades y evaluaciones de dicho curso, de acuerdo con los estándares y valores que promovemos en la Escuela Bíblica ICUP.\n\n
        La formación académica y espiritual impartida en nuestra institución ha sido diseñada para fortalecer los conocimientos bíblicos y principios cristianos, y el Sr./Sra. [Nombre del Estudiante] ha cumplido con los requisitos de estudio de manera íntegra, asistiendo en un horario de [Horario de Clases] y completando [Número de Horas] horas semanales.\n\n
        Esta constancia se expide a solicitud del interesado, para los fines que estime convenientes, en la ciudad de [Ciudad], el día [Fecha de Emisión].`,
        style: 'body',
      },
      {
        text: `Atentamente`,
        style: 'signature',
      },
      {
        text: `[Nombre del Director]
        Director de la Escuela Bíblica ICUP`,
        style: 'signature',
      },
      {
        text: `[Nombre del Subdirector]
        Subdirector de la Escuela Bíblica ICUP`,
        style: 'signature',
      },
      {
        text: `[Nombre del Pastor]
        Pastor de la Iglesia Cristiana Unidos en Su Presencia`,
        style: 'signature',
      },
      {
        text: `[Fecha de Emisión]`,
        style: 'signature',
      },
      {
        text: `Escuela Bíblica ICUP (Iglesia Cristiana Unidos en Su Presencia)`,
        style: 'signature',
      },
    ],
    footer: {
      text: 'Este documento es una constancia de estudio y no representa un compromiso laboral.',
      style: 'footer',
    },
  };

  return docDefinition;
};
