export enum OfferingIncomeSearchSubType {
  OfferingByDate = 'offering_by_date',

  // Sunday Service, school sunday
  OfferingByShift = 'offering_by_shift',
  OfferingByShiftDate = 'offering_by_shift_date',

  // Family House, Fasting Zonal, Vigil Zonal
  OfferingByZone = 'offering_by_zone',
  OfferingByZoneDate = 'offering_by_zone_date',

  // Offering Family House
  OfferingByGroupCode = 'offering_by_group_code',
  OfferingByGroupCodeDate = 'offering_by_group_code_date',
  OfferingByPreacherFirstNames = 'offering_by_preacher_first_names',
  OfferingByPreacherLastNames = 'offering_by_preacher_last_names',
  OfferingByPreacherFullNames = 'offering_by_preacher_full_names',

  // Offering Ayuno y Vigilia Zonal
  OfferingBySupervisorFirstNames = 'offering_by_supervisor_first_names',
  OfferingBySupervisorLastNames = 'offering_by_supervisor_last_names',
  OfferingBySupervisorFullNames = 'offering_by_supervisor_full_names',

  // Offering Ground Church and Special
  OfferingByContributorFirstNames = 'offering_by_contributor_first_names',
  OfferingByContributorLastNames = 'offering_by_contributor_last_names',
  OfferingByContributorFullNames = 'offering_by_contributor_full_names',
}
