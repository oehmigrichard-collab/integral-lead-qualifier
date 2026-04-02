import React, { useState, useEffect } from 'react';
import {
  X, Search, Trash2, ExternalLink, Building2, Calendar,
  TrendingUp, AlertTriangle, CheckCircle2, Clock, DollarSign,
  Download, ChevronDown, ChevronUp
} from 'lucide-react';
import { useHistoryStore, type SavedLead } from '../store/useHistoryStore.ts';
import { useLeadStore } from '../store/useLeadStore.ts';

function StatusBadge({ status, score }: { status: string; score: number }) {
  if (status === 'disqualified') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-danger/10 text-danger">
      <AlertTriangle size={10} /> Disqualifiziert
    </span>
  );
  if (score >= 70) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/10 text-success">
      <CheckCircle2 size={10} /> Hot Lead
    </span>
  );
  if (score >= 40) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-warning/10 text-warning">
      <Clock size={10} /> Follow-Up
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-outline-variant/20 text-on-surface-variant">
      <Clock size={10} /> In Bearbeitung
    </span>
  );
}

function LeadCard({ lead, onLoad, onDelete }: { lead: SavedLead; onLoad: () => void; onDelete: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const date = new Date(lead.savedAt);
  const dateStr = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="p-4 bg-surface-container-lowest rounded-lg border border-outline-variant/15 hover:border-secondary/30 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-sm truncate">{lead.companyName}</h4>
          <p className="text-[10px] text-on-surface-variant truncate">
            {lead.contactName}{lead.legalEntityType ? ` \u2022 ${lead.legalEntityType}` : ''}{lead.companyType ? ` \u2022 ${lead.companyType}` : ''}
          </p>
        </div>
        <StatusBadge status={lead.status} score={lead.prognoseScore} />
      </div>

      <div className="flex items-center gap-4 mb-3 text-[10px] text-on-surface-variant">
        <span className="flex items-center gap-1"><Calendar size={10} /> {dateStr} {timeStr}</span>
        <span className="flex items-center gap-1"><DollarSign size={10} /> {lead.totalMonthly.toLocaleString('de-DE')}\u20ac/M</span>
        {lead.prognoseScore > 0 && (
          <span className="flex items-center gap-1"><TrendingUp size={10} /> {lead.prognoseScore}%</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button onClick={onLoad} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-secondary text-white text-[10px] font-bold uppercase tracking-wider rounded hover:opacity-90 transition-opacity">
          <ExternalLink size={10} /> Laden
        </button>
        {!confirm ? (
          <button onClick={() => setConfirm(true)} className="px-3 py-1.5 text-danger/60 hover:text-danger hover:bg-danger/5 text-[10px] rounded transition-colors">
            <Trash2 size={12} />
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button onClick={onDelete} className="px-2 py-1.5 bg-danger text-white text-[10px] font-bold rounded hover:opacity-90">Ja</button>
            <button onClick={() => setConfirm(false)} className="px-2 py-1.5 text-[10px] text-on-surface-variant hover:bg-surface-container-low rounded">Nein</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LeadHistory() {
  const { leads, isLoading, showHistory, toggleHistory, loadLeads, deleteLead } = useHistoryStore();
  const leadStore = useLeadStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (showHistory) loadLeads();
  }, [showHistory]);

  const filtered = leads.filter(l =>
    !search || l.companyName.toLowerCase().includes(search.toLowerCase()) ||
    l.contactName.toLowerCase().includes(search.toLowerCase())
  );

  const handleLoad = (lead: SavedLead) => {
    // Restore all lead fields from saved data
    const data = lead.data;
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'setField' && key !== 'nextPhase' && key !== 'prevPhase' && key !== 'goToPhase' &&
          key !== 'setLanguage' && key !== 'disqualify' && key !== 'undoDisqualify' &&
          key !== 'recalculatePricing' && key !== 'addObjection' && key !== 'resetLead') {
        leadStore.setField(key, value);
      }
    });
    toggleHistory();
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(leads, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `integral-leads-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!showHistory) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={toggleHistory} />

      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-surface border-l border-outline-variant/20 shadow-2xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20 bg-surface-container-lowest">
          <div>
            <h2 className="font-headline text-xl font-bold">Lead-Verlauf</h2>
            <p className="text-[10px] text-on-surface-variant">{leads.length} gespeicherte Leads</p>
          </div>
          <div className="flex items-center gap-2">
            {leads.length > 0 && (
              <button onClick={handleExportJSON} className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-secondary border border-secondary/30 rounded hover:bg-secondary/5 transition-colors">
                <Download size={10} /> Export
              </button>
            )}
            <button onClick={toggleHistory} className="p-2 hover:bg-surface-container-low rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-outline-variant/10">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Suchen..."
              className="w-full pl-9 pr-4 py-2 bg-surface-container-low border-none rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-secondary"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Building2 size={32} className="mx-auto text-on-surface-variant/30 mb-3" />
              <p className="text-sm text-on-surface-variant">
                {search ? 'Keine Treffer.' : 'Noch keine Leads gespeichert.'}
              </p>
              <p className="text-[10px] text-on-surface-variant/60 mt-1">
                Leads werden in Phase 7 gespeichert.
              </p>
            </div>
          ) : (
            filtered.map(lead => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onLoad={() => handleLoad(lead)}
                onDelete={() => deleteLead(lead.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
