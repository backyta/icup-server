import { Zone } from '@/modules/zone/entities/zone.entity';

interface Options {
  zones: Zone[];
}

export const zoneDataFormatter = ({ zones }: Options) => {
  return zones.map((zone) => ({
    ...zone,
    theirChurch: {
      id: zone?.theirChurch?.id,
      churchName: zone?.theirChurch?.churchName,
      abbreviatedChurchName: zone?.theirChurch?.abbreviatedChurchName,
      district: zone?.theirChurch?.district,
      urbanSector: zone?.theirChurch?.urbanSector,
    },
    theirPastor: {
      id: zone?.theirPastor?.id,
      firstNames: zone?.theirPastor?.member?.firstNames,
      lastNames: zone?.theirPastor?.member?.lastNames,
      roles: zone?.theirPastor?.member?.roles,
    },
    theirCopastor: {
      id: zone?.theirCopastor?.id,
      firstNames: zone?.theirCopastor?.member?.firstNames,
      lastNames: zone?.theirCopastor?.member?.lastNames,
      roles: zone?.theirCopastor?.member?.roles,
    },
    theirSupervisor: {
      id: zone?.theirSupervisor?.id,
      firstNames: zone?.theirSupervisor?.member?.firstNames,
      lastNames: zone?.theirSupervisor?.member?.lastNames,
      roles: zone?.theirSupervisor?.member?.roles,
    },
    preachers: zone?.preachers.map((preacher) => ({
      id: preacher?.id,
      firstNames: preacher?.member?.firstNames,
      lastNames: preacher?.member?.lastNames,
    })),
    familyGroups: zone?.familyGroups.map((familyGroup) => ({
      id: familyGroup?.id,
      familyGroupName: familyGroup?.familyGroupName,
      familyGroupCode: familyGroup?.familyGroupCode,
      district: familyGroup?.district,
      urbanSector: familyGroup?.urbanSector,
      theirZone: familyGroup?.theirZone,
    })),
    disciples: zone?.disciples.map((disciple) => ({
      id: disciple?.id,
      firstNames: disciple?.member?.firstNames,
      lastNames: disciple?.member?.lastNames,
    })),
  }));
};
