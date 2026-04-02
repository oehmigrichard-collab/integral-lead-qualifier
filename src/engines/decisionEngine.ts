export interface ExclusionResult {
  excluded: boolean;
  reasons: string[];
  flags: string[];
  exclusionCodes: string[];
}

export interface LeadData {
  legalEntityType: string;
  hrRegistered: boolean | null;
  gesellschaftsvertrag: boolean | null;
  isDigital: boolean | null;
  hasCash: boolean | null;
  hasEcommerce: boolean | null;
  hasFactoring: boolean | null;
  hasPOS: boolean | null;
  hasStocks: boolean | null;
  hasConstruction: boolean | null;
  hasExciseDuties: boolean | null;
  hasVatGroup: boolean | null;
  hasForeignMD: boolean | null;
  hasPhysicalRetail: boolean | null;
  hasNonCalendarFiscalYear: boolean | null;
  hasSensitiveBranch: boolean | null;
  hasPendingLawsuits: boolean | null;
  hasSecuritiesInPurpose: 'active' | 'passive' | null;
  hasGesellschaftsumwandlung: boolean | null;
  noGFInGermany: boolean | null;
  isSelfBooker: boolean | null;
  hasBacklogYears: string[];
  onlyJA: boolean | null;
  inLiquidation: boolean | null;
}

export function checkPhase2Exclusions(data: Partial<LeadData>): ExclusionResult {
  const reasons: string[] = [];
  const flags: string[] = [];
  const exclusionCodes: string[] = [];

  const validEntities = ['GmbH', 'UG', 'GmbH i.G.', 'UG i.G.'];
  if (data.legalEntityType && !validEntities.includes(data.legalEntityType)) {
    reasons.push('wrong_entity_type');
    exclusionCodes.push('wrong_entity_type');
  }

  if (data.hasCash === true) {
    reasons.push('cash_business');
    exclusionCodes.push('cash_business');
  }

  if (data.hasPOS === true) {
    reasons.push('pos');
    exclusionCodes.push('pos');
  }

  if (data.hasEcommerce === true) {
    reasons.push('ecommerce');
    exclusionCodes.push('ecommerce');
  }

  if (data.hasPhysicalRetail === true) {
    flags.push('physical_retail_waitlist');
  }

  if (data.hasFactoring === true) {
    reasons.push('factoring');
    exclusionCodes.push('factoring');
  }

  if (data.hrRegistered === false && data.gesellschaftsvertrag === false) {
    flags.push('not_founded');
  }

  return { excluded: reasons.length > 0, reasons, flags, exclusionCodes };
}

export function checkPhase3Exclusions(data: Partial<LeadData>): ExclusionResult {
  const reasons: string[] = [];
  const flags: string[] = [];
  const exclusionCodes: string[] = [];

  if (data.hasStocks === true) {
    reasons.push('stocks');
    exclusionCodes.push('stocks');
  }
  if (data.hasConstruction === true) {
    reasons.push('construction');
    exclusionCodes.push('construction');
  }
  if (data.hasExciseDuties === true) {
    reasons.push('excise_duties');
    exclusionCodes.push('excise_duties');
  }
  if (data.hasVatGroup === true) {
    reasons.push('vat_group');
    exclusionCodes.push('vat_group');
  }
  if (data.hasForeignMD === true || data.noGFInGermany === true) {
    reasons.push('foreign_md_residence');
    exclusionCodes.push('foreign_md_residence');
  }

  if (data.hasNonCalendarFiscalYear === true) {
    reasons.push('non_calendar_fiscal_year');
    exclusionCodes.push('non_calendar_fiscal_year');
  }

  if (data.hasSensitiveBranch === true) {
    reasons.push('sensitive_branch');
    exclusionCodes.push('sensitive_branch');
  }

  if (data.hasPendingLawsuits === true) {
    reasons.push('pending_lawsuits');
    exclusionCodes.push('pending_lawsuits');
  }

  if (data.hasSecuritiesInPurpose === 'active') {
    reasons.push('active_securities_trading');
    exclusionCodes.push('active_securities_trading');
  } else if (data.hasSecuritiesInPurpose === 'passive') {
    flags.push('securities_in_purpose_passive');
  }

  if (data.hasGesellschaftsumwandlung === true) {
    reasons.push('gesellschaftsumwandlung');
    exclusionCodes.push('gesellschaftsumwandlung');
  }

  return { excluded: reasons.length > 0, reasons, flags, exclusionCodes };
}

export function checkPhase4Exclusions(data: Partial<LeadData>): ExclusionResult {
  const reasons: string[] = [];
  const flags: string[] = [];
  const exclusionCodes: string[] = [];

  if (data.isSelfBooker === true) {
    reasons.push('self_booked');
    exclusionCodes.push('self_booked');
  }

  if (data.hasBacklogYears && (data.hasBacklogYears.includes('2023') || data.hasBacklogYears.includes('2024'))) {
    flags.push('backlog_years');
  }

  // 2025 JA: Allow for Q4 2025 Neugruendungen/Holdings with low volume
  if (data.hasBacklogYears && data.hasBacklogYears.includes('2025')) {
    flags.push('2025_ja_q4_neugruendung_check');
  }

  if (data.onlyJA === true) {
    reasons.push('ja_only_no_accounting');
    exclusionCodes.push('ja_only_no_accounting');
  }

  // GmbH i.G.: Transparenzregister is mandatory but they may not have one yet
  if (data.legalEntityType === 'GmbH i.G.' || data.legalEntityType === 'UG i.G.') {
    flags.push('transparenzregister_mandatory');
  }

  if (data.inLiquidation === true) {
    reasons.push('liquidation');
    exclusionCodes.push('liquidation');
  }

  return { excluded: reasons.length > 0, reasons, flags, exclusionCodes };
}

export function calculatePrognoseScore(data: {
  triggerEvent: string;
  personaSegment: string;
  revenueRange: string;
  hasVorberater: boolean;
  needsPayroll: boolean;
  totalMonthly: number;
  objectionCount: number;
  sentiment: number;
  hasBacklogYears: boolean;
  isBoth: boolean;
}): { score: number; factors: string[]; action: string } {
  let score = 50;
  const factors: string[] = [];

  if (data.triggerEvent === 'Company Foundation' || data.triggerEvent === 'Full Service/ All-in-One') {
    score += 20;
    factors.push('+20% Trigger Event (ideal)');
  }
  if (data.personaSegment === 'First-Time Founder') {
    score += 15;
    factors.push('+15% First-Time Founder');
  }
  if (['100k - 300k €', '300k - 750k €'].includes(data.revenueRange)) {
    score += 10;
    factors.push('+10% Sweet-Spot Umsatz');
  }
  if (data.hasVorberater) {
    score -= 10;
    factors.push('-10% Vorberater (Wechselhürde)');
  }
  if (data.needsPayroll) {
    score += 5;
    factors.push('+5% Payroll (höherer LTV)');
  }
  if (data.totalMonthly > 0 && data.totalMonthly < 300) {
    score += 15;
    factors.push('+15% Attraktiver Preis (<300€/Monat)');
  }
  if (data.objectionCount <= 1) {
    score += 10;
    factors.push('+10% Wenige Einwände');
  } else if (data.objectionCount >= 4) {
    score -= 15;
    factors.push('-15% Viele Einwände');
  }
  if (data.sentiment > 0) {
    score += Math.round((data.sentiment / 10) * 10);
    factors.push(`+${Math.round((data.sentiment / 10) * 10)}% Sentiment`);
  }
  if (data.hasBacklogYears) {
    score -= 20;
    factors.push('-20% Backlog-Jahre');
  }
  if (data.isBoth) {
    score += 10;
    factors.push('+10% OpCo + Holding');
  }

  score = Math.max(0, Math.min(100, score));

  let action: string;
  if (score >= 70) action = 'send_offer';
  else if (score >= 40) action = 'follow_up';
  else action = 'disqualify';

  return { score, factors, action };
}
