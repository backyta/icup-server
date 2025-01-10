import { FamilyGroup } from '@/modules/family-group/entities/family-group.entity';

interface Options {
  familyGroups: FamilyGroup[];
}

export const familyGroupDataFormatter = ({ familyGroups }: Options) => {
  return familyGroups.map((familyGroup) => ({
    ...familyGroup,
    theirChurch: {
      id: familyGroup?.theirChurch?.id,
      churchName: familyGroup?.theirChurch?.churchName,
      abbreviatedChurchName: familyGroup?.theirChurch?.abbreviatedChurchName,
      district: familyGroup?.theirChurch?.district,
      urbanSector: familyGroup?.theirChurch?.urbanSector,
    },
    theirPastor: {
      id: familyGroup?.theirPastor?.id,
      firstNames: familyGroup?.theirPastor?.member?.firstNames,
      lastNames: familyGroup?.theirPastor?.member?.lastNames,
      roles: familyGroup?.theirPastor?.member?.roles,
    },
    theirCopastor: {
      id: familyGroup?.theirCopastor?.id,
      firstNames: familyGroup?.theirCopastor?.member?.firstNames,
      lastNames: familyGroup?.theirCopastor?.member?.lastNames,
      roles: familyGroup?.theirCopastor?.member?.roles,
    },
    theirSupervisor: {
      id: familyGroup?.theirSupervisor?.id,
      firstNames: familyGroup?.theirSupervisor?.member?.firstNames,
      lastNames: familyGroup?.theirSupervisor?.member?.lastNames,
      roles: familyGroup?.theirSupervisor?.member?.roles,
    },
    theirZone: {
      id: familyGroup?.theirZone?.id,
      zoneName: familyGroup?.theirZone?.zoneName,
      department: familyGroup?.theirZone?.department,
      province: familyGroup?.theirZone?.province,
      district: familyGroup?.theirZone?.district,
    },
    theirPreacher: {
      id: familyGroup?.theirPreacher?.id,
      firstNames: familyGroup?.theirPreacher?.member?.firstNames,
      lastNames: familyGroup?.theirPreacher?.member?.lastNames,
      roles: familyGroup?.theirPreacher?.member?.roles,
    },
    disciples: familyGroup?.disciples.map((disciple) => ({
      id: disciple?.id,
      firstNames: disciple?.member?.firstNames,
      lastNames: disciple?.member?.lastNames,
    })),
  }));
};
