import { Pastor } from '@/modules/pastor/entities/pastor.entity';
import { Copastor } from '@/modules/copastor/entities/copastor.entity';
import { Disciple } from '@/modules/disciple/entities/disciple.entity';
import { Preacher } from '@/modules/preacher/entities/preacher.entity';
import { Supervisor } from '@/modules/supervisor/entities/supervisor.entity';

const monthNames = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

interface Options {
  pastors: Pastor[];
  copastors: Copastor[];
  supervisors: Supervisor[];
  preachers: Preacher[];
  disciples: Disciple[];
}

interface ChurchInfo {
  isAnexe: boolean;
  abbreviatedChurchName: string;
}

export interface MonthlyMemberDataResult {
  month: string;
  membersCount: number;
  averageAge: string | number;
  church: ChurchInfo;
}

export const memberFormatterByBirthMonth = ({
  pastors,
  copastors,
  supervisors,
  preachers,
  disciples,
}: Options): MonthlyMemberDataResult[] => {
  const allMembers = [
    ...pastors,
    ...copastors,
    ...supervisors,
    ...preachers,
    ...disciples,
  ];

  const memberByBirthMonth = monthNames.map((_, index) =>
    allMembers.filter(
      (item) => new Date(item?.member?.birthDate).getMonth() === index,
    ),
  );

  const calculateMemberData = (members: typeof allMembers) => {
    const membersCount = members.length;
    const averageAge =
      membersCount > 0
        ? (
            members.reduce((sum, item) => sum + item?.member?.age, 0) /
            membersCount
          ).toFixed(0)
        : 0;
    return { averageAge, membersCount };
  };

  const dataResult: MonthlyMemberDataResult[] = monthNames.map((_, index) => {
    return {
      month: monthNames[index],
      ...calculateMemberData(memberByBirthMonth[index]),
      church: {
        isAnexe: allMembers[0]?.theirChurch?.isAnexe,
        abbreviatedChurchName:
          allMembers[0]?.theirChurch?.abbreviatedChurchName,
      },
    };
  });

  return dataResult;
};
