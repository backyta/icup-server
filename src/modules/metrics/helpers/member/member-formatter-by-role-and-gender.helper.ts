import { Gender } from '@/common/enums/gender.enum';
import { MemberRole } from '@/common/enums/member-role.enum';

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

interface Church {
  isAnexe: boolean;
  abbreviatedChurchName: string;
}

interface MembersByRole {
  church: Church;
  men: number;
  women: number;
}

export interface MemberByRoleAndGenderDataResult {
  pastor: MembersByRole;
  copastor: MembersByRole;
  supervisor: MembersByRole;
  preacher: MembersByRole;
  disciple: MembersByRole;
}

export const memberFormatterByRoleAndGender = ({
  pastors,
  copastors,
  supervisors,
  preachers,
  disciples,
}: Options): MemberByRoleAndGenderDataResult => {
  const allMembers = [
    ...pastors,
    ...copastors,
    ...supervisors,
    ...preachers,
    ...disciples,
  ];

  const membersByRole: MemberByRoleAndGenderDataResult = {
    pastor: {
      church: {
        isAnexe: allMembers[0]?.theirChurch?.isAnexe,
        abbreviatedChurchName:
          allMembers[0]?.theirChurch?.abbreviatedChurchName,
      },
      men: allMembers.filter(
        (item) =>
          item?.member?.roles.includes(MemberRole.Pastor) &&
          item?.member?.gender === Gender.Male,
      ).length,
      women: allMembers.filter(
        (item) =>
          item?.member?.roles.includes(MemberRole.Pastor) &&
          item?.member?.gender === Gender.Female,
      ).length,
    },
    copastor: {
      church: {
        isAnexe: allMembers[0]?.theirChurch?.isAnexe,
        abbreviatedChurchName:
          allMembers[0]?.theirChurch?.abbreviatedChurchName,
      },
      men: allMembers.filter(
        (item) =>
          item?.member?.roles.includes(MemberRole.Copastor) &&
          item?.member?.gender === Gender.Male,
      ).length,
      women: allMembers.filter(
        (item) =>
          item?.member?.roles.includes(MemberRole.Copastor) &&
          item?.member?.gender === Gender.Female,
      ).length,
    },
    supervisor: {
      church: {
        isAnexe: allMembers[0]?.theirChurch?.isAnexe,
        abbreviatedChurchName:
          allMembers[0]?.theirChurch?.abbreviatedChurchName,
      },
      men: allMembers.filter(
        (item) =>
          item?.member?.roles.includes(MemberRole.Supervisor) &&
          item?.member?.gender === Gender.Male,
      ).length,
      women: allMembers.filter(
        (item) =>
          item?.member?.roles.includes(MemberRole.Supervisor) &&
          item?.member?.gender === Gender.Female,
      ).length,
    },
    preacher: {
      church: {
        isAnexe: allMembers[0]?.theirChurch?.isAnexe,
        abbreviatedChurchName:
          allMembers[0]?.theirChurch?.abbreviatedChurchName,
      },
      men: allMembers.filter(
        (item) =>
          item?.member?.roles.includes(MemberRole.Preacher) &&
          item?.member?.gender === Gender.Male,
      ).length,
      women: allMembers.filter(
        (item) =>
          item?.member?.roles.includes(MemberRole.Preacher) &&
          item?.member?.gender === Gender.Female,
      ).length,
    },
    disciple: {
      church: {
        isAnexe: allMembers[0]?.theirChurch?.isAnexe,
        abbreviatedChurchName:
          allMembers[0]?.theirChurch?.abbreviatedChurchName,
      },
      men: allMembers.filter(
        (item) =>
          item?.member?.roles.includes(MemberRole.Disciple) &&
          !item?.member?.roles.includes(MemberRole.Pastor) &&
          !item?.member?.roles.includes(MemberRole.Copastor) &&
          !item?.member?.roles.includes(MemberRole.Supervisor) &&
          !item?.member?.roles.includes(MemberRole.Preacher) &&
          !item?.member?.roles.includes(MemberRole.Treasurer) &&
          item?.member?.gender === Gender.Male,
      ).length,
      women: allMembers.filter(
        (item) =>
          item?.member?.roles.includes(MemberRole.Disciple) &&
          !item?.member?.roles.includes(MemberRole.Pastor) &&
          !item?.member?.roles.includes(MemberRole.Copastor) &&
          !item?.member?.roles.includes(MemberRole.Supervisor) &&
          !item?.member?.roles.includes(MemberRole.Preacher) &&
          !item?.member?.roles.includes(MemberRole.Treasurer) &&
          item?.member?.gender === Gender.Female,
      ).length,
    },
  };

  return membersByRole;
};
