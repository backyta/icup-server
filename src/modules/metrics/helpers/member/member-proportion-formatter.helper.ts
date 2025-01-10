import { Gender } from '@/common/enums/gender.enum';
import { RecordStatus } from '@/common/enums/record-status.enum';

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

export interface MemberProportionDataResult {
  countMembersMale: number;
  totalCountMembers: number;
  countMembersFemale: number;
  countMembersActive: number;
  countMembersInactive: number;
}

export const memberProportionFormatter = ({
  pastors,
  copastors,
  supervisors,
  preachers,
  disciples,
}: Options): MemberProportionDataResult => {
  const allMembers = [
    ...pastors,
    ...copastors,
    ...supervisors,
    ...preachers,
    ...disciples,
  ];

  const totalCountMembers = allMembers.length;

  const countMembersMale = allMembers.filter(
    (item) => item?.member?.gender === Gender.Male,
  ).length;

  const countMembersFemale = allMembers.filter(
    (item) => item?.member?.gender === Gender.Female,
  ).length;

  const countMembersActive = allMembers.filter(
    (item) => item?.recordStatus === RecordStatus.Active,
  ).length;

  const countMembersInactive = allMembers.filter(
    (item) => item?.recordStatus === RecordStatus.Inactive,
  ).length;

  return {
    countMembersMale,
    totalCountMembers,
    countMembersFemale,
    countMembersActive,
    countMembersInactive,
  };
};
