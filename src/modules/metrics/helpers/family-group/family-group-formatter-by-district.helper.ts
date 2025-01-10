import { FamilyGroup } from '@/modules/family-group/entities/family-group.entity';

interface Options {
  familyGroups: FamilyGroup[];
}

interface ChurchInfo {
  isAnexe: boolean;
  abbreviatedChurchName: string;
}

interface FamilyGroupDistrict {
  familyGroupsCount: number;
  district: string;
  church: ChurchInfo;
}

export type FamilyGroupsByDistrictDataResult = {
  [urbanSector: string]: FamilyGroupDistrict;
};

export const familyGroupFormatterByDistrict = ({ familyGroups }: Options) => {
  const result: FamilyGroupsByDistrictDataResult = familyGroups.reduce(
    (acc, item) => {
      if (!acc[item.urbanSector]) {
        acc[item.urbanSector] = {
          familyGroupsCount: 0,
          district: item.district,
          church: {
            isAnexe: familyGroups[0]?.theirChurch?.isAnexe,
            abbreviatedChurchName:
              familyGroups[0]?.theirChurch?.abbreviatedChurchName,
          },
        };
      }

      acc[item.urbanSector].familyGroupsCount += 1;

      return acc;
    },
    {},
  );

  const sortedResult: FamilyGroupsByDistrictDataResult = Object.keys(result)
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
