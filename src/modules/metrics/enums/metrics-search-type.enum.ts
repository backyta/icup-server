export enum MetricSearchType {
  // Members
  MembersByProportion = 'members_by_proportion',
  MembersFluctuationByYear = 'members_fluctuation_by_year',
  MembersByBirthMonth = 'members_by_birth_month',
  MembersByCategory = 'members_by_category',
  MembersByCategoryAndGender = 'members_by_category_and_gender',
  MembersByRoleAndGender = 'members_by_role_and_gender',
  MembersByMaritalStatus = 'members_by_marital_status',
  DisciplesByZoneAndGender = 'disciples_by_zone_and_gender',
  PreachersByZoneAndGender = 'preachers_by_zone_and_gender',
  MembersByDistrictAndGender = 'members_by_district_and_gender',
  MembersByRecordStatus = 'members_by_record_status',

  // Family Groups
  FamilyGroupsByProportion = 'family_groups_by_proportion',
  FamilyGroupsFluctuationByYear = 'family_groups_fluctuation_by_year',
  FamilyGroupsByZone = 'family_groups_by_zone',
  FamilyGroupsByCopastorAndZone = 'family_groups_by_copastor_and_zone',
  FamilyGroupsByDistrict = 'family_groups_by_district',
  FamilyGroupsByServiceTime = 'family_groups_by_service_time',
  FamilyGroupsByRecordStatus = 'family_groups_by_record_status',

  // Offering Income
  OfferingIncomeByProportion = 'offering_income_by_proportion',
  OfferingIncomeBySundayService = 'offering_income_by_sunday_service',
  OfferingIncomeByFamilyGroup = 'offering_income_by_family_group',
  OfferingIncomeBySundaySchool = 'offering_income_by_sunday_school',
  OfferingIncomeByFastingAndVigil = 'offering_income_by_fasting_and_vigil',
  OfferingIncomeByYouthService = 'offering_income_by_youth_service',
  OfferingIncomeBySpecialOffering = 'offering_income_by_special_offering',
  OfferingIncomeByChurchGround = 'offering_income_by_church_ground',
  OfferingIncomeByUnitedService = 'offering_income_by_united_service',
  OfferingIncomeByActivities = 'offering_income_by_activities',
  OfferingIncomeAdjustment = 'offering_income_adjustment',

  // Offering Expenses
  OfferingExpensesByProportion = 'offering_expenses_by_proportion',
  OperationalOfferingExpenses = 'operational_offering_expenses',
  MaintenanceAndRepairOfferingExpenses = 'maintenance_and_repair_offering_expenses',
  DecorationOfferingExpenses = 'decoration_offering_expenses',
  EquipmentAndTechnologyOfferingExpenses = 'equipment_and_technology_offering_expenses',
  SuppliesOfferingExpenses = 'supplies_offering_expenses',
  PlaningEventsOfferingExpenses = 'planing_events_offering_expenses',
  OtherOfferingExpenses = 'other_offering_expenses',
  OfferingExpensesAdjustment = 'offering_expenses_adjustment',

  // Offering Comparative
  OfferingExpensesAndOfferingIncomeByProportion = 'offering_expenses_and_offering_income_by_proportion',
  IncomeAndExpensesComparativeByYear = 'income_and_expense_comparative_by_year',
  GeneralComparativeOfferingIncome = 'general_comparative_offering_income',
  ComparativeOfferingIncomeByType = 'comparative_offering_income_by_type',
  GeneralComparativeOfferingExpenses = 'general_comparative_offering_expenses',
  ComparativeOfferingExpensesByType = 'comparative_offering_expenses_by_type',
  ComparativeOfferingExpensesBySubType = 'comparative_offering_expenses_by_sub_type',
}
