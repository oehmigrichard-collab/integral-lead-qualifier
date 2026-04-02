import React, { useState } from 'react';
import { Zap, CheckCircle2, XCircle, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { useLeadStore } from '../store/useLeadStore.ts';

export default function QuickCheck() {
  const [expanded, setExpanded] = useState(false);
  const s = useLeadStore();
  const lang = s.language;

  // Quick check fields - these map directly to store fields
  const entityOk = s.legalEntityType ? ['GmbH', 'UG', 'GmbH i.G.', 'UG i.G.'].includes(s.legalEntityType) : null;
  const cashOk = s.hasCash === null ? null : !s.hasCash;
  const ecomOk = s.hasEcommerce === null ? null : !s.hasEcommerce;
  const selfBookerOk = s.isSelfBooker === null ? null : !s.isSelfBooker;
  const liquidationOk = s.inLiquidation === null ? null : !s.inLiquidation;

  const checks = [
    { ok: entityOk, label: lang === 'de' ? 'Rechtsform' : 'Legal Entity', failReason: lang === 'de' ? 'Nur GmbH/UG' : 'GmbH/UG only' },
    { ok: cashOk, label: lang === 'de' ? 'Kein Bargeld' : 'No Cash', failReason: lang === 'de' ? 'Bargeldgeschäft' : 'Cash business' },
    { ok: ecomOk, label: lang === 'de' ? 'Kein E-Commerce' : 'No E-Commerce', failReason: lang === 'de' ? 'E-Commerce/Warenhandel' : 'E-Commerce/goods trade' },
    { ok: selfBookerOk, label: lang === 'de' ? 'Kein Selbstbucher' : 'Not Self-Booking', failReason: lang === 'de' ? 'Bucht selbst' : 'Self-booker' },
    { ok: liquidationOk, label: lang === 'de' ? 'Nicht in Liquidation' : 'Not in Liquidation', failReason: lang === 'de' ? 'In Liquidation' : 'In liquidation' },
  ];

  const answered = checks.filter(c => c.ok !== null).length;
  const failed = checks.filter(c => c.ok === false);
  const allPassed = answered === 5 && failed.length === 0;

  // Recovery paths for each failure
  const recoveryPaths: Record<string, { de: string; en: string; action: string }> = {
    'Rechtsform': { de: 'Aktuell nur GmbH/UG. Bei Interesse an Einzelunternehmen \u2192 Warteliste.', en: 'Currently GmbH/UG only. For sole proprietorships \u2192 waitlist.', action: 'waitlist' },
    'Legal Entity': { de: 'Aktuell nur GmbH/UG. Bei Interesse an Einzelunternehmen \u2192 Warteliste.', en: 'Currently GmbH/UG only. For sole proprietorships \u2192 waitlist.', action: 'waitlist' },
    'Kein Bargeld': { de: 'Bargeldgesch\u00e4fte k\u00f6nnen wir nicht abbilden. Empfehlung: klassische Kanzlei.', en: 'We cannot handle cash businesses. Recommendation: traditional firm.', action: 'referral' },
    'No Cash': { de: 'Bargeldgesch\u00e4fte k\u00f6nnen wir nicht abbilden. Empfehlung: klassische Kanzlei.', en: 'We cannot handle cash businesses. Recommendation: traditional firm.', action: 'referral' },
    'Kein E-Commerce': { de: 'E-Commerce mit Warenhandel ist noch nicht im Scope. Kommt in Q3 2026.', en: 'E-Commerce with goods trading not yet in scope. Coming Q3 2026.', action: 'waitlist' },
    'No E-Commerce': { de: 'E-Commerce mit Warenhandel ist noch nicht im Scope. Kommt in Q3 2026.', en: 'E-Commerce with goods trading not yet in scope. Coming Q3 2026.', action: 'waitlist' },
    'Kein Selbstbucher': { de: 'Integral \u00fcbernimmt die komplette Buchhaltung. Wer weiter selbst buchen will, braucht uns nicht.', en: 'Integral handles all bookkeeping. Self-bookers don\'t need our service.', action: 'educate' },
    'Not Self-Booking': { de: 'Integral \u00fcbernimmt die komplette Buchhaltung. Wer weiter selbst buchen will, braucht uns nicht.', en: 'Integral handles all bookkeeping. Self-bookers don\'t need our service.', action: 'educate' },
    'Nicht in Liquidation': { de: 'Gesellschaften in Liquidation k\u00f6nnen wir aktuell nicht betreuen. Partner-Kanzlei empfehlen.', en: 'We cannot service companies in liquidation. Recommend partner firm.', action: 'referral' },
    'Not in Liquidation': { de: 'Gesellschaften in Liquidation k\u00f6nnen wir aktuell nicht betreuen. Partner-Kanzlei empfehlen.', en: 'We cannot service companies in liquidation. Recommend partner firm.', action: 'referral' },
  };

  return (
    <div className="mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-bold transition-all ${
          allPassed ? 'bg-success/10 text-success border border-success/30' :
          failed.length > 0 ? 'bg-danger/10 text-danger border border-danger/30' :
          'bg-accent/10 text-accent border border-accent/30 hover:bg-accent/15'
        }`}
      >
        <div className="flex items-center gap-2">
          <Zap size={16} />
          <span>{lang === 'de' ? 'QUICK-CHECK' : 'QUICK CHECK'} (30 {lang === 'de' ? 'Sek.' : 'sec.'})</span>
          {answered > 0 && (
            <span className="text-[10px] font-normal ml-2">
              {allPassed ? (lang === 'de' ? '\u2014 Lead qualifiziert sich \u2713' : '\u2014 Lead qualifies \u2713') :
               failed.length > 0 ? `\u2014 ${failed.length} ${lang === 'de' ? 'Ausschluss' : 'exclusion'}${failed.length > 1 ? (lang === 'de' ? 'kriterien' : 's') : ''}` :
               `\u2014 ${answered}/5`}
            </span>
          )}
        </div>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div className="mt-3 p-5 bg-surface-container-lowest rounded-lg border border-outline-variant/15 animate-slide-in">
          {/* Quick questions grid */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-4">
            {/* 1. Entity Type */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                {entityOk === null ? <div className="w-4 h-4 rounded-full bg-outline-variant/30 shrink-0" /> : entityOk ? <CheckCircle2 size={14} className="text-success shrink-0" /> : <XCircle size={14} className="text-danger shrink-0" />}
                <span className="text-[10px] font-bold uppercase tracking-wider">{lang === 'de' ? 'Rechtsform' : 'Entity'}</span>
              </div>
              <select value={s.legalEntityType} onChange={e => s.setField('legalEntityType', e.target.value)} className="w-full px-2 py-1.5 bg-surface-container-low border-none rounded text-xs focus:outline-none focus:ring-1 focus:ring-secondary">
                <option value="">&mdash;</option>
                <option value="GmbH">GmbH</option>
                <option value="UG">UG</option>
                <option value="GmbH i.G.">GmbH i.G.</option>
                <option value="UG i.G.">UG i.G.</option>
                <option value="Andere">{lang === 'de' ? 'Andere' : 'Other'}</option>
              </select>
            </div>

            {/* 2-5. Toggle questions */}
            {[
              { field: 'hasCash', value: s.hasCash, label: lang === 'de' ? 'Bargeld?' : 'Cash?', ok: cashOk },
              { field: 'hasEcommerce', value: s.hasEcommerce, label: 'E-Commerce?', ok: ecomOk },
              { field: 'isSelfBooker', value: s.isSelfBooker, label: lang === 'de' ? 'Selbstbucher?' : 'Self-books?', ok: selfBookerOk },
              { field: 'inLiquidation', value: s.inLiquidation, label: 'Liquidation?', ok: liquidationOk },
            ].map(({ field, value, label, ok }) => (
              <div key={field} className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  {ok === null ? <div className="w-4 h-4 rounded-full bg-outline-variant/30 shrink-0" /> : ok ? <CheckCircle2 size={14} className="text-success shrink-0" /> : <XCircle size={14} className="text-danger shrink-0" />}
                  <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => s.setField(field, false)} className={`flex-1 py-1.5 text-[10px] font-bold rounded ${value === false ? 'bg-success/10 text-success border border-success' : 'bg-surface-container-low text-on-surface-variant'}`}>
                    {lang === 'de' ? 'Nein' : 'No'}
                  </button>
                  <button onClick={() => s.setField(field, true)} className={`flex-1 py-1.5 text-[10px] font-bold rounded ${value === true ? 'bg-danger/10 text-danger border border-danger' : 'bg-surface-container-low text-on-surface-variant'}`}>
                    {lang === 'de' ? 'Ja' : 'Yes'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Status bar */}
          {allPassed && (
            <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg border border-success/20">
              <CheckCircle2 size={16} className="text-success shrink-0" />
              <span className="text-sm font-medium text-success">{lang === 'de' ? 'Lead qualifiziert sich grunds\u00e4tzlich \u2014 weiter im Flow!' : 'Lead basically qualifies \u2014 continue the flow!'}</span>
            </div>
          )}

          {failed.length > 0 && (
            <div className="space-y-2">
              {failed.map((f, i) => {
                const recovery = recoveryPaths[f.label];
                const actionLabels: Record<string, { de: string; en: string; color: string }> = {
                  waitlist: { de: '\ud83d\udccb Auf Warteliste setzen', en: '\ud83d\udccb Add to waitlist', color: 'text-warning' },
                  referral: { de: '\ud83e\udd1d Partner-Kanzlei empfehlen', en: '\ud83e\udd1d Recommend partner firm', color: 'text-secondary' },
                  educate: { de: '\ud83d\udca1 Value Proposition erkl\u00e4ren', en: '\ud83d\udca1 Explain value proposition', color: 'text-secondary' },
                };
                const actionInfo = actionLabels[recovery?.action || 'referral'];
                return (
                  <div key={i} className="p-3 bg-danger/5 rounded-lg border border-danger/20">
                    <div className="flex items-start gap-2">
                      <XCircle size={14} className="text-danger shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-danger">{f.failReason}</p>
                        {recovery && (
                          <p className="text-[11px] text-on-surface-variant mt-1">{lang === 'de' ? recovery.de : recovery.en}</p>
                        )}
                        <div className="mt-2 flex items-center gap-1.5">
                          <ArrowRight size={10} className={actionInfo.color} />
                          <span className={`text-[10px] font-bold ${actionInfo.color}`}>{lang === 'de' ? actionInfo.de : actionInfo.en}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {answered > 0 && answered < 5 && failed.length === 0 && (
            <div className="flex items-center gap-2 p-3 bg-surface-container-low rounded-lg">
              <div className="flex gap-1">
                {checks.map((c, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${c.ok === true ? 'bg-success' : c.ok === false ? 'bg-danger' : 'bg-outline-variant/40'}`} />
                ))}
              </div>
              <span className="text-[10px] text-on-surface-variant">{answered}/5 {lang === 'de' ? 'beantwortet' : 'answered'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
