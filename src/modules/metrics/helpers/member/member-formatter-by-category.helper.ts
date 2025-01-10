import { Pastor } from '@/modules/pastor/entities/pastor.entity';
import { Copastor } from '@/modules/copastor/entities/copastor.entity';
import { Disciple } from '@/modules/disciple/entities/disciple.entity';
import { Preacher } from '@/modules/preacher/entities/preacher.entity';
import { Supervisor } from '@/modules/supervisor/entities/supervisor.entity';

interface Options {
  pastors: Pastor[];
  copastors: Copastor[];
  supervisors: Supervisor[];
  preachers: Preacher[];
  disciples: Disciple[];
}

export interface MembersByCategoryDataResult {
  child: number;
  teenager: number;
  youth: number;
  adult: number;
  middleAged: number;
  senior: number;
}

export const memberFormatterByCategory = ({
  pastors,
  copastors,
  supervisors,
  preachers,
  disciples,
}: Options): MembersByCategoryDataResult => {
  const allMembers = [
    ...pastors,
    ...copastors,
    ...supervisors,
    ...preachers,
    ...disciples,
  ];

  const membersByCategory: MembersByCategoryDataResult = {
    child: allMembers.filter(
      (item) => item?.member?.age >= 0 && item?.member?.age <= 12,
    ).length,
    teenager: allMembers.filter(
      (item) => item?.member?.age >= 13 && item?.member?.age <= 17,
    ).length,
    youth: allMembers.filter(
      (item) => item?.member?.age >= 18 && item?.member?.age <= 29,
    ).length,
    adult: allMembers.filter(
      (item) => item?.member?.age >= 30 && item?.member?.age <= 59,
    ).length,
    middleAged: allMembers.filter(
      (item) => item?.member?.age >= 60 && item?.member?.age <= 74,
    ).length,
    senior: allMembers.filter((item) => item?.member?.age >= 75).length,
  };

  return membersByCategory;
};
