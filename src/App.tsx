import React, { useState, useMemo, useCallback } from 'react';
import {
  ChevronRight, ChevronLeft, AlertTriangle, CheckCircle2, XCircle, Shield,
  MessageSquare, TrendingUp, Users, Building2, FileText, DollarSign,
  Globe, RotateCcw, ChevronDown, ChevronUp, Info, Zap, Target,
  ArrowRight, Clock, Star, AlertOctagon, Sparkles, BarChart3,
  Presentation, Monitor, Play, BookOpen, History, Save, LogOut
} from 'lucide-react';
import { useLeadStore } from './store/useLeadStore.ts';
import { useAuthStore } from './store/useAuthStore.ts';
import { useHistoryStore } from './store/useHistoryStore.ts';
import AuthGate from './components/AuthGate.tsx';
import LeadHistory from './components/LeadHistory.tsx';
import DemoSlides from './components/DemoSlides.tsx';
import QuickCheck from './components/QuickCheck.tsx';
import DealHealthBar from './components/DealHealthBar.tsx';
import { checkPhase2Exclusions, checkPhase3Exclusions, checkPhase4Exclusions, calculatePrognoseScore } from './engines/decisionEngine.ts';
import { calculatePricing, getRevenueRange } from './engines/pricingEngine.ts';
import { de } from './i18n/de.ts';
import { en } from './i18n/en.ts';
import type { Translations } from './i18n/de.ts';

function useT(): Translations { return useLeadStore(s => s.language) === 'de' ? de : en; }

// ─── Reusable Components ────────────────
function Toggle({ value, onChange, dangerMode = true }: { value: boolean | null; onChange: (v: boolean) => void; dangerMode?: boolean }) {
  const t = useT();
  return (
    <div className="flex items-center gap-3">
      <button onClick={() => onChange(false)} className={`px-4 py-2 rounded-l-md text-sm font-medium transition-all ${value === false ? (dangerMode ? 'bg-success/10 text-success border border-success' : 'bg-secondary/10 text-secondary border border-secondary') : 'bg-surface-container-low text-on-surface-variant border border-outline-variant/30'}`}>{t.common.no}</button>
      <button onClick={() => onChange(true)} className={`px-4 py-2 rounded-r-md text-sm font-medium transition-all ${value === true ? (dangerMode ? 'bg-danger/10 text-danger border border-danger' : 'bg-secondary/10 text-secondary border border-secondary') : 'bg-surface-container-low text-on-surface-variant border border-outline-variant/30'}`}>{t.common.yes}</button>
    </div>
  );
}

function QuestionRow({ label, children, status, hint }: { label: string; children: React.ReactNode; status?: 'ok' | 'warn' | 'danger' | null; hint?: string }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-start gap-3 py-4 border-b border-outline-variant/15 last:border-b-0">
      <div className="lg:w-[55%]">
        <div className="flex items-center gap-2">
          {status === 'ok' && <CheckCircle2 size={16} className="text-success shrink-0" />}
          {status === 'warn' && <AlertTriangle size={16} className="text-warning shrink-0" />}
          {status === 'danger' && <XCircle size={16} className="text-danger shrink-0" />}
          {!status && <div className="w-4 h-4 rounded-full bg-outline-variant/30 shrink-0" />}
          <span className="text-sm font-medium">{label}</span>
        </div>
        {hint && <p className="text-[10px] text-on-surface-variant mt-1 ml-6 italic">{hint}</p>}
      </div>
      <div className="lg:w-[45%]">{children}</div>
    </div>
  );
}

function ExclusionBanner({ text, type = 'danger' }: { text: string; type?: 'danger' | 'warning' | 'info' }) {
  const colors = type === 'danger' ? 'bg-danger/10 border-danger/30 text-danger' : type === 'warning' ? 'bg-warning/10 border-warning/30 text-warning' : 'bg-secondary/10 border-secondary/30 text-secondary';
  const Icon = type === 'danger' ? XCircle : type === 'warning' ? AlertTriangle : Info;
  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${colors} animate-slide-in`}>
      <Icon size={18} className="shrink-0 mt-0.5" />
      <p className="text-sm font-medium">{text}</p>
    </div>
  );
}

function ObjectionPanel({ objections }: { objections: Array<{ trigger: string; response: string }> }) {
  const [open, setOpen] = useState<number | null>(null);
  const t = useT();
  return (
    <div className="space-y-2">
      <h4 className="font-label tracking-widest text-[10px] uppercase text-secondary font-bold mb-3">{t.common.objections}</h4>
      {objections.map((obj, i) => (
        <div key={i} className="border border-outline-variant/20 rounded-lg overflow-hidden">
          <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-3 text-left hover:bg-surface-container-low/50 transition-colors">
            <span className="text-xs font-semibold text-on-surface pr-2">"{obj.trigger}"</span>
            {open === i ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {open === i && (
            <div className="px-3 pb-3 animate-slide-in">
              <div className="p-3 bg-secondary/5 rounded border-l-2 border-secondary">
                <p className="text-xs text-on-surface-variant leading-relaxed italic">{obj.response}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Pitch Components ──────────────
function PitchCard({ t }: { t: Translations }) {
  const [showPitch, setShowPitch] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [showSection, setShowSection] = useState<Record<string, boolean>>({});
  const toggleSection = (key: string) => setShowSection(prev => ({ ...prev, [key]: !prev[key] }));
  const p = t.pitch as any;
  const lang = useLeadStore(s => s.language);
  return (
    <div className="mb-6">
      <button onClick={() => setShowPitch(!showPitch)} className="flex items-center gap-2 px-4 py-2.5 bg-primary-container text-white text-xs font-bold uppercase tracking-widest rounded hover:opacity-90 transition-opacity">
        <Presentation size={14} />
        {showPitch ? 'Pitch ausblenden' : 'Integral Pitch anzeigen'}
        {showPitch ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {showPitch && (
        <div className="mt-4 space-y-4 animate-slide-in">
          <div className="p-5 bg-surface-container-lowest rounded-lg border border-outline-variant/15">
            <p className="text-sm italic text-on-surface-variant mb-4">"{t.pitch.integralIntro}"</p>

            {p.painPointsTitle && (
              <div className="mb-5">
                <button onClick={() => toggleSection('pain')} className="flex items-center gap-2 text-sm font-bold text-danger mb-2">
                  <AlertTriangle size={14} /> {p.painPointsTitle} {showSection.pain ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
                {showSection.pain && p.painPoints && (
                  <div className="space-y-2 ml-5 animate-slide-in">
                    {p.painPoints.map((pt: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-on-surface-variant"><XCircle size={12} className="text-danger shrink-0 mt-0.5" /><span>{pt}</span></div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <h4 className="font-headline text-lg font-bold mb-3">{t.pitch.platformTitle}</h4>
            <img src="https://cdn.prod.website-files.com/679897a4319b9ce027491552/697b8756cd4a1847984b29cd_ffc8cb20e94816f98905409f1e56e0cd_home-mockup-en.png" alt="Integral Platform" className="w-full rounded-lg shadow-lg mb-4 border border-outline-variant/10" />
            <div className="space-y-2 mb-4">
              {t.pitch.platformPoints.map((pt, i) => (
                <div key={i} className="flex items-start gap-2 text-sm"><CheckCircle2 size={14} className="text-success shrink-0 mt-0.5" /><span>{pt}</span></div>
              ))}
            </div>
            <div className="p-4 bg-secondary/5 rounded border-l-3 border-secondary">
              <p className="text-xs text-on-surface-variant italic leading-relaxed">{t.pitch.rolesExplainer}</p>
            </div>
          </div>

          {p.howItWorksTitle && (
            <div className="p-5 bg-surface-container-lowest rounded-lg border border-outline-variant/15">
              <button onClick={() => toggleSection('how')} className="flex items-center gap-2 font-headline text-lg font-bold mb-3 w-full text-left">
                {p.howItWorksTitle} {showSection.how ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {showSection.how && p.howItWorks && (
                <div className="animate-slide-in">
                  <img src="https://cdn.prod.website-files.com/679897a4319b9ce027491552/6978bf3b6fa7a4189466cf4e_start-mockup-integral-en.avif" alt="Onboarding Flow" className="w-full rounded-lg shadow-md mb-4 border border-outline-variant/10" />
                  <div className="space-y-2">
                    {p.howItWorks.map((step: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm"><ArrowRight size={14} className="text-secondary shrink-0 mt-0.5" /><span>{step}</span></div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {p.comparisonTitle && p.comparison && (
            <div className="p-5 bg-surface-container-lowest rounded-lg border border-outline-variant/15">
              <button onClick={() => toggleSection('compare')} className="flex items-center gap-2 font-headline text-lg font-bold mb-3 w-full text-left">
                {p.comparisonTitle} {showSection.compare ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {showSection.compare && (
                <div className="overflow-x-auto animate-slide-in">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-outline-variant/20">
                      {p.comparison.headers.map((h: string, i: number) => (
                        <th key={i} className={`py-2 px-3 text-left font-bold ${i === 2 ? 'text-secondary' : ''}`}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {p.comparison.rows.map((row: string[], i: number) => (
                        <tr key={i} className="border-b border-outline-variant/10">
                          {row.map((cell: string, j: number) => (
                            <td key={j} className={`py-2 px-3 ${j === 0 ? 'font-medium' : ''} ${j === 2 ? 'text-secondary font-medium' : ''}`}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {p.teamTitle && p.team && (
            <div className="p-5 bg-surface-container-lowest rounded-lg border border-outline-variant/15">
              <button onClick={() => toggleSection('team')} className="flex items-center gap-2 font-headline text-lg font-bold mb-3 w-full text-left">
                <Users size={16} /> {p.teamTitle} {showSection.team ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {showSection.team && (
                <div className="animate-slide-in">
                  <img src="https://cdn.prod.website-files.com/679897a4319b9ce027491552/69788126cc01c56a06cf4ad6_integral-team-1080.avif" alt="Integral Team" className="w-full rounded-lg shadow-md mb-4" />
                  <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
                    {[
                      { img: 'https://cdn.prod.website-files.com/679897a4319b9ce027491552/67a4c22feba17dd378ef8f29_327288099c1f4df2a418d9ba6424c78d_LukasZ%C3%B6rner.avif', name: 'Lukas Zörner', role: 'CEO' },
                      { img: 'https://cdn.prod.website-files.com/679897a4319b9ce027491552/6968ae485d88403f5a663222_40a14e9514bb8681b727f6c62703bf1b_Darleen-headshot.avif', name: 'Darleen Warda', role: 'MD' },
                      { img: 'https://cdn.prod.website-files.com/679897a4319b9ce027491552/6968ae49da209248603b775a_5ad58d4a3bb0d3a6caab44022bc4fdf0_Anil-headshot.avif', name: 'Anil Can Baykal', role: 'MD' },
                      { img: 'https://cdn.prod.website-files.com/679897a4319b9ce027491552/696f7dedec3df950d52ac643_daniel-headshot-2.avif', name: 'Daniel Knödler', role: 'WP/Tax' },
                      { img: 'https://cdn.prod.website-files.com/679897a4319b9ce027491552/6968ae4811aad016182e80f2_9395b06829acd82e1f2b39276694fb87_Fabian-headshot.avif', name: 'Fabian Sommer', role: 'CFO' },
                    ].map((m, i) => (
                      <div key={i} className="flex flex-col items-center shrink-0">
                        <img src={m.img} alt={m.name} className="w-14 h-14 rounded-full object-cover border-2 border-accent/30 mb-1" />
                        <span className="text-[10px] font-bold text-center">{m.name}</span>
                        <span className="text-[9px] text-on-surface-variant">{m.role}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {p.team.map((member: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm"><Star size={14} className="text-accent shrink-0 mt-0.5" /><span>{member}</span></div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="p-5 bg-surface-container-lowest rounded-lg border border-outline-variant/15">
            <h4 className="font-label tracking-widest text-[10px] uppercase text-secondary font-bold mb-3">Integrationen</h4>
            <div className="flex flex-wrap gap-4 items-center">
              {[
                'https://cdn.prod.website-files.com/679897a4319b9ce027491552/69789204366010a27172590b_integration-logo-qonto.avif',
                'https://cdn.prod.website-files.com/679897a4319b9ce027491552/6978878e60faca4157cef528_integration-logo-stripe.avif',
                'https://cdn.prod.website-files.com/679897a4319b9ce027491552/69789204a197ef7f65dff5e1_integration-logo-paypal.avif',
                'https://cdn.prod.website-files.com/679897a4319b9ce027491552/69789204a95d77abf9589f38_integration-logo-finom.avif',
                'https://cdn.prod.website-files.com/679897a4319b9ce027491552/697892042f37fd4fb8ccc352_integration-logo-sparkasse.avif',
                'https://cdn.prod.website-files.com/679897a4319b9ce027491552/69789204dd883917b6d01a32_integration-logo-deutsche-bank.avif',
                'https://cdn.prod.website-files.com/679897a4319b9ce027491552/697892047b34eadf67cb641c_integration-logo-ing.avif',
                'https://cdn.prod.website-files.com/679897a4319b9ce027491552/69789204a928eb8d5036d3e7_integration-logo-cleverlohn.avif',
              ].map((url, i) => (
                <img key={i} src={url} alt="" className="h-7 object-contain opacity-70 hover:opacity-100 transition-opacity" />
              ))}
            </div>
          </div>

          <div className="p-5 bg-surface-container-lowest rounded-lg border border-outline-variant/15">
            <h4 className="font-headline text-lg font-bold mb-3">{t.pitch.whyIntegral}</h4>
            <div className="space-y-2">
              {t.pitch.whyPoints.map((pt, i) => (
                <div key={i} className="flex items-start gap-2 text-sm"><Star size={14} className="text-accent shrink-0 mt-0.5" /><span>{pt}</span></div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button onClick={() => setShowDemo(true)} className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-white text-xs font-bold rounded hover:opacity-90">
              <Monitor size={14} /> {t.pitch.demoTransition}
            </button>
            <button onClick={() => setShowDemo(true)} className="flex items-center gap-2 px-4 py-2.5 border border-secondary text-secondary text-xs font-bold rounded hover:bg-secondary/5">
              <Play size={14} /> {t.pitch.slidesTransition}
            </button>
          </div>
          {showDemo && <DemoSlides isOpen={showDemo} onClose={() => setShowDemo(false)} language={lang} />}
        </div>
      )}
    </div>
  );
}

// ─── Layout ─────────────────────────────
function Sidebar() {
  const t = useT();
  const { currentPhase, goToPhase, language, setLanguage, resetLead, status } = useLeadStore();
  const phases = [t.nav.warmUp, t.nav.exclusionGate, t.nav.taxComplexity, t.nav.situation, t.nav.serviceNeeds, t.nav.pricing, t.nav.close];
  const icons = [Zap, Shield, FileText, Building2, Users, DollarSign, Target];

  return (
    <aside className="fixed left-0 top-0 h-screen w-16 lg:w-60 bg-navy flex flex-col z-50">
      <div className="px-4 lg:px-6 py-6">
        <img src="https://cdn.prod.website-files.com/679897a4319b9ce027491552/69788b3d0c8d07768ff7f251_integral-logo-v02.svg" alt="Integral" className="h-6 brightness-0 invert hidden lg:block" />
        <p className="font-label tracking-wider text-[10px] uppercase text-slate-400 mt-2 hidden lg:block">{t.sidebar.subtitle}</p>
      </div>
      <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
        {phases.map((name, i) => {
          const Icon = icons[i]; const isActive = currentPhase === i + 1; const isPast = currentPhase > i + 1;
          return (
            <button key={i} onClick={() => status !== 'disqualified' && goToPhase(i + 1)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-left ${isActive ? 'bg-white/10 text-white border-r-3 border-accent' : isPast ? 'text-slate-300 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${isActive ? 'bg-accent text-white' : isPast ? 'bg-success/80 text-white' : 'bg-white/10 text-slate-400'}`}>
                {isPast ? <CheckCircle2 size={12} /> : i + 1}
              </div>
              <span className="hidden lg:block font-label tracking-wider text-[10px] uppercase truncate">{name}</span>
            </button>
          );
        })}
      </nav>
      <div className="p-3 space-y-2 border-t border-white/10">
        <div className="flex gap-1 px-1">
          <button onClick={() => setLanguage('de')} className={`flex-1 py-1.5 text-[10px] font-bold rounded ${language === 'de' ? 'bg-accent text-white' : 'text-slate-400 hover:text-white'}`}>DE</button>
          <button onClick={() => setLanguage('en')} className={`flex-1 py-1.5 text-[10px] font-bold rounded ${language === 'en' ? 'bg-accent text-white' : 'text-slate-400 hover:text-white'}`}>EN</button>
        </div>
        <button onClick={() => useHistoryStore.getState().toggleHistory()} className="w-full py-2.5 bg-white/10 text-white font-label tracking-wider text-[10px] uppercase rounded-sm hover:bg-white/15 transition-colors flex items-center justify-center gap-2">
          <History size={12} /><span className="hidden lg:inline">Lead-Verlauf</span>
        </button>
        <button onClick={resetLead} className="w-full py-2.5 bg-secondary text-white font-label tracking-wider text-[10px] uppercase rounded-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
          <RotateCcw size={12} /><span className="hidden lg:inline">{t.sidebar.startCall}</span>
        </button>
        <button onClick={() => useAuthStore.getState().logout()} className="w-full py-2 text-slate-500 hover:text-slate-300 font-label tracking-wider text-[10px] uppercase rounded-sm transition-colors flex items-center justify-center gap-2">
          <LogOut size={10} /><span className="hidden lg:inline">Abmelden</span>
        </button>
      </div>
    </aside>
  );
}

function ProgressBar() {
  const t = useT();
  const { currentPhase } = useLeadStore();
  const phases = [t.nav.warmUp, t.nav.exclusionGate, t.nav.taxComplexity, t.nav.situation, t.nav.serviceNeeds, t.nav.pricing, t.nav.close];
  return (
    <div className="flex items-center gap-1 px-6 py-3 bg-surface-container-lowest border-b border-outline-variant/20">
      {phases.map((name, i) => (
        <React.Fragment key={i}>
          <div className={`flex items-center gap-1.5 ${i + 1 <= currentPhase ? 'text-secondary' : 'text-on-surface-variant/40'}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${i + 1 < currentPhase ? 'bg-success text-white' : i + 1 === currentPhase ? 'bg-secondary text-white' : 'bg-outline-variant/20'}`}>
              {i + 1 < currentPhase ? <CheckCircle2 size={10} /> : i + 1}
            </div>
            <span className="hidden xl:inline text-[9px] font-label tracking-wider uppercase">{name}</span>
          </div>
          {i < 6 && <div className={`flex-1 h-0.5 rounded ${i + 1 < currentPhase ? 'bg-success' : 'bg-outline-variant/20'}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function ComplianceBanner() {
  const t = useT();
  const { disclaimerPlaced, setField, currentPhase } = useLeadStore();
  if (currentPhase > 6 && disclaimerPlaced) return null;
  return (
    <div className={`flex items-center justify-between px-6 py-2 ${disclaimerPlaced ? 'bg-success/10' : 'bg-warning/10'}`}>
      <div className="flex items-center gap-2">
        <Shield size={14} className={disclaimerPlaced ? 'text-success' : 'text-warning'} />
        <span className="text-xs font-medium">{disclaimerPlaced ? t.compliance.disclaimerPlaced : t.compliance.disclaimerNotPlaced}</span>
      </div>
      {!disclaimerPlaced && (
        <button onClick={() => setField('disclaimerPlaced', true)} className="text-[10px] font-bold text-secondary hover:underline uppercase tracking-wider">{t.compliance.markAsPlaced}</button>
      )}
    </div>
  );
}

function PhaseWrapper({ children, title, subtitle, duration, objections, showPitch }: {
  children: React.ReactNode; title: string; subtitle: string; duration: string;
  objections?: Array<{ trigger: string; response: string }>; showPitch?: boolean;
}) {
  const t = useT();
  const { currentPhase, nextPhase, prevPhase, status } = useLeadStore();
  return (
    <div className="flex gap-6 p-6 lg:p-8 max-w-full">
      <div className="flex-1 min-w-0">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-secondary bg-secondary/10 px-2 py-0.5 rounded">{t.common.phase} {currentPhase} {t.common.of} 7</span>
            <span className="text-[10px] text-on-surface-variant flex items-center gap-1"><Clock size={10} />{duration}</span>
          </div>
          <h2 className="font-headline text-3xl font-bold tracking-tight mb-2">{title}</h2>
          <p className="text-on-surface-variant text-sm">{subtitle}</p>
        </div>
        {showPitch && <PitchCard t={t} />}
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/15 p-6 mb-6">{children}</div>
        {status !== 'disqualified' && (
          <div className="flex justify-between items-center">
            <button onClick={prevPhase} disabled={currentPhase === 1} className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-on-surface-variant hover:text-on-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft size={16} /> {t.common.back}
            </button>
            <button onClick={nextPhase} disabled={currentPhase === 7} className="flex items-center gap-2 px-6 py-2.5 bg-secondary text-white text-sm font-semibold rounded-sm hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              {t.common.next} <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
      {objections && objections.length > 0 && (
        <div className="hidden xl:block w-72 shrink-0">
          <div className="sticky top-4">
            <ObjectionPanel objections={objections} />
            <div className="mt-6 p-4 bg-primary-container rounded-lg">
              <h4 className="font-label tracking-widest text-[10px] uppercase text-accent font-bold mb-2">{t.common.compliance}</h4>
              <p className="text-[11px] text-on-primary-container leading-relaxed">{t.compliance.reminder}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Phase 1: Warm-Up + Integral Pitch ──
function Phase1() {
  const t = useT(); const s = useLeadStore();
  const inferPersona = useCallback((phase: string, trigger: string) => {
    if (phase === 'new' || trigger === 'Company Foundation') return 'First-Time Founder';
    if (phase === 'growth' || phase === 'established') return 'Größere Unternehmen';
    return 'Kleine Unternehmen';
  }, []);
  const persona = inferPersona(s.companyPhase, s.triggerEvent);
  const personaData = t.phase1.personas[persona as keyof typeof t.phase1.personas];

  return (
    <PhaseWrapper title={t.phase1.title} subtitle={t.phase1.subtitle} duration={t.phase1.duration} objections={t.phase1.objections} showPitch={true}>
      <QuickCheck />
      <div className="p-4 bg-secondary/5 rounded-lg border-l-3 border-secondary mb-6">
        <p className="text-sm italic text-on-surface-variant leading-relaxed">"{t.phase1.opening}"</p>
      </div>
      <div className="space-y-1">
        <QuestionRow label={t.common.companyName}>
          <input type="text" value={s.companyName} onChange={e => s.setField('companyName', e.target.value)} className="w-full px-3 py-2 bg-surface-container-low border-none rounded text-sm focus:outline-none focus:ring-1 focus:ring-secondary" placeholder="z.B. TechVenture GmbH" />
        </QuestionRow>
        <QuestionRow label={t.common.contactName}>
          <input type="text" value={s.contactName} onChange={e => s.setField('contactName', e.target.value)} className="w-full px-3 py-2 bg-surface-container-low border-none rounded text-sm focus:outline-none focus:ring-1 focus:ring-secondary" />
        </QuestionRow>
        <QuestionRow label={t.common.contactEmail}>
          <input type="email" value={s.contactEmail} onChange={e => s.setField('contactEmail', e.target.value)} className="w-full px-3 py-2 bg-surface-container-low border-none rounded text-sm focus:outline-none focus:ring-1 focus:ring-secondary" />
        </QuestionRow>
        <QuestionRow label={t.phase1.q1}>
          <select value={s.triggerEvent} onChange={e => s.setField('triggerEvent', e.target.value)} className="w-full px-3 py-2 bg-surface-container-low border-none rounded text-sm focus:outline-none focus:ring-1 focus:ring-secondary">
            <option value="">{t.common.selectOption}</option>
            {Object.entries(t.phase1.triggerEvents).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </QuestionRow>
        <QuestionRow label={t.phase1.q2}>
          <textarea value={s.businessDescription} onChange={e => s.setField('businessDescription', e.target.value)} rows={2} className="w-full px-3 py-2 bg-surface-container-low border-none rounded text-sm focus:outline-none focus:ring-1 focus:ring-secondary resize-none" />
        </QuestionRow>
        <QuestionRow label={t.phase1.q3}>
          <select value={s.companyPhase} onChange={e => { s.setField('companyPhase', e.target.value); s.setField('personaSegment', inferPersona(e.target.value, s.triggerEvent)); }} className="w-full px-3 py-2 bg-surface-container-low border-none rounded text-sm focus:outline-none focus:ring-1 focus:ring-secondary">
            <option value="">{t.common.selectOption}</option>
            {Object.entries(t.phase1.phases).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </QuestionRow>
      </div>
      {personaData && s.companyPhase && (
        <div className="mt-6 p-4 bg-tertiary-fixed rounded-lg animate-slide-in">
          <div className="flex items-center gap-2 mb-2"><Sparkles size={14} className="text-secondary" /><span className="text-[10px] uppercase font-bold tracking-widest text-secondary">{personaData.label}</span></div>
          <p className="text-xs text-on-surface-variant mb-3">{personaData.description}</p>
          <div className="space-y-1">
            {personaData.usps.map((usp, i) => <div key={i} className="flex items-center gap-2 text-xs"><CheckCircle2 size={12} className="text-success shrink-0" /><span>{usp}</span></div>)}
          </div>
        </div>
      )}
    </PhaseWrapper>
  );
}

// ─── Phase 2: Hard Exclusion Gate ───────
function Phase2() {
  const t = useT(); const s = useLeadStore();
  const lang = s.language;
  const result = useMemo(() => checkPhase2Exclusions({
    legalEntityType: s.legalEntityType, hrRegistered: s.hrRegistered, gesellschaftsvertrag: s.gesellschaftsvertrag,
    hasCash: s.hasCash, hasPOS: s.hasPOS, hasEcommerce: s.hasEcommerce, hasFactoring: s.hasFactoring,
    hasPhysicalRetail: s.hasPhysicalRetail,
  }), [s.legalEntityType, s.hrRegistered, s.gesellschaftsvertrag, s.hasCash, s.hasPOS, s.hasEcommerce, s.hasFactoring, s.hasPhysicalRetail]);

  const entityStatus = !s.legalEntityType ? null : ['GmbH', 'UG', 'GmbH i.G.', 'UG i.G.'].includes(s.legalEntityType) ? 'ok' : 'danger';

  return (
    <PhaseWrapper title={t.phase2.title} subtitle={t.phase2.subtitle} duration={t.phase2.duration} objections={t.phase2.objections}>
      <p className="text-sm text-on-surface-variant mb-4 italic">"{t.phase2.intro}"</p>
      <div className="space-y-1">
        <QuestionRow label={t.phase2.q1} status={entityStatus as any}>
          <select value={s.legalEntityType} onChange={e => s.setField('legalEntityType', e.target.value)} className="w-full px-3 py-2 bg-surface-container-low border-none rounded text-sm focus:outline-none focus:ring-1 focus:ring-secondary">
            <option value="">{t.common.selectOption}</option>
            {t.phase2.entities.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </QuestionRow>

        {['GmbH', 'UG', 'GmbH i.G.', 'UG i.G.'].includes(s.legalEntityType) && (
          <>
            <QuestionRow label={t.phase2.q2} status={s.hrRegistered === null ? null : s.hrRegistered ? 'ok' : (s.gesellschaftsvertrag === false ? 'warn' : 'ok')}>
              <Toggle value={s.hrRegistered} onChange={v => s.setField('hrRegistered', v)} dangerMode={false} />
            </QuestionRow>
            {s.hrRegistered === true && (
              <QuestionRow label={t.phase2.q2c}>
                <input type="text" value={s.commercialRegisterNumber} onChange={e => s.setField('commercialRegisterNumber', e.target.value)} className="w-full px-3 py-2 bg-surface-container-low border-none rounded text-sm focus:outline-none focus:ring-1 focus:ring-secondary" placeholder="HRB 123456" />
              </QuestionRow>
            )}
            {s.hrRegistered === false && (
              <QuestionRow label={t.phase2.q2b} status={s.gesellschaftsvertrag === null ? null : s.gesellschaftsvertrag ? 'ok' : 'warn'}>
                <Toggle value={s.gesellschaftsvertrag} onChange={v => s.setField('gesellschaftsvertrag', v)} dangerMode={false} />
              </QuestionRow>
            )}
            {['GmbH i.G.', 'UG i.G.'].includes(s.legalEntityType) && (
              <ExclusionBanner text={t.pitch.transparenzregisterHint} type="info" />
            )}
          </>
        )}

        <QuestionRow label={t.phase2.q4} status={s.hasCash === null ? null : s.hasCash ? 'danger' : 'ok'}>
          <Toggle value={s.hasCash} onChange={v => s.setField('hasCash', v)} />
        </QuestionRow>
        <QuestionRow label={t.phase2.q3} status={s.hasPOS === null ? null : s.hasPOS ? 'danger' : 'ok'}>
          <Toggle value={s.hasPOS} onChange={v => s.setField('hasPOS', v)} />
        </QuestionRow>
        <QuestionRow label={t.phase2.q5} status={s.hasEcommerce === null ? null : s.hasEcommerce ? 'danger' : 'ok'} hint="Inkl. Warenhandel (Shopify, Amazon, Etsy, WooCommerce)">
          <Toggle value={s.hasEcommerce} onChange={v => s.setField('hasEcommerce', v)} />
        </QuestionRow>
        <QuestionRow label="Einzelhandel mit physischen Gütern?" status={s.hasPhysicalRetail === null ? null : s.hasPhysicalRetail ? 'warn' : 'ok'} hint="z.B. Lager, Versand physischer Produkte — aktuell Waitlist">
          <Toggle value={s.hasPhysicalRetail} onChange={v => s.setField('hasPhysicalRetail', v)} />
        </QuestionRow>
        <QuestionRow label={t.phase2.q6} status={s.hasFactoring === null ? null : s.hasFactoring ? 'danger' : 'ok'}>
          <Toggle value={s.hasFactoring} onChange={v => s.setField('hasFactoring', v)} />
        </QuestionRow>
      </div>

      <div className="mt-4 space-y-2">
        {result.reasons.map(r => <ExclusionBanner key={r} text={(t.phase2.exclusions as any)[r] || r} />)}
        {result.flags.map(f => <ExclusionBanner key={f} text={(t.phase2.exclusions as any)[f] || f} type="warning" />)}
        {s.hasPhysicalRetail === true && <ExclusionBanner text={(t.phase2.exclusions as any).physical_retail} type="warning" />}
      </div>

      {!result.excluded && (t.pitch as any).notARedFlagTitle && (
        <div className="mt-4 p-4 bg-success/5 rounded-lg border border-success/20">
          <h5 className="text-xs font-bold text-success uppercase tracking-wider mb-2 flex items-center gap-1"><CheckCircle2 size={12} /> {(t.pitch as any).notARedFlagTitle}</h5>
          <div className="space-y-1">
            {((t.pitch as any).notARedFlag || []).map((item: string, i: number) => (
              <div key={i} className="flex items-center gap-2 text-xs text-on-surface-variant"><CheckCircle2 size={10} className="text-success shrink-0" /><span>{item}</span></div>
            ))}
          </div>
        </div>
      )}

      {result.excluded && (
        <div className="mt-6 space-y-3">
          <div className="p-4 bg-danger/5 border border-danger/20 rounded-lg">
            <p className="text-sm italic text-on-surface-variant mb-3">"{t.phase2.disqualifyScript}"</p>
            <button onClick={() => s.disqualify(result.reasons[0])} className="px-4 py-2 bg-danger text-white text-sm font-medium rounded hover:opacity-90">{t.common.disqualify}</button>
          </div>
          <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-lg">
            <h5 className="text-xs font-bold text-secondary uppercase tracking-wider mb-2 flex items-center gap-1">{lang === 'de' ? 'Statt Disqualifizieren \u2014 Recovery-Optionen' : 'Instead of Disqualifying \u2014 Recovery Options'}</h5>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-xs text-on-surface-variant">
                <span className="text-secondary font-bold shrink-0">{'\ud83d\udccb'}</span>
                <span>{lang === 'de' ? 'Warteliste: "Wir erweitern st\u00e4ndig unseren Scope. Darf ich dich auf die Warteliste setzen und melden, sobald wir das abdecken k\u00f6nnen?"' : 'Waitlist: "We are constantly expanding our scope. May I add you to the waitlist and notify you as soon as we can cover this?"'}</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-on-surface-variant">
                <span className="text-secondary font-bold shrink-0">{'\ud83e\udd1d'}</span>
                <span>{lang === 'de' ? 'Partner-Referral: "Ich kenne eine Kanzlei die genau daf\u00fcr spezialisiert ist. Soll ich den Kontakt herstellen?"' : 'Partner Referral: "I know a firm that specializes in exactly this. Shall I make the introduction?"'}</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-on-surface-variant">
                <span className="text-secondary font-bold shrink-0">{'\ud83d\udd04'}</span>
                <span>{lang === 'de' ? 'Teilservice: "Vielleicht k\u00f6nnen wir zumindest die Holding/Lohn abdecken, auch wenn das OpCo nicht passt?"' : 'Partial Service: "Perhaps we can at least cover the holding/payroll, even if the OpCo doesn\'t fit?"'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </PhaseWrapper>
  );
}

// ─── Phase 3: Tax Complexity (Expanded) ─
function Phase3() {
  const t = useT(); const s = useLeadStore();
  const lang = s.language;
  const result = useMemo(() => checkPhase3Exclusions({
    hasStocks: s.hasStocks, hasConstruction: s.hasConstruction, hasExciseDuties: s.hasExciseDuties,
    hasVatGroup: s.hasVatGroup, hasForeignMD: s.hasForeignMD, hasNonCalendarFiscalYear: s.hasNonCalendarFiscalYear,
    hasSensitiveBranch: s.hasSensitiveBranch, hasPendingLawsuits: s.hasPendingLawsuits,
    hasSecuritiesInPurpose: s.hasSecuritiesInPurpose, hasGesellschaftsumwandlung: s.hasGesellschaftsumwandlung,
    noGFInGermany: s.noGFInGermany,
  }), [s.hasStocks, s.hasConstruction, s.hasExciseDuties, s.hasVatGroup, s.hasForeignMD, s.hasNonCalendarFiscalYear, s.hasSensitiveBranch, s.hasPendingLawsuits, s.hasSecuritiesInPurpose, s.hasGesellschaftsumwandlung, s.noGFInGermany]);

  const allFields = [s.hasStocks, s.hasConstruction, s.hasExciseDuties, s.hasVatGroup, s.hasNonCalendarFiscalYear, s.hasSensitiveBranch, s.hasPendingLawsuits, s.hasSecuritiesInPurpose, s.hasGesellschaftsumwandlung, s.noGFInGermany];
  const allAnswered = allFields.every(v => v !== null);
  const allClear = allAnswered && !result.excluded && result.flags.length === 0;

  return (
    <PhaseWrapper title={t.phase3.title} subtitle={t.phase3.subtitle} duration="4–6 Minuten" objections={t.phase3.objections}>
      <p className="text-sm text-on-surface-variant mb-4 italic">"{t.phase3.intro}"</p>
      <div className="space-y-1">
        <QuestionRow label={t.phase3.q1} status={s.hasStocks === null ? null : s.hasStocks ? 'danger' : 'ok'}>
          <Toggle value={s.hasStocks} onChange={v => s.setField('hasStocks', v)} />
        </QuestionRow>
        <QuestionRow label={t.phase3.q9} status={s.hasSecuritiesInPurpose === null ? null : s.hasSecuritiesInPurpose === 'active' ? 'danger' : s.hasSecuritiesInPurpose === 'passive' ? 'warn' : 'ok'}
          hint="Krypto, Wertpapiere, o.Ä. im Unternehmensgegenstand">
          <div className="flex flex-wrap gap-2">
            {Object.entries(t.phase3.q9options).map(([k, v]) => (
              <button key={k} onClick={() => s.setField('hasSecuritiesInPurpose', k === 'no' ? null : k)}
                className={`px-3 py-1.5 text-xs font-medium rounded ${s.hasSecuritiesInPurpose === k || (k === 'no' && s.hasSecuritiesInPurpose === null) ? (k === 'active' ? 'bg-danger/10 text-danger border border-danger' : k === 'passive' ? 'bg-warning/10 text-warning border border-warning' : 'bg-success/10 text-success border border-success') : 'bg-surface-container-low'}`}>
                {v}
              </button>
            ))}
          </div>
        </QuestionRow>
        <QuestionRow label={t.phase3.q2} status={s.hasConstruction === null ? null : s.hasConstruction ? 'danger' : 'ok'}>
          <Toggle value={s.hasConstruction} onChange={v => s.setField('hasConstruction', v)} />
        </QuestionRow>
        <QuestionRow label={t.phase3.q3} status={s.hasExciseDuties === null ? null : s.hasExciseDuties ? 'danger' : 'ok'}>
          <Toggle value={s.hasExciseDuties} onChange={v => s.setField('hasExciseDuties', v)} />
        </QuestionRow>
        <QuestionRow label={t.phase3.q4} status={s.hasVatGroup === null ? null : s.hasVatGroup ? 'danger' : 'ok'}>
          <Toggle value={s.hasVatGroup} onChange={v => s.setField('hasVatGroup', v)} />
        </QuestionRow>
        <QuestionRow label={t.phase3.q6} status={s.hasNonCalendarFiscalYear === null ? null : s.hasNonCalendarFiscalYear ? 'danger' : 'ok'}
          hint="Abweichendes Wirtschaftsjahr = Ausschluss">
          <Toggle value={s.hasNonCalendarFiscalYear} onChange={v => s.setField('hasNonCalendarFiscalYear', v)} />
        </QuestionRow>
        <QuestionRow label={t.phase3.q7} status={s.hasSensitiveBranch === null ? null : s.hasSensitiveBranch ? 'danger' : 'ok'}
          hint="Waffen, Drogen, Glücksspiel, Prostitution, ethisch/regulatorisch hochsensibel">
          <Toggle value={s.hasSensitiveBranch} onChange={v => s.setField('hasSensitiveBranch', v)} />
        </QuestionRow>
        <QuestionRow label={t.phase3.q8} status={s.hasPendingLawsuits === null ? null : s.hasPendingLawsuits ? 'danger' : 'ok'}
          hint="Gegen Gesellschaft, GF oder Gesellschafter">
          <Toggle value={s.hasPendingLawsuits} onChange={v => s.setField('hasPendingLawsuits', v)} />
        </QuestionRow>
        <QuestionRow label={t.phase3.q10} status={s.hasGesellschaftsumwandlung === null ? null : s.hasGesellschaftsumwandlung ? 'danger' : 'ok'}>
          <Toggle value={s.hasGesellschaftsumwandlung} onChange={v => s.setField('hasGesellschaftsumwandlung', v)} />
        </QuestionRow>
        <QuestionRow label={t.phase3.q11} status={s.noGFInGermany === null ? null : s.noGFInGermany ? 'danger' : 'ok'}
          hint="Mind. 1 GF muss Wohnsitz in DE haben">
          <Toggle value={s.noGFInGermany} onChange={v => s.setField('noGFInGermany', v)} />
        </QuestionRow>
      </div>

      <div className="mt-4 space-y-2">
        {allClear && (
          <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg border border-success/20 animate-slide-in">
            <CheckCircle2 size={16} className="text-success" /><span className="text-sm font-medium text-success">{t.phase3.allClear}</span>
          </div>
        )}
        {result.reasons.map(r => <ExclusionBanner key={r} text={(t.phase3.exclusions as any)[r] || (t.phase3.exclusions as any)[r.replace('active_securities_trading', 'securities_active')] || r} />)}
        {result.flags.map(f => <ExclusionBanner key={f} text={(t.phase3.exclusions as any)[f.replace('securities_in_purpose_passive', 'securities_passive')] || f} type="warning" />)}
      </div>

      {result.excluded && (
        <div className="mt-4 space-y-3">
          <button onClick={() => s.disqualify(result.reasons[0])} className="px-4 py-2 bg-danger text-white text-sm font-medium rounded hover:opacity-90">{t.common.disqualify}</button>
          <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-lg">
            <h5 className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">{lang === 'de' ? 'Recovery-Tipp' : 'Recovery Tip'}</h5>
            <p className="text-xs text-on-surface-variant">{lang === 'de' ? '"Ich verstehe, dass das gerade nicht passt. Zwei Optionen: Ich kann Sie auf unsere Warteliste setzen \u2014 wir erweitern kontinuierlich. Oder ich empfehle Ihnen eine Partner-Kanzlei, die genau das abdeckt. Was klingt besser?"' : '"I understand this doesn\'t fit right now. Two options: I can add you to our waitlist \u2014 we\'re continuously expanding. Or I can recommend a partner firm that covers exactly this. What sounds better?"'}</p>
          </div>
        </div>
      )}
    </PhaseWrapper>
  );
}

// ─── Phase 4: Situationsanalyse ─────────
function Phase4() {
  const t = useT(); const s = useLeadStore();
  const lang = s.language;
  const result = useMemo(() => checkPhase4Exclusions({
    isSelfBooker: s.isSelfBooker, hasBacklogYears: s.annualStatementYears, onlyJA: s.onlyJA, inLiquidation: s.inLiquidation,
  }), [s.isSelfBooker, s.annualStatementYears, s.onlyJA, s.inLiquidation]);

  return (
    <PhaseWrapper title={t.phase4.title} subtitle={t.phase4.subtitle} duration={t.phase4.duration} objections={t.phase4.objections}>
      <div className="space-y-1">
        <QuestionRow label={t.phase4.q1}>
          <Toggle value={s.hasVorberater} onChange={v => { s.setField('hasVorberater', v); s.setField('taxTakeover', v ? 'Tax Advisor Takeover by Integral' : ''); }} dangerMode={false} />
        </QuestionRow>

        {s.hasVorberater === true && (
          <>
            <QuestionRow label={t.phase4.q2a}>
              <input type="month" value={s.accountingStartMonth} onChange={e => s.setField('accountingStartMonth', e.target.value)} className="w-full px-3 py-2 bg-surface-container-low border-none rounded text-sm focus:outline-none focus:ring-1 focus:ring-secondary" />
            </QuestionRow>
            <div className="p-3 bg-tertiary-fixed/50 rounded my-2"><p className="text-xs text-on-surface-variant italic">{t.phase4.vorberaterInfo}</p></div>
          </>
        )}

        {s.hasVorberater === false && (
          <>
            <QuestionRow label={t.phase4.q2b}>
              <Toggle value={s.taxTakeover === 'Tax Registration by Client'} onChange={v => s.setField('taxTakeover', v ? 'Tax Registration by Client' : 'Tax Registration by Integral')} dangerMode={false} />
            </QuestionRow>
            <div className="p-3 bg-tertiary-fixed/50 rounded my-2">
              <p className="text-xs text-on-surface-variant italic">{t.phase4.neugruendungInfo}</p>
              {s.taxTakeover === 'Tax Registration by Integral' && <p className="text-xs font-semibold text-secondary mt-1">+ 550€ Steuerliche Einrichtung</p>}
            </div>
          </>
        )}

        <QuestionRow label={t.phase4.q3}>
          <div className="flex flex-wrap gap-2">
            {['2025', '2026'].map(year => (
              <button key={year} onClick={() => { const years = s.annualStatementYears.includes(year) ? s.annualStatementYears.filter(y => y !== year) : [...s.annualStatementYears, year]; s.setField('annualStatementYears', years); }}
                className={`px-3 py-1.5 text-xs font-medium rounded ${s.annualStatementYears.includes(year) ? 'bg-secondary text-white' : 'bg-surface-container-low text-on-surface-variant'}`}>
                {year}
              </button>
            ))}
          </div>
        </QuestionRow>
        {s.annualStatementYears.includes('2025') && (
          <ExclusionBanner text={t.pitch.ja2025Hint} type="info" />
        )}

        <QuestionRow label={t.phase4.q4} status={s.isSelfBooker === null ? null : s.isSelfBooker ? 'danger' : 'ok'}>
          <div className="flex gap-2">
            <button onClick={() => s.setField('isSelfBooker', false)} className={`px-3 py-2 text-xs font-medium rounded ${s.isSelfBooker === false ? 'bg-success/10 text-success border border-success' : 'bg-surface-container-low'}`}>{t.phase4.bookerOptions.advisor}</button>
            <button onClick={() => s.setField('isSelfBooker', true)} className={`px-3 py-2 text-xs font-medium rounded ${s.isSelfBooker === true ? 'bg-danger/10 text-danger border border-danger' : 'bg-surface-container-low'}`}>{t.phase4.bookerOptions.self}</button>
          </div>
        </QuestionRow>
        <QuestionRow label={t.phase4.q5} status={s.onlyJA === null ? null : s.onlyJA ? 'danger' : 'ok'}>
          <Toggle value={s.onlyJA} onChange={v => s.setField('onlyJA', v)} />
        </QuestionRow>
        <QuestionRow label={t.phase4.q6} status={s.inLiquidation === null ? null : s.inLiquidation ? 'danger' : 'ok'}>
          <Toggle value={s.inLiquidation} onChange={v => s.setField('inLiquidation', v)} />
        </QuestionRow>
      </div>

      <div className="mt-4 space-y-2">
        {result.reasons.map(r => <ExclusionBanner key={r} text={(t.phase4.exclusions as any)[r] || r} />)}
        {result.flags.map(f => <ExclusionBanner key={f} text={(t.phase4.exclusions as any)[f] || f} type="warning" />)}
      </div>
      {result.excluded && (
        <div className="mt-4 space-y-3">
          <button onClick={() => s.disqualify(result.reasons[0])} className="px-4 py-2 bg-danger text-white text-sm font-medium rounded hover:opacity-90">{t.common.disqualify}</button>
          <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-lg">
            <h5 className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">{lang === 'de' ? 'Recovery-Tipp' : 'Recovery Tip'}</h5>
            <p className="text-xs text-on-surface-variant">{lang === 'de' ? '"Das ist kein endg\u00fcltiges Nein \u2014 die Situation kann sich \u00e4ndern. Darf ich mich in 6 Monaten nochmal melden? Und falls Sie jemanden kennen der eine GmbH gr\u00fcndet oder einen Steuerberater sucht \u2014 wir freuen uns \u00fcber jede Empfehlung."' : '"This isn\'t a final no \u2014 the situation can change. May I follow up in 6 months? And if you know someone founding a GmbH or looking for a tax advisor \u2014 we appreciate every referral."'}</p>
          </div>
        </div>
      )}
    </PhaseWrapper>
  );
}

// ─── Phase 5: Service Needs + Payroll Pitch ─
function Phase5() {
  const t = useT(); const s = useLeadStore();
  const needsPayroll = s.serviceNeeds.includes('Payroll');
  return (
    <PhaseWrapper title={t.phase5.title} subtitle={t.phase5.subtitle} duration={t.phase5.duration} objections={t.phase5.objections}>
      <div className="space-y-1">
        <QuestionRow label={t.phase5.q1}>
          <select value={s.companyType} onChange={e => s.setField('companyType', e.target.value)} className="w-full px-3 py-2 bg-surface-container-low border-none rounded text-sm focus:outline-none focus:ring-1 focus:ring-secondary">
            <option value="">{t.common.selectOption}</option>
            {Object.entries(t.phase5.companyTypes).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </QuestionRow>
        {s.companyType === 'Both' && <ExclusionBanner text={t.phase5.bothAlert} type="warning" />}

        {s.companyType && s.companyType !== 'Holding' && (
          <QuestionRow label={t.phase5.q2}>
            <div className="space-y-2">
              <input type="range" min="0" max="5000000" step="10000" value={s.jahresumsatzExakt} onChange={e => s.setField('jahresumsatzExakt', parseInt(e.target.value))} className="w-full accent-secondary" />
              <div className="flex items-center gap-2">
                <input type="number" value={s.jahresumsatzExakt || ''} onChange={e => s.setField('jahresumsatzExakt', parseInt(e.target.value) || 0)} className="w-32 px-3 py-1.5 bg-surface-container-low border-none rounded text-sm focus:outline-none focus:ring-1 focus:ring-secondary" placeholder="€" />
                <span className="text-xs text-on-surface-variant bg-surface-container-low px-2 py-1 rounded">{getRevenueRange(s.jahresumsatzExakt)}</span>
              </div>
            </div>
          </QuestionRow>
        )}

        <QuestionRow label={t.phase5.q3}>
          <select value={s.serviceNeeds} onChange={e => s.setField('serviceNeeds', e.target.value)} className="w-full px-3 py-2 bg-surface-container-low border-none rounded text-sm focus:outline-none focus:ring-1 focus:ring-secondary">
            <option value="">{t.common.selectOption}</option>
            {Object.entries(t.phase5.serviceOptions).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </QuestionRow>

        {needsPayroll && (
          <>
            <div className="p-4 bg-secondary/5 rounded-lg border-l-3 border-secondary my-3">
              <h4 className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Payroll mit Integral</h4>
              <p className="text-xs text-on-surface-variant italic mb-2">{t.pitch.payrollPitch}</p>
              <p className="text-xs text-on-surface-variant italic">{t.pitch.payrollWhyIntegral}</p>
              <p className="text-[10px] text-secondary font-semibold mt-2">Immer 25€/Payslip über cleverlohn — fester Preis, keine Ausnahmen.</p>
              {(t.pitch as any).payrollFeatures && (
                <div className="mt-2 p-3 bg-surface-container-low rounded">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">Leistungsumfang Lohn</p>
                  <div className="space-y-1">
                    {(t.pitch as any).payrollFeatures.map((f: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs"><CheckCircle2 size={10} className="text-success shrink-0" /><span>{f}</span></div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <QuestionRow label={t.phase5.q4}>
              <input type="number" value={s.numberOfEmployees || ''} onChange={e => s.setField('numberOfEmployees', parseInt(e.target.value) || 0)} className="w-24 px-3 py-2 bg-surface-container-low border-none rounded text-sm focus:outline-none focus:ring-1 focus:ring-secondary" min="0" />
            </QuestionRow>
            {s.numberOfEmployees >= 5 && <ExclusionBanner text={t.phase5.payrollFlag} type="warning" />}
            <QuestionRow label={t.phase5.q5}>
              <input type="month" value={s.payrollStartMonth} onChange={e => s.setField('payrollStartMonth', e.target.value)} className="w-full px-3 py-2 bg-surface-container-low border-none rounded text-sm focus:outline-none focus:ring-1 focus:ring-secondary" />
            </QuestionRow>
          </>
        )}

        <QuestionRow label={t.phase5.q6}>
          <div className="flex gap-2">
            <button onClick={() => s.setField('contractLanguage', 'German')} className={`px-4 py-2 text-xs font-medium rounded flex items-center gap-1 ${s.contractLanguage === 'German' ? 'bg-secondary text-white' : 'bg-surface-container-low'}`}><Globe size={12} /> Deutsch</button>
            <button onClick={() => s.setField('contractLanguage', 'English')} className={`px-4 py-2 text-xs font-medium rounded flex items-center gap-1 ${s.contractLanguage === 'English' ? 'bg-secondary text-white' : 'bg-surface-container-low'}`}><Globe size={12} /> English</button>
          </div>
        </QuestionRow>
      </div>
    </PhaseWrapper>
  );
}

// ─── Phase 6: Pricing + Closing Pitch ───
function Phase6() {
  const t = useT(); const s = useLeadStore();
  const lang = s.language;
  const pricing = useMemo(() => calculatePricing(s.jahresumsatzExakt, s.companyType, s.serviceNeeds, s.numberOfEmployees, s.taxTakeover), [s.jahresumsatzExakt, s.companyType, s.serviceNeeds, s.numberOfEmployees, s.taxTakeover]);
  const needsPayroll = s.serviceNeeds.includes('Payroll');

  function PriceRow({ label, provider, amount, period }: { label: string; provider?: string; amount: number; period: string }) {
    return (
      <div className="flex items-center justify-between py-3 border-b border-outline-variant/10 last:border-b-0">
        <div><p className="text-sm font-medium">{label}</p>{provider && <p className="text-[10px] text-on-surface-variant italic">{provider}</p>}</div>
        <div className="text-right"><span className="text-lg font-bold text-secondary">{amount.toLocaleString('de-DE')}€</span><span className="text-[10px] text-on-surface-variant ml-1">{period}</span></div>
      </div>
    );
  }

  return (
    <PhaseWrapper title={t.phase6.title} subtitle={t.phase6.subtitle} duration={t.phase6.duration} objections={t.phase6.objections}>
      <div className="p-4 bg-secondary/5 rounded-lg border-l-3 border-secondary mb-4">
        <p className="text-sm italic text-on-surface-variant leading-relaxed mb-2">"{t.phase6.valueFraming}"</p>
        <p className="text-sm italic text-on-surface-variant leading-relaxed">"{t.phase6.valueHighlight}"</p>
      </div>

      {/* Closing Pitch */}
      <div className="p-4 bg-primary-container rounded-lg mb-6">
        <p className="text-xs text-on-primary-container leading-relaxed italic">{t.pitch.closingPitch}</p>
      </div>

      {s.companyName && (
        <div className="flex items-center gap-3 mb-6">
          <Building2 size={20} className="text-secondary" />
          <div>
            <h3 className="font-headline text-xl font-bold">{s.companyName}</h3>
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">{s.legalEntityType} {s.companyType && `• ${s.companyType}`}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-surface-container-lowest rounded-lg border border-outline-variant/15">
          <h4 className="font-label tracking-widest text-[10px] uppercase text-secondary font-bold mb-4">{t.phase6.monthlyBlock}</h4>
          {pricing.isHolding
            ? <PriceRow label={t.phase6.items.holdingPauschale} provider={t.phase6.items.fibuProvider} amount={pricing.fibuMonthly} period={t.common.perMonth} />
            : <PriceRow label={t.phase6.items.fibu} provider={t.phase6.items.fibuProvider} amount={pricing.fibuMonthly} period={t.common.perMonth} />}
          <PriceRow label={t.phase6.items.plattform} provider={t.phase6.items.plattformProvider} amount={pricing.plattformMonthly} period={t.common.perMonth} />
          {needsPayroll && s.numberOfEmployees > 0 && <PriceRow label={`${t.phase6.items.payroll} (${s.numberOfEmployees} MA)`} provider={t.phase6.items.payrollProvider} amount={pricing.payrollMonthly} period={t.common.perMonth} />}
          <div className="mt-3 pt-3 border-t-2 border-secondary/30 flex justify-between items-center">
            <span className="text-sm font-bold">{t.common.total} {t.common.monthly}</span>
            <span className="text-xl font-bold text-secondary">{pricing.totalMonthly.toLocaleString('de-DE')}€</span>
          </div>
        </div>

        <div className="p-5 bg-surface-container-lowest rounded-lg border border-outline-variant/15">
          <h4 className="font-label tracking-widest text-[10px] uppercase text-secondary font-bold mb-4">{t.phase6.annualBlock}</h4>
          {!pricing.isHolding && <PriceRow label={t.phase6.items.ja} provider={t.phase6.items.jaProvider} amount={pricing.jaAnnual} period={t.common.perYear} />}
          <div className="mt-3 pt-3 border-t-2 border-secondary/30 flex justify-between items-center">
            <span className="text-sm font-bold">{t.common.total} {t.common.annually}</span>
            <span className="text-xl font-bold text-secondary">{pricing.totalAnnual.toLocaleString('de-DE')}€</span>
          </div>
        </div>

        <div className="p-5 bg-surface-container-lowest rounded-lg border border-outline-variant/15">
          <h4 className="font-label tracking-widest text-[10px] uppercase text-secondary font-bold mb-4">{t.phase6.oneTimeBlock}</h4>
          <PriceRow label={t.phase6.items.einrichtung} amount={pricing.einrichtung} period={t.common.oneTime} />
          {pricing.steuerlicheEinrichtung > 0 && <PriceRow label={t.phase6.items.steuerlicheEinrichtung} provider={t.phase6.items.steuerlicheEinrichtungProvider} amount={pricing.steuerlicheEinrichtung} period={t.common.oneTime} />}
          {needsPayroll && pricing.payrollSetupTotal > 0 && <PriceRow label={t.phase6.items.payrollSetup} provider={t.phase6.items.payrollProvider} amount={pricing.payrollSetupTotal} period={t.common.oneTime} />}
        </div>

        <div className="p-5 bg-primary-container rounded-lg text-white">
          <h4 className="font-label tracking-widest text-[10px] uppercase text-accent font-bold mb-4">{t.phase6.totalBlock}</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span className="text-on-primary-container">{t.common.monthly}</span><span className="font-semibold text-white">{pricing.totalMonthly.toLocaleString('de-DE')}€</span></div>
            <div className="flex justify-between text-sm"><span className="text-on-primary-container">{t.common.annually}</span><span className="font-semibold text-white">{pricing.totalAnnual.toLocaleString('de-DE')}€</span></div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center">
            <span className="text-sm font-bold text-white">{t.common.year1}</span>
            <span className="text-2xl font-bold text-accent">{pricing.totalYear1.toLocaleString('de-DE')}€</span>
          </div>
        </div>
      </div>

      <div className="mt-6 p-5 bg-surface-container-lowest rounded-lg border border-outline-variant/15">
        <h4 className="font-label tracking-widest text-[10px] uppercase text-secondary font-bold mb-3">{lang === 'de' ? 'Das ist in deinem Paket enthalten' : 'What\'s included in your package'}</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <img src="https://cdn.prod.website-files.com/679897a4319b9ce027491552/6978bf359d0708878e0fbefb_47d0c41e87ca470752296069416ca11c_bwa-mockup-integral-en.avif" alt="BWA" className="w-full rounded-lg shadow-sm border border-outline-variant/10 mb-1" />
            <span className="text-[10px] text-on-surface-variant">{lang === 'de' ? 'Monatliche BWA' : 'Monthly Reports'}</span>
          </div>
          <div className="text-center">
            <img src="https://cdn.prod.website-files.com/679897a4319b9ce027491552/6978bf3908e9cc5233a15465_69808ff13db7892cc28a323ec0181f38_statements-mockup-integral-en.avif" alt="Documents" className="w-full rounded-lg shadow-sm border border-outline-variant/10 mb-1" />
            <span className="text-[10px] text-on-surface-variant">{lang === 'de' ? 'Dokumenten-Tresor' : 'Document Vault'}</span>
          </div>
          <div className="text-center">
            <img src="https://cdn.prod.website-files.com/679897a4319b9ce027491552/6978bf3c1d4881efa1a4c9f8_788011a75eab9cb4c5e176b039d5bbcf_proactive-mockup-integral-en.avif" alt="Contacts" className="w-full rounded-lg shadow-sm border border-outline-variant/10 mb-1" />
            <span className="text-[10px] text-on-surface-variant">{lang === 'de' ? 'Persönlicher Ansprechpartner' : 'Personal Contact'}</span>
          </div>
          <div className="text-center">
            <img src="https://cdn.prod.website-files.com/679897a4319b9ce027491552/697c7e2cb6a506bd32d13c6b_bookkeeping-mockup-en.svg" alt="Bookkeeping" className="w-full rounded-lg shadow-sm border border-outline-variant/10 mb-1" />
            <span className="text-[10px] text-on-surface-variant">{lang === 'de' ? 'Automatisierte Buchhaltung' : 'Automated Bookkeeping'}</span>
          </div>
        </div>
      </div>

      {pricing.payrollFlag && <div className="mt-4"><ExclusionBanner text={t.phase5.payrollFlag} type="warning" /></div>}
      {!pricing.isHolding && pricing.scalingFactor > 1 && (
        <div className="mt-4 p-3 bg-surface-container-low rounded text-xs text-on-surface-variant">
          Skalierungsfaktor: {pricing.scalingFactor.toFixed(2)}x (basierend auf {s.jahresumsatzExakt.toLocaleString('de-DE')}€ Jahresumsatz)
        </div>
      )}
    </PhaseWrapper>
  );
}

// ─── Save Lead Button ──────────────────
function SaveLeadButton({ pricing, prognose }: { pricing: any; prognose: any }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const s = useLeadStore();
  const { saveLead } = useHistoryStore();

  const handleSave = async () => {
    setSaving(true);
    const leadData: Record<string, any> = {};
    const state = useLeadStore.getState();
    for (const [key, value] of Object.entries(state)) {
      if (typeof value !== 'function') leadData[key] = value;
    }
    leadData.prognoseScore = prognose.score;
    await saveLead(leadData, { totalMonthly: pricing.totalMonthly, totalYear1: pricing.totalYear1 });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <button
      onClick={handleSave}
      disabled={saving || saved}
      className={`flex items-center gap-2 px-8 py-3 text-sm font-semibold rounded transition-all ${saved ? 'bg-success text-white' : 'bg-secondary text-white hover:opacity-90'} disabled:cursor-not-allowed`}
    >
      {saving ? (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : saved ? (
        <><CheckCircle2 size={16} /> Gespeichert!</>
      ) : (
        <><Save size={16} /> Lead speichern</>
      )}
    </button>
  );
}

// ─── Phase 7: Close + Prognose ──────────
function Phase7() {
  const t = useT(); const s = useLeadStore();
  const pricing = useMemo(() => calculatePricing(s.jahresumsatzExakt, s.companyType, s.serviceNeeds, s.numberOfEmployees, s.taxTakeover), [s.jahresumsatzExakt, s.companyType, s.serviceNeeds, s.numberOfEmployees, s.taxTakeover]);
  const prognose = useMemo(() => calculatePrognoseScore({
    triggerEvent: s.triggerEvent, personaSegment: s.personaSegment, revenueRange: getRevenueRange(s.jahresumsatzExakt),
    hasVorberater: s.hasVorberater === true, needsPayroll: s.serviceNeeds.includes('Payroll'), totalMonthly: pricing.totalMonthly,
    objectionCount: s.objections.length, sentiment: s.sentiment,
    hasBacklogYears: s.annualStatementYears.some(y => ['2023', '2024'].includes(y)), isBoth: s.companyType === 'Both',
  }), [s.triggerEvent, s.personaSegment, s.jahresumsatzExakt, s.hasVorberater, s.serviceNeeds, pricing.totalMonthly, s.objections.length, s.sentiment, s.annualStatementYears, s.companyType]);

  const gaugeColor = prognose.score >= 70 ? 'text-success' : prognose.score >= 40 ? 'text-warning' : 'text-danger';
  const gaugeBg = prognose.score >= 70 ? 'bg-success' : prognose.score >= 40 ? 'bg-warning' : 'bg-danger';

  const summary = useMemo(() => {
    const lines = [];
    if (s.companyName) lines.push(`${s.companyName} (${s.legalEntityType})`);
    if (s.triggerEvent) lines.push(`Trigger: ${s.triggerEvent}`);
    if (s.companyType) lines.push(`Typ: ${s.companyType}`);
    lines.push(`Services: ${s.serviceNeeds || 'TBD'}`);
    lines.push(`Preis: ${pricing.totalMonthly}€/Monat + ${pricing.totalAnnual}€/Jahr`);
    if (pricing.steuerlicheEinrichtung) lines.push(`+ Steuerliche Einrichtung: 550€`);
    if (s.numberOfEmployees > 0) lines.push(`Payroll: ${s.numberOfEmployees} MA`);
    lines.push(`Prognose: ${prognose.score}% — ${t.phase7.actions[prognose.action as keyof typeof t.phase7.actions]}`);
    return lines.join('\n');
  }, [s, pricing, prognose, t]);

  return (
    <PhaseWrapper title={t.phase7.title} subtitle={t.phase7.subtitle} duration={t.phase7.duration} objections={t.phase7.objections}>
      <div className="p-4 bg-secondary/5 rounded-lg border-l-3 border-secondary mb-6">
        <p className="text-sm italic text-on-surface-variant leading-relaxed">"{t.phase7.closingScript}"</p>
      </div>
      <div className="mb-6">
        <h4 className="font-label tracking-widest text-[10px] uppercase text-secondary font-bold mb-3">Next Steps</h4>
        <div className="space-y-2">
          {t.phase7.nextSteps.map((step, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-surface-container-low rounded">
              <div className="w-6 h-6 rounded-full bg-secondary text-white flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
              <span className="text-sm">{step}</span>
            </div>
          ))}
        </div>
        <p className="text-sm italic text-on-surface-variant mt-3">"{t.phase7.closingLine}"</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-surface-container-lowest rounded-lg border border-outline-variant/15 text-center">
          <h4 className="font-label tracking-widest text-[10px] uppercase text-secondary font-bold mb-4">{t.phase7.prognose}</h4>
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className={gaugeColor} strokeDasharray={`${prognose.score * 2.64} ${264 - prognose.score * 2.64}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center"><span className={`text-3xl font-bold ${gaugeColor}`}>{prognose.score}%</span></div>
          </div>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${gaugeBg}/10 ${gaugeColor}`}>
            <BarChart3 size={12} />{t.phase7.actions[prognose.action as keyof typeof t.phase7.actions]}
          </div>
        </div>

        <div className="p-5 bg-surface-container-lowest rounded-lg border border-outline-variant/15">
          <h4 className="font-label tracking-widest text-[10px] uppercase text-secondary font-bold mb-4">{t.phase7.factors}</h4>
          <div className="space-y-2">
            {prognose.factors.map((f, i) => (
              <div key={i} className={`flex items-center gap-2 text-xs p-2 rounded ${f.startsWith('+') ? 'bg-success/5 text-success' : 'bg-danger/5 text-danger'}`}>
                {f.startsWith('+') ? <TrendingUp size={12} /> : <AlertTriangle size={12} />}<span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 bg-surface-container-lowest rounded-lg border border-outline-variant/15">
          <h4 className="font-label tracking-widest text-[10px] uppercase text-secondary font-bold mb-4">{t.phase7.sentimentLabel}</h4>
          <input type="range" min="1" max="10" value={s.sentiment} onChange={e => s.setField('sentiment', parseInt(e.target.value))} className="w-full accent-secondary" />
          <div className="flex justify-between text-[10px] text-on-surface-variant mt-1"><span>1</span><span className="font-bold text-secondary">{s.sentiment}</span><span>10</span></div>
        </div>

        <div className="p-5 bg-surface-container-lowest rounded-lg border border-outline-variant/15">
          <h4 className="font-label tracking-widest text-[10px] uppercase text-secondary font-bold mb-4">{t.common.notes}</h4>
          <textarea value={s.notes} onChange={e => s.setField('notes', e.target.value)} rows={4} className="w-full px-3 py-2 bg-surface-container-low border-none rounded text-sm focus:outline-none focus:ring-1 focus:ring-secondary resize-none" />
        </div>
      </div>

      <div className="mt-6 p-5 bg-primary-container rounded-lg">
        <h4 className="font-label tracking-widest text-[10px] uppercase text-accent font-bold mb-3">{t.phase7.dealSummary}</h4>
        <pre className="text-xs text-on-primary-container whitespace-pre-wrap font-body leading-relaxed">{summary}</pre>
      </div>
      <div className="mt-6 flex justify-center gap-3">
        <SaveLeadButton pricing={pricing} prognose={prognose} />
        <button disabled className="px-6 py-3 bg-outline-variant/30 text-on-surface-variant text-sm font-medium rounded cursor-not-allowed">{t.phase7.syncHubspot} — {t.phase7.syncDisabled}</button>
      </div>
    </PhaseWrapper>
  );
}

// ─── Disqualification Screen ────────────
function DisqualificationScreen() {
  const t = useT(); const s = useLeadStore();
  const [lostReason, setLostReason] = useState('');
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4"><AlertOctagon size={32} className="text-danger" /></div>
        <h2 className="font-headline text-3xl font-bold mb-2">{t.disqualification.title}</h2>
        <p className="text-on-surface-variant">{t.disqualification.subtitle}</p>
      </div>
      <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/15 mb-6">
        <p className="text-sm font-medium mb-1">{t.disqualification.reason}:</p>
        <p className="text-sm text-danger font-semibold">{s.disqualifyReason}</p>
      </div>
      <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/15 mb-6">
        <p className="text-sm italic text-on-surface-variant leading-relaxed">"{t.phase2.disqualifyScript}"</p>
      </div>
      <div className="mb-6">
        <label className="text-sm font-medium mb-2 block">Lost Reason (HubSpot):</label>
        <select value={lostReason} onChange={e => setLostReason(e.target.value)} className="w-full px-3 py-2 bg-surface-container-low border-none rounded text-sm focus:outline-none focus:ring-1 focus:ring-secondary">
          <option value="">{t.common.selectOption}</option>
          {Object.entries(t.disqualification.lostReasons).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <div className="flex gap-3">
        <button onClick={() => s.undoDisqualify()} className="flex-1 px-4 py-2.5 border border-outline-variant/30 text-sm font-medium rounded hover:bg-surface-container-low transition-colors">{t.disqualification.goBack}</button>
        <button disabled className="flex-1 px-4 py-2.5 bg-danger text-white text-sm font-medium rounded opacity-50 cursor-not-allowed">{t.disqualification.markAsLost} (V2)</button>
      </div>
    </div>
  );
}

// ─── App Root ───────────────────────────
function MainApp() {
  const { currentPhase, status } = useLeadStore();
  const PhaseComponent = status === 'disqualified' ? DisqualificationScreen
    : [Phase1, Phase2, Phase3, Phase4, Phase5, Phase6, Phase7][currentPhase - 1] || Phase1;
  return (
    <div className="min-h-screen bg-surface selection:bg-secondary-container/40">
      <Sidebar />
      <main className="ml-16 lg:ml-60 min-h-screen">
        <ProgressBar />
        <ComplianceBanner />
        <DealHealthBar />
        <PhaseComponent />
      </main>
      <LeadHistory />
    </div>
  );
}

export default function App() {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <AuthGate />;
  return <MainApp />;
}
