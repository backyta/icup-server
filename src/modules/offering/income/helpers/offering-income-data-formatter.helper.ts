import { OfferingIncome } from '@/modules/offering/income/entities/offering-income.entity';

interface Options {
  offeringIncome: OfferingIncome[];
}

export const offeringIncomeDataFormatter = ({ offeringIncome }: Options) => {
  return offeringIncome.map((offering) => ({
    ...offering,
    church: {
      id: offering?.church?.id,
      churchName: offering?.church?.churchName,
      abbreviatedChurchName: offering?.church?.abbreviatedChurchName,
      department: offering?.church?.department,
      province: offering?.church?.province,
      district: offering?.church?.district,
    },
    pastor: {
      id: offering?.pastor?.id,
      firstNames: offering?.pastor?.member?.firstNames,
      lastNames: offering?.pastor?.member?.lastNames,
      roles: offering?.pastor?.member?.roles,
    },
    copastor: {
      id: offering?.copastor?.id,
      firstNames: offering?.copastor?.member?.firstNames,
      lastNames: offering?.copastor?.member?.lastNames,
      roles: offering?.copastor?.member?.roles,
    },
    supervisor: {
      id: offering?.supervisor?.id,
      firstNames: offering?.supervisor?.member?.firstNames,
      lastNames: offering?.supervisor?.member?.lastNames,
      roles: offering?.supervisor?.member?.roles,
    },
    preacher: {
      id: offering?.preacher?.id,
      firstNames: offering?.preacher?.member?.firstNames,
      lastNames: offering?.preacher?.member?.lastNames,
      roles: offering?.preacher?.member?.roles,
    },
    disciple: {
      id: offering?.disciple?.id,
      firstNames: offering?.disciple?.member?.firstNames,
      lastNames: offering?.disciple?.member?.lastNames,
      roles: offering?.disciple?.member?.roles,
    },
    zone: {
      id: offering?.zone?.id,
      zoneName: offering?.zone?.zoneName,
      department: offering?.zone?.department,
      province: offering?.zone?.province,
      district: offering?.zone?.district,
    },
    familyGroup: {
      id: offering?.familyGroup?.id,
      familyGroupName: offering?.familyGroup?.familyGroupName,
      familyGroupCode: offering?.familyGroup?.familyGroupCode,
      district: offering?.familyGroup?.district,
      urbanSector: offering?.familyGroup?.urbanSector,
      theirPreacher: offering?.familyGroup?.theirPreacher,
      disciples: offering?.familyGroup?.disciples,
    },
    externalDonor: {
      id: offering?.externalDonor?.id,
      firstNames: offering?.externalDonor?.firstNames,
      lastNames: offering?.externalDonor?.lastNames,
      gender: offering?.externalDonor?.gender,
      birthDate: offering?.externalDonor?.birthDate,
      email: offering?.externalDonor?.email,
      phoneNumber: offering?.externalDonor?.phoneNumber,
      originCountry: offering?.externalDonor?.originCountry,
      residenceCountry: offering?.externalDonor?.residenceCountry,
      residenceCity: offering?.externalDonor?.residenceCity,
      postalCode: offering?.externalDonor?.postalCode,
    },
  }));
};
