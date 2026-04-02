import { create } from 'zustand';
import { encrypt, decrypt } from '../utils/crypto.ts';
import { useAuthStore } from './useAuthStore.ts';

export interface SavedLead {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  legalEntityType: string;
  companyType: string;
  status: string;
  prognoseScore: number;
  totalMonthly: number;
  totalYear1: number;
  savedAt: string;
  phase: number;
  data: Record<string, any>; // full lead state snapshot
}

interface HistoryState {
  leads: SavedLead[];
  isLoading: boolean;
  showHistory: boolean;
  loadLeads: () => Promise<void>;
  saveLead: (leadData: Record<string, any>, pricingData: { totalMonthly: number; totalYear1: number }) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  toggleHistory: () => void;
}

const STORAGE_KEY = 'integral_leads_encrypted';

export const useHistoryStore = create<HistoryState>((set, get) => ({
  leads: [],
  isLoading: false,
  showHistory: false,

  loadLeads: async () => {
    const password = useAuthStore.getState().password;
    if (!password) return;
    set({ isLoading: true });
    try {
      const encrypted = localStorage.getItem(STORAGE_KEY);
      if (!encrypted) { set({ leads: [], isLoading: false }); return; }
      const json = await decrypt(encrypted, password);
      const leads = JSON.parse(json) as SavedLead[];
      leads.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
      set({ leads, isLoading: false });
    } catch {
      set({ leads: [], isLoading: false });
    }
  },

  saveLead: async (leadData, pricingData) => {
    const password = useAuthStore.getState().password;
    if (!password) return;
    const existing = get().leads;
    const newLead: SavedLead = {
      id: crypto.randomUUID(),
      companyName: leadData.companyName || 'Unbenannt',
      contactName: leadData.contactName || '',
      contactEmail: leadData.contactEmail || '',
      legalEntityType: leadData.legalEntityType || '',
      companyType: leadData.companyType || '',
      status: leadData.status || 'in_progress',
      prognoseScore: leadData.prognoseScore || 0,
      totalMonthly: pricingData.totalMonthly,
      totalYear1: pricingData.totalYear1,
      savedAt: new Date().toISOString(),
      phase: leadData.currentPhase || 1,
      data: { ...leadData },
    };
    const updated = [newLead, ...existing];
    const json = JSON.stringify(updated);
    const encrypted = await encrypt(json, password);
    localStorage.setItem(STORAGE_KEY, encrypted);
    set({ leads: updated });
  },

  deleteLead: async (id) => {
    const password = useAuthStore.getState().password;
    if (!password) return;
    const updated = get().leads.filter(l => l.id !== id);
    const json = JSON.stringify(updated);
    const encrypted = await encrypt(json, password);
    localStorage.setItem(STORAGE_KEY, encrypted);
    set({ leads: updated });
  },

  toggleHistory: () => set(s => ({ showHistory: !s.showHistory })),
}));
