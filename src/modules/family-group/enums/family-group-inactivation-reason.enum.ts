export enum FamilyGroupInactivationReason {
  //* Reasons for administrative changes
  StructuralReorganization = 'structural_reorganization',
  GroupFusion = 'group_fusion',
  AdministrativeRemoval = 'administrative_removal',

  //* Reasons for leadership problems
  PreacherResignation = 'preacher_resignation',
  LeadershipIncapacity = 'leadership_incapacity',
  LeadershipConflict = 'leadership_conflict',

  //* Reasons for host unavailability
  HostFamilyDecision = 'host_family_decision',
  HostFamilyIssues = 'host_family_issues',
  HostFamilyRelocation = 'host_family_relocation',

  //* Razones por falta de actividad o compromiso
  GroupInactivity = 'group_inactivity',
  LowEngagement = 'low_engagement',
  TotalInactivity = 'total_inactivity',

  //* Reasons for lack of activity or commitment
  LegalRestrictions = 'legal_restrictions',
  AccessibilityIssues = 'accessibility_issues',
  CommunityChanges = 'community_changes',

  //* Unavoidable or natural reasons
  NaturalDisasters = 'natural_disasters',
  HealthCrisis = 'health_crisis',
  CriticalIllnessOrDeath = 'critical_illness_or_death',
}

export const FamilyGroupInactivationReasonNames: Record<
  FamilyGroupInactivationReason,
  string
> = {
  [FamilyGroupInactivationReason.StructuralReorganization]:
    'Reorganización estructural de las zonas.',
  [FamilyGroupInactivationReason.GroupFusion]:
    'Reducción de zonas por optimización de recursos.',
  [FamilyGroupInactivationReason.AdministrativeRemoval]:
    'Fusión con otra zona para mejorar la gestión.',

  [FamilyGroupInactivationReason.PreacherResignation]:
    'Renuncia o traslado del predicador a otra área.',
  [FamilyGroupInactivationReason.LeadershipIncapacity]:
    'Incapacidad del predicador para continuar guiando el grupo.',
  [FamilyGroupInactivationReason.LeadershipConflict]:
    'Conflictos entre el predicador y los miembros del grupo.',

  [FamilyGroupInactivationReason.HostFamilyDecision]:
    'Decisión de la familia anfitriona de no permitir más reuniones en su hogar.',
  [FamilyGroupInactivationReason.HostFamilyIssues]:
    'Problemas familiares dentro de la casa anfitriona que impiden los cultos.',
  [FamilyGroupInactivationReason.HostFamilyRelocation]:
    'Cambio de residencia de la familia anfitriona.',

  [FamilyGroupInactivationReason.GroupInactivity]:
    'Baja asistencia constante a las reuniones del grupo.',
  [FamilyGroupInactivationReason.LowEngagement]:
    'Falta de interés de los miembros por participar en las actividades.',
  [FamilyGroupInactivationReason.TotalInactivity]:
    'Inactividad prolongada del grupo familiar.',

  [FamilyGroupInactivationReason.LegalRestrictions]:
    'Restricciones legales o gubernamentales que afectan las reuniones.',
  [FamilyGroupInactivationReason.AccessibilityIssues]:
    'Ubicación de difícil acceso para los miembros del grupo.',
  [FamilyGroupInactivationReason.CommunityChanges]:
    'Cambios significativos en la comunidad que afectan al grupo.',

  [FamilyGroupInactivationReason.NaturalDisasters]:
    'Desastres naturales que dañan o inutilizan la casa anfitriona.',
  [FamilyGroupInactivationReason.HealthCrisis]:
    'Crisis de salud pública (pandemias) que impiden las reuniones.',
  [FamilyGroupInactivationReason.CriticalIllnessOrDeath]:
    'Fallecimiento o enfermedad grave de los responsables del grupo.',
};
