import { Zone } from '@/modules/zone/entities/zone.entity';

import { Gender } from '@/common/enums/gender.enum';
import { getInitialFullNames } from '@/common/helpers/get-initial-full-names.helper';

interface Options {
  zones: Zone[];
}

interface Church {
  isAnexe: boolean;
  abbreviatedChurchName: string;
}

export interface PreachersByZoneDataResult {
  [zoneName: string]: {
    copastor: string;
    supervisor: string;
    men: number;
    women: number;
    church: Church;
  };
}

export const preacherFormatterByZoneAndGender = ({ zones }: Options) => {
  const result: PreachersByZoneDataResult = zones.reduce((acc, zone) => {
    const menCount = zone.preachers.filter(
      (disciple) => disciple?.member?.gender === Gender.Male,
    ).length;

    const womenCount = zone.preachers.filter(
      (disciple) => disciple?.member?.gender === Gender.Female,
    ).length;

    acc[zone.zoneName] = {
      copastor: zone?.theirCopastor?.member?.firstNames
        ? `${getInitialFullNames({ firstNames: zone?.theirCopastor?.member?.firstNames ?? '', lastNames: '' })} ${zone?.theirCopastor?.member?.lastNames}`
        : 'Sin Supervisor',
      supervisor: zone?.theirSupervisor?.member?.firstNames
        ? `${getInitialFullNames({ firstNames: zone?.theirSupervisor?.member?.firstNames ?? '', lastNames: '' })} ${zone?.theirSupervisor?.member?.lastNames}`
        : 'Sin Supervisor',
      men: menCount,
      women: womenCount,
      church: {
        isAnexe: zones[0]?.theirChurch?.isAnexe,
        abbreviatedChurchName: zones[0]?.theirChurch?.abbreviatedChurchName,
      },
    };

    return acc;
  }, {});

  return result;
};
