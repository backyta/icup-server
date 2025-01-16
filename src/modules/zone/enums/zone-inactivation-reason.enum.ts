export enum ZoneInactivationReason {
  // Razones por cambios administrativos
  StructuralReorganization = 'structural_reorganization',
  ZoneReduction = 'zone_reduction',
  ZoneFusion = 'zone_fusion',
  NoSupervisorAssigned = 'no_supervisor_assigned',

  // Razones por problemas de liderazgo
  SupervisorResignation = 'supervisor_resignation',
  LeadershipConflicts = 'leadership_conflicts',
  LeadershipIncapacity = 'leadership_incapacity',

  // Razones por falta de actividad o compromiso
  GeneralInactivity = 'general_inactivity',
  LackOfParticipation = 'lack_of_participation',
  LowDiscipleCommitment = 'low_disciple_commitment',

  // Razones relacionadas con los grupos familiares
  FamilyGroupsDissolution = 'family_groups_dissolution',
  FamilyGroupsRelocation = 'family_groups_relocation',
  MemberLoss = 'member_loss',

  // Razones por factores externos
  DemographicChanges = 'demographic_changes',
  LegalRestrictions = 'legal_restrictions',
  AccessIssues = 'access_issues',

  // Razones inevitables o naturales
  NaturalDisasters = 'natural_disasters',
  HealthCrisis = 'health_crisis',
  ResourceShortage = 'resource_shortage',
}

export const ZoneInactivationReasonNames: Record<
  ZoneInactivationReason,
  string
> = {
  [ZoneInactivationReason.StructuralReorganization]:
    'Reorganización estructural de las zonas.',
  [ZoneInactivationReason.ZoneReduction]:
    'Reducción de zonas por optimización de recursos.',
  [ZoneInactivationReason.ZoneFusion]:
    'Fusión con otra zona para mejorar la gestión.',
  [ZoneInactivationReason.NoSupervisorAssigned]:
    'Falta de un supervisor designado.',

  [ZoneInactivationReason.SupervisorResignation]:
    'Renuncia o inactividad prolongada del supervisor.',
  [ZoneInactivationReason.LeadershipConflicts]:
    'Conflictos graves entre el supervisor y los discípulos o grupos familiares.',
  [ZoneInactivationReason.LeadershipIncapacity]:
    'Incapacidad del liderazgo para cumplir con las responsabilidades.',

  [ZoneInactivationReason.GeneralInactivity]:
    'Inactividad general en los grupos familiares.',
  [ZoneInactivationReason.LackOfParticipation]:
    'Falta de participación en actividades o eventos.',
  [ZoneInactivationReason.LowDiscipleCommitment]:
    'Bajo compromiso de los discípulos asignados.',

  [ZoneInactivationReason.FamilyGroupsDissolution]:
    'Disolución de la mayoría de los grupos familiares en la zona.',
  [ZoneInactivationReason.FamilyGroupsRelocation]:
    'Reubicación de los grupos familiares a otras zonas.',
  [ZoneInactivationReason.MemberLoss]:
    'Pérdida significativa de miembros en los grupos familiares.',

  [ZoneInactivationReason.DemographicChanges]:
    'Cambios demográficos significativos en el área geográfica (migración, urbanización, etc.).',
  [ZoneInactivationReason.LegalRestrictions]:
    'Restricciones legales o gubernamentales.',
  [ZoneInactivationReason.AccessIssues]:
    'Dificultades de acceso al área por problemas de infraestructura.',

  [ZoneInactivationReason.NaturalDisasters]:
    'Desastres naturales que afectan la operatividad de la zona.',
  [ZoneInactivationReason.HealthCrisis]:
    'Pandemias u otras crisis sanitarias que impiden el desarrollo de actividades.',
  [ZoneInactivationReason.ResourceShortage]:
    'Falta de recursos básicos en la zona (agua, electricidad, etc.).',
};
