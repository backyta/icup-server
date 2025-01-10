export enum FamilyGroupSearchType {
  FirstNames = 'first_names',
  LastNames = 'last_names',
  FullNames = 'full_names',
  ZoneName = 'zone_name',
  FamilyGroupCode = 'family_group_code',
  FamilyGroupName = 'family_group_name',
  Country = 'country',
  Department = 'department',
  Province = 'province',
  District = 'district',
  UrbanSector = 'urban_sector',
  Address = 'address',
  RecordStatus = 'record_status',
}

export const FamilyGroupSearchTypeNames: Record<FamilyGroupSearchType, string> =
  {
    [FamilyGroupSearchType.FirstNames]: 'Nombres',
    [FamilyGroupSearchType.LastNames]: 'Apellidos',
    [FamilyGroupSearchType.FullNames]: 'Nombres y Apellidos',
    [FamilyGroupSearchType.ZoneName]: 'Nombre de Zona',
    [FamilyGroupSearchType.FamilyGroupCode]: 'Código de grupo familiar',
    [FamilyGroupSearchType.FamilyGroupName]: 'Nombre de grupo familiar',
    [FamilyGroupSearchType.Country]: 'País',
    [FamilyGroupSearchType.Department]: 'Departamento',
    [FamilyGroupSearchType.Province]: 'Provincia',
    [FamilyGroupSearchType.District]: 'Distrito',
    [FamilyGroupSearchType.UrbanSector]: 'Sector Urbano',
    [FamilyGroupSearchType.Address]: 'Dirección',
    [FamilyGroupSearchType.RecordStatus]: 'Estado de registro',
  };
