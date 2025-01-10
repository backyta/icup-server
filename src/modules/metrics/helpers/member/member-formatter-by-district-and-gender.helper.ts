import { Gender } from '@/common/enums/gender.enum';

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

export interface MembersByDistrictAndGenderDataResult {
  men: number;
  women: number;
  district: string;
  church: {
    isAnexe: boolean;
    abbreviatedChurchName: string;
  };
}

interface DistrictsResult {
  [urbanSector: string]: MembersByDistrictAndGenderDataResult; // Resultado agrupado por sector urbano
}

export const memberFormatterByDistrictAndGender = ({
  pastors,
  copastors,
  supervisors,
  preachers,
  disciples,
}: Options): DistrictsResult => {
  const allMembers = [
    ...pastors,
    ...copastors,
    ...supervisors,
    ...preachers,
    ...disciples,
  ];

  const result: DistrictsResult = allMembers.reduce((acc, item) => {
    const menCount = item?.member?.gender === Gender.Male ? 1 : 0;
    const womenCount = item?.member?.gender === Gender.Female ? 1 : 0;

    if (!acc[item?.member?.residenceUrbanSector]) {
      acc[item?.member?.residenceUrbanSector] = {
        men: 0,
        women: 0,
        district: item.member.residenceDistrict,
        church: {
          isAnexe: allMembers[0]?.theirChurch?.isAnexe,
          abbreviatedChurchName:
            allMembers[0]?.theirChurch?.abbreviatedChurchName,
        },
      };
    }

    acc[item?.member?.residenceUrbanSector].men += menCount;
    acc[item?.member?.residenceUrbanSector].women += womenCount;

    return acc;
  }, {});

  const sortedResult = Object.keys(result)
    .sort((a, b) => {
      const districtA = result[a].district.toUpperCase();
      const districtB = result[b].district.toUpperCase();
      if (districtA < districtB) {
        return -1;
      }
      if (districtA > districtB) {
        return 1;
      }
      return 0;
    })
    .reduce((acc, key) => {
      acc[key] = result[key];
      return acc;
    }, {});

  return sortedResult;
};
