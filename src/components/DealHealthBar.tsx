import React, { useMemo } from 'react';
import { Heart, AlertTriangle, XCircle, TrendingUp } from 'lucide-react';
import { useLeadStore } from '../store/useLeadStore.ts';

export default function DealHealthBar() {
  const s = useLeadStore();
  const lang = s.language;

  const health = useMemo(() => {
    // Calculate aggregate health across all answered fields
    const issues: string[] = [];
    const positives: string[] = [];
    let answeredCount = 0;
    let totalChecks = 0;

    // Phase 2 checks
    const p2Fields = [
      { val: s.legalEntityType, check: () => ['GmbH', 'UG', 'GmbH i.G.', 'UG i.G.'].includes(s.legalEntityType), fail: lang === 'de' ? 'Rechtsform' : 'Entity' },
      { val: s.hasCash, check: () => s.hasCash === false, fail: lang === 'de' ? 'Bargeld' : 'Cash' },
      { val: s.hasPOS, check: () => s.hasPOS === false, fail: 'POS' },
      { val: s.hasEcommerce, check: () => s.hasEcommerce === false, fail: 'E-Commerce' },
      { val: s.hasFactoring, check: () => s.hasFactoring === false, fail: 'Factoring' },
    ];
    p2Fields.forEach(f => {
      totalChecks++;
      if (f.val !== null && f.val !== '') {
        answeredCount++;
        if (!f.check()) issues.push(f.fail);
        else positives.push(f.fail);
      }
    });

    // Phase 3 checks
    const p3Fields = [
      { val: s.hasStocks, check: () => s.hasStocks === false, fail: lang === 'de' ? 'Aktienhandel' : 'Stocks' },
      { val: s.hasConstruction, check: () => s.hasConstruction === false, fail: lang === 'de' ? 'Bau' : 'Construction' },
      { val: s.hasNonCalendarFiscalYear, check: () => s.hasNonCalendarFiscalYear === false, fail: lang === 'de' ? 'Abw. Wirtschaftsjahr' : 'Non-cal. FY' },
      { val: s.hasSensitiveBranch, check: () => s.hasSensitiveBranch === false, fail: lang === 'de' ? 'Sensible Branche' : 'Sensitive' },
      { val: s.hasPendingLawsuits, check: () => s.hasPendingLawsuits === false, fail: lang === 'de' ? 'Rechtsstreit' : 'Lawsuits' },
      { val: s.noGFInGermany, check: () => s.noGFInGermany === false, fail: lang === 'de' ? 'Kein GF in DE' : 'No MD in DE' },
    ];
    p3Fields.forEach(f => {
      totalChecks++;
      if (f.val !== null) {
        answeredCount++;
        if (!f.check()) issues.push(f.fail);
        else positives.push(f.fail);
      }
    });

    // Phase 4 checks
    const p4Fields = [
      { val: s.isSelfBooker, check: () => s.isSelfBooker === false, fail: lang === 'de' ? 'Selbstbucher' : 'Self-booker' },
      { val: s.onlyJA, check: () => s.onlyJA === false, fail: lang === 'de' ? 'Nur JA' : 'JA only' },
      { val: s.inLiquidation, check: () => s.inLiquidation === false, fail: 'Liquidation' },
    ];
    p4Fields.forEach(f => {
      totalChecks++;
      if (f.val !== null) {
        answeredCount++;
        if (!f.check()) issues.push(f.fail);
        else positives.push(f.fail);
      }
    });

    // Positive signals
    if (s.triggerEvent === 'Company Foundation' || s.triggerEvent === 'Full Service/ All-in-One') {
      positives.push(lang === 'de' ? 'Ideal-Trigger' : 'Ideal trigger');
    }
    if (s.companyType === 'Both') {
      positives.push('OpCo + Holding');
    }
    if (s.serviceNeeds.includes('Payroll')) {
      positives.push('Payroll');
    }

    const healthPercent = answeredCount > 0
      ? Math.round((positives.length / (positives.length + issues.length)) * 100)
      : -1; // -1 means no data yet

    return { issues, positives, healthPercent, answeredCount, totalChecks };
  }, [s.legalEntityType, s.hasCash, s.hasPOS, s.hasEcommerce, s.hasFactoring, s.hasStocks, s.hasConstruction, s.hasNonCalendarFiscalYear, s.hasSensitiveBranch, s.hasPendingLawsuits, s.noGFInGermany, s.isSelfBooker, s.onlyJA, s.inLiquidation, s.triggerEvent, s.companyType, s.serviceNeeds, lang]);

  if (s.status === 'disqualified') return null;

  const { issues, positives, healthPercent, answeredCount } = health;

  // Determine visual state
  const barColor = healthPercent === -1 ? 'bg-outline-variant/30' :
    issues.length === 0 ? 'bg-success' :
    healthPercent >= 70 ? 'bg-warning' :
    'bg-danger';

  const textColor = healthPercent === -1 ? 'text-on-surface-variant' :
    issues.length === 0 ? 'text-success' :
    healthPercent >= 70 ? 'text-warning' :
    'text-danger';

  const Icon = healthPercent === -1 ? Heart :
    issues.length === 0 ? TrendingUp :
    healthPercent >= 70 ? AlertTriangle :
    XCircle;

  const label = healthPercent === -1
    ? (lang === 'de' ? 'Deal-Status: Noch keine Daten' : 'Deal status: No data yet')
    : issues.length === 0
      ? (lang === 'de' ? `Deal-Health: Alle ${answeredCount} Checks bestanden` : `Deal health: All ${answeredCount} checks passed`)
      : (lang === 'de' ? `Deal-Health: ${issues.length} Problem${issues.length > 1 ? 'e' : ''} (${issues.join(', ')})` : `Deal health: ${issues.length} issue${issues.length > 1 ? 's' : ''} (${issues.join(', ')})`);

  return (
    <div className="px-6 py-1.5 flex items-center gap-3 border-b border-outline-variant/10">
      <Icon size={12} className={textColor} />
      <div className="flex-1 h-1.5 bg-outline-variant/15 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: healthPercent === -1 ? '0%' : `${healthPercent}%` }}
        />
      </div>
      <span className={`text-[9px] font-bold tracking-wider uppercase whitespace-nowrap ${textColor}`}>{label}</span>
      {positives.length > 0 && (
        <span className="text-[9px] text-success hidden lg:inline">+{positives.length} \u2713</span>
      )}
    </div>
  );
}
