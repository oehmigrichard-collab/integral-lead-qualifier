import { create } from 'zustand';
import { calculatePricing, getRevenueRange, type PricingResult } from '../engines/pricingEngine.ts';

export interface LeadState {
  // Navigation
  currentPhase: number;
  language: 'de' | 'en';
  status: 'in_progress' | 'qualified' | 'disqualified';
  disqualifyReason: string;

  // Phase 1
  companyName: string;
  contactName: string;
  contactEmail: string;
  triggerEvent: string;
  businessDescription: string;
  companyPhase: string;
  personaSegment: string;
  dealSource: string;

  // Phase 2
  legalEntityType: string;
  hrRegistered: boolean | null;
  commercialRegisterNumber: string;
  gesellschaftsvertrag: boolean | null;
  hasCash: boolean | null;
  hasPOS: boolean | null;
  hasEcommerce: boolean | null;
  hasFactoring: boolean | null;

  // Phase 2 (additional)
  hasPhysicalRetail: boolean | null;

  // Phase 3
  hasStocks: boolean | null;
  hasConstruction: boolean | null;
  hasExciseDuties: boolean | null;
  hasVatGroup: boolean | null;
  hasForeignMD: boolean | null;
  hasNonCalendarFiscalYear: boolean | null;
  hasSensitiveBranch: boolean | null;
  hasPendingLawsuits: boolean | null;
  hasSecuritiesInPurpose: 'active' | 'passive' | null;
  hasGesellschaftsumwandlung: boolean | null;
  noGFInGermany: boolean | null;

  // Phase 4
  hasVorberater: boolean | null;
  accountingStartMonth: string;
  taxTakeover: string;
  annualStatementYears: string[];
  isSelfBooker: boolean | null;
  onlyJA: boolean | null;
  inLiquidation: boolean | null;

  // Phase 5
  companyType: string;
  expectedAnnualRevenue: string;
  jahresumsatzExakt: number;
  serviceNeeds: string;
  numberOfEmployees: number;
  payrollStartMonth: string;
  contractLanguage: string;

  // Phase 6
  pricingResult: PricingResult | null;

  // Phase 7
  sentiment: number;
  notes: string;
  dealSummary: string;
  prognoseScore: number;
  prognoseAction: string;
  prognoseFactors: string[];

  // Compliance
  disclaimerPlaced: boolean;
  complianceViolations: string[];
  exclusionCodes: string[];
  flags: string[];

  // Objections
  objections: Array<{ phase: number; text: string; category: string; resolved: boolean }>;

  // Actions
  setField: (field: string, value: any) => void;
  nextPhase: () => void;
  prevPhase: () => void;
  goToPhase: (phase: number) => void;
  setLanguage: (lang: 'de' | 'en') => void;
  disqualify: (reason: string) => void;
  undoDisqualify: () => void;
  recalculatePricing: () => void;
  addObjection: (phase: number, text: string, category: string) => void;
  resetLead: () => void;
}

const initialState = {
  currentPhase: 1,
  language: 'de' as const,
  status: 'in_progress' as const,
  disqualifyReason: '',
  companyName: '',
  contactName: '',
  contactEmail: '',
  triggerEvent: '',
  businessDescription: '',
  companyPhase: '',
  personaSegment: '',
  dealSource: '',
  legalEntityType: '',
  hrRegistered: null,
  commercialRegisterNumber: '',
  gesellschaftsvertrag: null,
  hasCash: null,
  hasPOS: null,
  hasEcommerce: null,
  hasFactoring: null,
  hasPhysicalRetail: null,
  hasStocks: null,
  hasConstruction: null,
  hasExciseDuties: null,
  hasVatGroup: null,
  hasForeignMD: null,
  hasNonCalendarFiscalYear: null,
  hasSensitiveBranch: null,
  hasPendingLawsuits: null,
  hasSecuritiesInPurpose: null,
  hasGesellschaftsumwandlung: null,
  noGFInGermany: null,
  hasVorberater: null,
  accountingStartMonth: '',
  taxTakeover: '',
  annualStatementYears: [] as string[],
  isSelfBooker: null,
  onlyJA: null,
  inLiquidation: null,
  companyType: '',
  expectedAnnualRevenue: '',
  jahresumsatzExakt: 0,
  serviceNeeds: '',
  numberOfEmployees: 0,
  payrollStartMonth: '',
  contractLanguage: 'German',
  pricingResult: null,
  sentiment: 5,
  notes: '',
  dealSummary: '',
  prognoseScore: 0,
  prognoseAction: '',
  prognoseFactors: [] as string[],
  disclaimerPlaced: false,
  complianceViolations: [] as string[],
  exclusionCodes: [] as string[],
  flags: [] as string[],
  objections: [] as Array<{ phase: number; text: string; category: string; resolved: boolean }>,
};

export const useLeadStore = create<LeadState>((set, get) => ({
  ...initialState,

  setField: (field, value) => set({ [field]: value } as any),

  nextPhase: () => set(s => ({ currentPhase: Math.min(s.currentPhase + 1, 7) })),

  prevPhase: () => set(s => ({ currentPhase: Math.max(s.currentPhase - 1, 1) })),

  goToPhase: (phase) => set({ currentPhase: Math.max(1, Math.min(7, phase)) }),

  setLanguage: (lang) => set({ language: lang }),

  disqualify: (reason) => set({ status: 'disqualified', disqualifyReason: reason }),

  undoDisqualify: () => set({ status: 'in_progress', disqualifyReason: '' }),

  recalculatePricing: () => {
    const s = get();
    const result = calculatePricing(
      s.jahresumsatzExakt,
      s.companyType,
      s.serviceNeeds,
      s.numberOfEmployees,
      s.taxTakeover,
    );
    const revenueRange = getRevenueRange(s.jahresumsatzExakt);
    set({ pricingResult: result, expectedAnnualRevenue: revenueRange });
  },

  addObjection: (phase, text, category) => set(s => ({
    objections: [...s.objections, { phase, text, category, resolved: false }],
  })),

  resetLead: () => set(initialState),
}));
