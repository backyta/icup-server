import { Pastor } from '@/modules/pastor/entities/pastor.entity';

interface Options {
  pastors: Pastor[];
}

export const pastorDataFormatter = ({ pastors }: Options) => {
  return pastors.map((pastor) => ({
    ...pastor,
    theirChurch: {
      id: pastor?.theirChurch?.id,
      churchName: pastor?.theirChurch?.churchName,
      abbreviatedChurchName: pastor?.theirChurch?.abbreviatedChurchName,
    },
    copastors: pastor?.copastors.map((copastor) => ({
      id: copastor?.id,
      firstNames: copastor?.member?.firstNames,
      lastNames: copastor?.member?.lastNames,
    })),
    supervisors: pastor?.supervisors.map((supervisor) => ({
      id: supervisor?.id,
      firstNames: supervisor?.member?.firstNames,
      lastNames: supervisor?.member?.lastNames,
    })),
    zones: pastor?.zones.map((zone) => ({
      id: zone?.id,
      zoneName: zone?.zoneName,
      district: zone?.district,
    })),
    preachers: pastor?.preachers.map((preacher) => ({
      id: preacher?.id,
      firstNames: preacher?.member?.firstNames,
      lastNames: preacher?.member?.lastNames,
    })),
    familyGroups: pastor?.familyGroups.map((familyGroup) => ({
      id: familyGroup?.id,
      familyGroupName: familyGroup?.familyGroupName,
      familyGroupCode: familyGroup?.familyGroupCode,
      district: familyGroup?.district,
      urbanSector: familyGroup?.urbanSector,
      theirZone: familyGroup.theirZone,
    })),
    disciples: pastor.disciples.map((disciple) => ({
      id: disciple?.id,
      firstNames: disciple?.member?.firstNames,
      lastNames: disciple?.member?.lastNames,
    })),
  }));
};
