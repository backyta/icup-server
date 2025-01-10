import { RecordStatus } from '@/common/enums/record-status.enum';
import { FamilyGroup } from '@/modules/family-group/entities/family-group.entity';

interface Options {
  familyGroups: FamilyGroup[];
}

interface FamilyGroupProportionDataResult {
  totalCountFamilyGroups: number;
  countFamilyGroupsActive: number;
  countFamilyGroupsInactive: number;
}

export const familyGroupProportionFormatter = ({
  familyGroups,
}: Options): FamilyGroupProportionDataResult => {
  const totalCountFamilyGroups = familyGroups.length;

  const countFamilyGroupsActive = familyGroups.filter(
    (member) => member.recordStatus === RecordStatus.Active,
  ).length;

  const countFamilyGroupsInactive = familyGroups.filter(
    (member) => member.recordStatus === RecordStatus.Inactive,
  ).length;

  return {
    totalCountFamilyGroups,
    countFamilyGroupsActive,
    countFamilyGroupsInactive,
  };
};
