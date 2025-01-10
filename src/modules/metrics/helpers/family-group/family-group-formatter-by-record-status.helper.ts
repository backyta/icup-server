import { RecordStatus } from '@/common/enums/record-status.enum';
import { getInitialFullNames } from '@/common/helpers/get-initial-full-names.helper';

import { FamilyGroup } from '@/modules/family-group/entities/family-group.entity';

interface Options {
  familyGroups: FamilyGroup[];
}

interface SupervisorInfo {
  supervisor: string;
  copastor: string;
  active: number;
  inactive: number;
  church: {
    isAnexe: boolean;
    abbreviatedChurchName: string;
  };
}

export type FamilyGroupsByRecordStatusDataResult = {
  [zoneName: string]: SupervisorInfo;
};

export const familyGroupFormatterByRecordStatus = ({
  familyGroups,
}: Options) => {
  const result: FamilyGroupsByRecordStatusDataResult = familyGroups.reduce(
    (acc, familyGroup) => {
      const zoneName = familyGroup.theirZone?.zoneName;

      if (!acc[zoneName]) {
        acc[zoneName] = {
          copastor: familyGroup?.theirCopastor?.member?.firstNames
            ? `${getInitialFullNames({
                firstNames:
                  familyGroup?.theirCopastor?.member?.firstNames ?? '',
                lastNames: '',
              })} ${familyGroup?.theirCopastor?.member?.lastNames}`
            : 'Sin Co-Pastor',
          supervisor: familyGroup?.theirSupervisor?.member?.firstNames
            ? `${getInitialFullNames({
                firstNames:
                  familyGroup?.theirSupervisor?.member?.firstNames ?? '',
                lastNames: '',
              })} ${familyGroup?.theirSupervisor?.member?.lastNames}`
            : 'Sin Supervisor',
          active: 0,
          inactive: 0,
          church: {
            isAnexe: familyGroups[0]?.theirChurch?.isAnexe,
            abbreviatedChurchName:
              familyGroups[0]?.theirChurch?.abbreviatedChurchName,
          },
        };
      }

      acc[zoneName].active +=
        familyGroup.recordStatus === RecordStatus.Active ? 1 : 0;
      acc[zoneName].inactive +=
        familyGroup.recordStatus === RecordStatus.Inactive ? 1 : 0;

      return acc;
    },
    {},
  );

  return result;
};
