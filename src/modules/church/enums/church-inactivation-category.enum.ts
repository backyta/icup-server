export enum ChurchInactivationCategory {
  Administrative = 'administrative',
  NaturalCircumstances = 'natural_circumstances',
  CommunityRelatedIssues = 'community_related_issues',
  FinancialChallenges = 'financial_challenges',
  LegalOrRegulatoryIssues = 'legal_or_regulatory_issues',
  StrategicDecisions = 'strategic_decisions',
  ExternalFactors = 'external_factors',
}

export const ChurchInactivationCategoryNames: Record<
  ChurchInactivationCategory,
  string
> = {
  [ChurchInactivationCategory.Administrative]: 'Razones Administrativas',
  [ChurchInactivationCategory.NaturalCircumstances]:
    'Razones naturales o inesperadas',
  [ChurchInactivationCategory.CommunityRelatedIssues]:
    'Razones relacionados con la comunidad',
  [ChurchInactivationCategory.FinancialChallenges]: 'Razones económicas',
  [ChurchInactivationCategory.LegalOrRegulatoryIssues]:
    'Razones legales o normativas',
  [ChurchInactivationCategory.StrategicDecisions]: 'Razones estratégicas',
  [ChurchInactivationCategory.ExternalFactors]: 'Razones por factores externos',
};
