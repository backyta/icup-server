export enum OfferingIncomeSearchType {
  SundayService = 'sunday_service',
  FamilyGroup = 'family_group',
  GeneralFasting = 'general_fasting',
  GeneralVigil = 'general_vigil',
  ZonalFasting = 'zonal_fasting',
  ZonalVigil = 'zonal_vigil',
  SundaySchool = 'sunday_school',
  YouthService = 'youth_service',
  UnitedService = 'united_service',
  Activities = 'activities',
  ChurchGround = 'church_ground',
  Special = 'special',
  IncomeAdjustment = 'income_adjustment',
  RecordStatus = 'record_status',
}

export const OfferingIncomeSearchTypeNames: Record<
  OfferingIncomeSearchType,
  string
> = {
  [OfferingIncomeSearchType.SundayService]: 'Culto Dominical',
  [OfferingIncomeSearchType.FamilyGroup]: 'Grupo Familiar',
  [OfferingIncomeSearchType.GeneralFasting]: 'Ayuno General',
  [OfferingIncomeSearchType.GeneralVigil]: 'Vigilia General',
  [OfferingIncomeSearchType.ZonalFasting]: 'Ayuno Zonal',
  [OfferingIncomeSearchType.ZonalVigil]: 'Vigilia Zonal',
  [OfferingIncomeSearchType.SundaySchool]: 'Escuela Dominical',
  [OfferingIncomeSearchType.YouthService]: 'Culto Jóvenes',
  [OfferingIncomeSearchType.UnitedService]: 'Culto Unido',
  [OfferingIncomeSearchType.Activities]: 'Actividades',
  [OfferingIncomeSearchType.ChurchGround]: 'Terreno Iglesia',
  [OfferingIncomeSearchType.Special]: 'Ofrendas Especial',
  [OfferingIncomeSearchType.IncomeAdjustment]: 'Ajustes por Ingreso',
  [OfferingIncomeSearchType.RecordStatus]: 'Estado de Registro',
};
