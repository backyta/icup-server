import { MaritalStatus } from '@/common/enums/marital-status.enum';

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

export interface MembersByMaritalStatusDataResult {
  single: number;
  married: number;
  divorced: number;
  windowed: number;
  other: number;
}

export const memberFormatterByMaritalStatus = ({
  pastors,
  copastors,
  supervisors,
  preachers,
  disciples,
}: Options): MembersByMaritalStatusDataResult => {
  const allMembers = [
    ...pastors,
    ...copastors,
    ...supervisors,
    ...preachers,
    ...disciples,
  ];

  const membersByMaritalStatus: MembersByMaritalStatusDataResult = {
    single: allMembers.filter(
      (item) => item?.member?.maritalStatus === MaritalStatus.Single,
    ).length,
    married: allMembers.filter(
      (item) => item?.member?.maritalStatus === MaritalStatus.Married,
    ).length,
    divorced: allMembers.filter(
      (item) => item?.member?.maritalStatus === MaritalStatus.Divorced,
    ).length,
    windowed: allMembers.filter(
      (item) => item?.member?.maritalStatus === MaritalStatus.Widowed,
    ).length,
    other: allMembers.filter(
      (item) => item?.member?.maritalStatus === MaritalStatus.Other,
    ).length,
  };

  return membersByMaritalStatus;
};
