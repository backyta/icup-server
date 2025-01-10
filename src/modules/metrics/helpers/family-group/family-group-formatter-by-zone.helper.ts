import { Gender } from '@/common/enums/gender.enum';
import { getInitialFullNames } from '@/common/helpers/get-initial-full-names.helper';

import { FamilyGroup } from '@/modules/family-group/entities/family-group.entity';

interface Options {
  familyGroups: FamilyGroup[];
}

export interface FamilyGroupsByZoneDataResult {
  preacher: string;
  supervisor: string;
  copastor: string;
  familyGroupCode: string;
  men: number;
  women: number;
  church: {
    isAnexe: boolean;
    abbreviatedChurchName: string;
  };
}

type FamilyGroupResult = {
  [key: string]: FamilyGroupsByZoneDataResult;
};

export const familyGroupFormatterByZone = ({ familyGroups }: Options) => {
  const result: FamilyGroupResult = familyGroups.reduce(
    (acc, familyGroup, index) => {
      const menCount = familyGroup.disciples.filter(
        (disciple) => disciple?.member?.gender === Gender.Male,
      ).length;

      const womenCount = familyGroup.disciples.filter(
        (disciple) => disciple?.member?.gender === Gender.Female,
      ).length;

      acc[`familyGroup-${index + 1}`] = {
        preacher: familyGroup?.theirPreacher?.member?.firstNames
          ? `${getInitialFullNames({ firstNames: familyGroup?.theirPreacher?.member?.firstNames ?? '', lastNames: '' })} ${familyGroup?.theirPreacher?.member?.lastNames}`
          : 'Sin Predicador',
        supervisor: familyGroup?.theirCopastor?.member?.firstNames
          ? `${getInitialFullNames({ firstNames: familyGroup?.theirCopastor?.member?.firstNames ?? '', lastNames: '' })} ${familyGroup?.theirCopastor?.member?.lastNames}`
          : 'Sin Co-Pastor',
        copastor: familyGroup?.theirCopastor?.member?.firstNames
          ? `${getInitialFullNames({ firstNames: familyGroup?.theirCopastor?.member?.firstNames ?? '', lastNames: '' })} ${familyGroup?.theirCopastor?.member?.lastNames}`
          : 'Sin Co-Pastor',
        familyGroupCode: familyGroup.familyGroupCode,
        men: menCount,
        women: womenCount,
        church: {
          isAnexe: familyGroups[0]?.theirChurch?.isAnexe,
          abbreviatedChurchName:
            familyGroups[0]?.theirChurch?.abbreviatedChurchName,
        },
      };

      return acc;
    },
    {},
  );

  return result;
};
