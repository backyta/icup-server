export enum MemberInactivationCategory {
  PersonalOrFamilyChanges = 'personal_or_family_changes',
  ChurchRelatedIssues = 'church_related_issues',
  DisciplinaryActions = 'disciplinary_actions',
  PersonalChallenges = 'personal_challenges',
  UnavoidableCircumstances = 'unavoidable_circumstances',
  InactivityOrLackOfCommitment = 'inactivity_or_lack_of_commitment',
  AdministrativeReasons = 'administrative_reasons',
  ExternalFactors = 'external_factors',
  SpecialCircumstances = 'special_circumstances',
}

export const MemberInactivationCategoryNames: Record<
  MemberInactivationCategory,
  string
> = {
  [MemberInactivationCategory.PersonalOrFamilyChanges]:
    'Cambios personales o familiares',
  [MemberInactivationCategory.ChurchRelatedIssues]:
    'Problemas relacionados con la iglesia',
  [MemberInactivationCategory.DisciplinaryActions]: 'Razones disciplinarias',
  [MemberInactivationCategory.PersonalChallenges]: 'Dificultades personales',
  [MemberInactivationCategory.UnavoidableCircumstances]:
    'Razones inevitables o naturales',
  [MemberInactivationCategory.InactivityOrLackOfCommitment]:
    'Falta de actividad o compromiso',
  [MemberInactivationCategory.AdministrativeReasons]:
    ' Motivos administrativos',
  [MemberInactivationCategory.ExternalFactors]: 'Factores externos',
  [MemberInactivationCategory.SpecialCircumstances]:
    'Razones especiales o excepcionales',
};
