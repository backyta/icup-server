// TODO : cambiar a sub_type de busqueda para que tenga ams coherencia
export enum SearchTypeOfName {
  //* Module Offering
  offeringMember = 'offering-member',
  titheMember = 'tithe-member', // buscar el tithe por nombre o apellido
  offeringHousePreacher = 'offering-house-preacher',
  offeringHouseCopastor = 'offering-house-copastor',
  offeringFastingCopastor = 'offering-fasting-copastor',

  //* Module Family Home
  familyHouseName = 'family-house-name',
  familyHousePreacher = 'family-house-preacher',
  familyHouseCopastor = 'family-house-copastor',

  //* Module Preacher
  preacherMember = 'preacher-member',
  preacherCopastor = 'preacher-copastor',

  //* Module Copastor
  copastorMember = 'copastor-member',
  copastorPastor = 'copastor-pastor',

  //* Module Pastor
  pastorMember = 'pastor-member',

  //* Module Member
  memberPastor = 'member-pastor',
  memberCopastor = 'member-copastor',
  memberPreacher = 'member-preacher',
  memberMember = 'member-member',
}
