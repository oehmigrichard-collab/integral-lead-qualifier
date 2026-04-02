export interface ComplianceViolation {
  ruleId: string;
  severity: 'error' | 'warning';
  text: string;
  suggestion: string;
}

const BLACKLIST_DE: Array<{ pattern: RegExp; ruleId: string; suggestion: string }> = [
  { pattern: /wir beraten dich steuerlich/i, ruleId: 'C-001', suggestion: 'Über unsere Plattform hast du Zugang zu steuerlichen Dienstleistungen' },
  { pattern: /wir erstellen.*(jahresabschl|steuererklär)/i, ruleId: 'C-001', suggestion: 'Der Jahresabschluss wird durch die Integral Tax GmbH WPG erstellt' },
  { pattern: /wir sind dein steuerteam/i, ruleId: 'C-005', suggestion: 'Dein Steuerberater ist über die Plattform erreichbar' },
  { pattern: /wir sind günstiger als/i, ruleId: 'C-004', suggestion: 'Wir kombinieren moderne Technologie mit qualifizierter Beratung' },
  { pattern: /traditionelle steuerberater.*(veraltet|schlecht)/i, ruleId: 'C-004', suggestion: 'Unser Fokus liegt auf Qualität, Transparenz und digitaler Effizienz' },
  { pattern: /du bist bei uns steuerlich in guten händen/i, ruleId: 'C-005', suggestion: 'Die Integral Tax GmbH WPG betreut dich steuerlich auf unserer Plattform' },
  { pattern: /billigere? alternative/i, ruleId: 'C-004', suggestion: 'All-in-One: Plattform + lizenzierter Steuerberater, digital und effizient' },
  { pattern: /wir (machen|erledigen|übernehmen).*buchhaltung/i, ruleId: 'C-003', suggestion: 'Die Buchhaltung wird durch die Integral Tax GmbH WPG geführt' },
  { pattern: /wir bieten steuerberatung an/i, ruleId: 'C-005', suggestion: 'Über unsere Plattform hast du Zugang zu steuerlichen Dienstleistungen' },
  { pattern: /wir (reichen ein|erstellen|erledigen).*steuererklärung/i, ruleId: 'C-001', suggestion: 'Steuererklärungen werden durch die Integral Tax GmbH WPG eingereicht' },
];

const BLACKLIST_EN: Array<{ pattern: RegExp; ruleId: string; suggestion: string }> = [
  { pattern: /we (provide|offer) tax (advice|consulting)/i, ruleId: 'C-001', suggestion: 'Through our platform you have access to tax services' },
  { pattern: /we (prepare|create|file).*tax return/i, ruleId: 'C-001', suggestion: 'Tax returns are filed by Integral Tax GmbH WPG' },
  { pattern: /we are your tax team/i, ruleId: 'C-005', suggestion: 'Your tax advisor is accessible through the platform' },
  { pattern: /we are cheaper than/i, ruleId: 'C-004', suggestion: 'We combine modern technology with qualified advisory' },
  { pattern: /cheaper alternative/i, ruleId: 'C-004', suggestion: 'All-in-one: Platform + licensed tax advisor, digital and efficient' },
];

export function checkCompliance(text: string, lang: 'de' | 'en'): ComplianceViolation[] {
  const violations: ComplianceViolation[] = [];
  const blacklist = lang === 'de' ? BLACKLIST_DE : BLACKLIST_EN;

  for (const rule of blacklist) {
    if (rule.pattern.test(text)) {
      violations.push({
        ruleId: rule.ruleId,
        severity: 'error',
        text: text.match(rule.pattern)?.[0] || '',
        suggestion: rule.suggestion,
      });
    }
  }

  return violations;
}

export function calculateComplianceScore(
  disclaimerPlaced: boolean,
  violationCount: number,
  allExclusionsChecked: boolean,
): number {
  let score = 100;
  if (!disclaimerPlaced) score -= 30;
  score -= violationCount * 10;
  if (!allExclusionsChecked) score -= 20;
  return Math.max(0, Math.min(100, score));
}
