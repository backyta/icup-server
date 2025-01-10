import { Pastor } from '@/modules/pastor/entities/pastor.entity';
import { Copastor } from '@/modules/copastor/entities/copastor.entity';
import { Disciple } from '@/modules/disciple/entities/disciple.entity';
import { Preacher } from '@/modules/preacher/entities/preacher.entity';
import { Supervisor } from '@/modules/supervisor/entities/supervisor.entity';

interface Options {
  month: string;
  data: Pastor[] | Copastor[] | Supervisor[] | Preacher[] | Disciple[];
}

export const getBirthDateByMonth = ({ month, data }: Options) => {
  const monthMap: Record<string, string> = {
    january: '01',
    february: '02',
    march: '03',
    april: '04',
    may: '05',
    june: '06',
    july: '07',
    august: '08',
    september: '09',
    october: '10',
    november: '11',
    december: '12',
  };

  const monthString = monthMap[month.toLowerCase()];

  if (!monthString) {
    throw new Error('Nombre de mes no válido');
  }

  const result = data.filter((person) => {
    const birthMonth = String(person?.member?.birthDate).split('-')[1];
    return birthMonth === monthString;
  });

  return result;
};
