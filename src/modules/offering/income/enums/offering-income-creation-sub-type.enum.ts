export enum OfferingIncomeCreationSubType {
  SundayService = 'sunday_service',
  GeneralFasting = 'general_fasting',
  GeneralVigil = 'general_vigil',
  ZonalVigil = 'zonal_vigil',
  ZonalFasting = 'zonal_fasting',
  FamilyGroup = 'family_group',
  SundaySchool = 'sunday_school',
  YouthService = 'youth_service',
  UnitedService = 'united_service',
  Special = 'special',
  Activities = 'activities',
  ChurchGround = 'church_ground',
}

export const OfferingIncomeCreationSubTypeNames: Record<
  OfferingIncomeCreationSubType,
  string
> = {
  [OfferingIncomeCreationSubType.SundayService]: 'Culto Dominical',
  [OfferingIncomeCreationSubType.FamilyGroup]: 'Grupo Familiar',
  [OfferingIncomeCreationSubType.GeneralFasting]: 'Ayuno General',
  [OfferingIncomeCreationSubType.GeneralVigil]: 'Vigilia General',
  [OfferingIncomeCreationSubType.ZonalFasting]: 'Ayuno Zonal',
  [OfferingIncomeCreationSubType.ZonalVigil]: 'Vigilia Zonal',
  [OfferingIncomeCreationSubType.SundaySchool]: 'Escuela Dominical',
  [OfferingIncomeCreationSubType.YouthService]: 'Culto Jóvenes',
  [OfferingIncomeCreationSubType.UnitedService]: 'Culto Unido',
  [OfferingIncomeCreationSubType.Activities]: 'Actividades',
  [OfferingIncomeCreationSubType.ChurchGround]: 'Terreno Iglesia',
  [OfferingIncomeCreationSubType.Special]: 'Especial',
};
