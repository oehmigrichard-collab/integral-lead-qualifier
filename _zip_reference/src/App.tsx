import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  HelpCircle,
  Mic,
  BarChart2,
  Bell,
  Search,
  TrendingUp,
  Brain,
  CheckCircle2,
  ArrowRight,
  History
} from 'lucide-react';

const Sidebar = () => (
  <aside className="fixed left-0 top-0 h-screen w-20 lg:w-64 bg-[#051132] dark:bg-[#020817] flex flex-col z-50">
    <div className="px-6 py-8">
      <h1 className="font-headline italic text-2xl text-white">Ledger</h1>
      <p className="font-label tracking-wider text-[11px] uppercase text-slate-400 mt-1">Sales Professional</p>
    </div>
    <nav className="flex-1 px-3 space-y-2">
      <a className="flex items-center space-x-3 px-4 py-3 rounded-md text-slate-400 hover:text-white transition-all duration-300 hover:bg-surface-container-low/5 group" href="#">
        <LayoutDashboard size={20} />
        <span className="hidden lg:block font-label tracking-wider text-[11px] uppercase">Cockpit</span>
      </a>
      <a className="flex items-center space-x-3 px-4 py-3 rounded-md bg-surface-container-low/10 text-white border-r-4 border-[#CD7A30] scale-95 active:scale-90 transition-transform" href="#">
        <MessageSquare size={20} />
        <span className="hidden lg:block font-label tracking-wider text-[11px] uppercase">Objections</span>
      </a>
      <a className="flex items-center space-x-3 px-4 py-3 rounded-md text-slate-400 hover:text-white transition-all duration-300 hover:bg-surface-container-low/5 group" href="#">
        <HelpCircle size={20} />
        <span className="hidden lg:block font-label tracking-wider text-[11px] uppercase">Questions</span>
      </a>
      <a className="flex items-center space-x-3 px-4 py-3 rounded-md text-slate-400 hover:text-white transition-all duration-300 hover:bg-surface-container-low/5 group" href="#">
        <Mic size={20} />
        <span className="hidden lg:block font-label tracking-wider text-[11px] uppercase">Pitches</span>
      </a>
      <a className="flex items-center space-x-3 px-4 py-3 rounded-md text-slate-400 hover:text-white transition-all duration-300 hover:bg-surface-container-low/5 group" href="#">
        <BarChart2 size={20} />
        <span className="hidden lg:block font-label tracking-wider text-[11px] uppercase">Insights</span>
      </a>
    </nav>
    <div className="p-4 border-t border-white/5">
      <button className="w-full py-3 bg-secondary text-white font-label tracking-wider text-[11px] uppercase rounded-sm hover:opacity-90 transition-opacity">
        Start Call
      </button>
    </div>
  </aside>
);

const TopBar = () => (
  <header className="sticky top-0 w-full z-40 flex justify-between items-center px-8 py-4 bg-surface/80 backdrop-blur-xl border-b border-slate-200/50">
    <div className="flex items-center space-x-8">
      <span className="font-headline font-bold text-xl text-[#051132]">The Architectural Ledger</span>
      <nav className="hidden md:flex space-x-6">
        <a className="text-slate-500 font-medium font-label hover:text-secondary transition-colors duration-200" href="#">Directory</a>
        <a className="text-slate-500 font-medium font-label hover:text-secondary transition-colors duration-200" href="#">Resources</a>
        <a className="text-slate-500 font-medium font-label hover:text-secondary transition-colors duration-200" href="#">Live Feed</a>
      </nav>
    </div>
    <div className="flex items-center space-x-4">
      <button className="p-2 text-slate-500 hover:bg-surface-container-low rounded-full transition-colors">
        <Bell size={20} />
      </button>
      <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant/30">
        <img 
          alt="Rep Portfolio" 
          className="w-full h-full object-cover" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIstsSrQ8dLZFQiz3XESrlc6cxssHXU5LYvrzxJCu8ioFX7dA4nWKWAN5lm_Dw_uicpNehV30F7wsu5T7dgJ9JhkfiqCAofui_UqJqdzrH9N29IWyab1RpoYQhBtAXkZzoxq1syrhAW7pL3DbQPxMQwc4FiWBXmotU9cxAIMsn-aRe9axopK-Giy7oAem9mkOxK_vaH0lUo9BXvWDuQlJzAMyEVFU4HDJWph2MTif2RIRjEvExB9ewy63RDufgUv0Qot7vmLq4_PSG"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  </header>
);

const IntelligenceRail = () => (
  <aside className="hidden xl:flex fixed right-0 top-[72px] h-[calc(100vh-72px)] w-80 glass-panel border-l border-outline-variant/20 flex-col p-6 z-30">
    <h3 className="font-label tracking-widest text-[10px] uppercase text-secondary font-bold mb-8">Intelligence Rail</h3>
    <div className="space-y-8">
      <div>
        <h4 className="font-headline text-lg mb-4">Session Context</h4>
        <div className="p-4 bg-surface-container-lowest/50 rounded space-y-3 border border-outline-variant/10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Current Lead:</span>
            <span className="font-semibold">Marcus Arclight</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Company:</span>
            <span className="font-semibold">Azure Foundations</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Stage:</span>
            <span className="px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed rounded-full">Discovery</span>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="font-headline text-lg">AI Recommendation</h4>
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-secondary to-orange-400 rounded-lg blur opacity-20"></div>
          <div className="relative bg-surface-container-lowest p-5 rounded-lg border border-outline-variant/20">
            <p className="text-xs leading-relaxed text-on-surface-variant italic">
              "The lead has mentioned 'resource constraints' twice. Prioritize the **Deferred Payment** or **Phased Implementation** objection cards."
            </p>
          </div>
        </div>
      </div>
      <div className="pt-8 mt-auto border-t border-outline-variant/20">
        <button className="w-full py-4 bg-primary text-white font-label tracking-wider text-[11px] uppercase rounded flex items-center justify-center space-x-2 hover:bg-primary/90 transition-colors">
          <History size={16} />
          <span>View Past Handlings</span>
        </button>
      </div>
    </div>
  </aside>
);

const ObjectionContent = () => (
  <div className="p-8 lg:p-12 max-w-7xl mx-auto xl:pr-80">
    {/* Page Header & Search */}
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
      <div className="max-w-xl">
        <h2 className="font-headline text-5xl font-bold text-primary tracking-tight mb-4">Objection Handling</h2>
        <p className="text-on-surface-variant text-lg leading-relaxed">
          Navigate resistance with architectural precision. Select a common hurdle to reveal high-conversion psychological counters.
        </p>
      </div>
      <div className="w-full lg:w-96">
        <div className="relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-secondary transition-colors">
            <Search size={20} />
          </span>
          <input 
            className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-sm focus:outline-none focus:ring-0 focus:bg-surface-container-high transition-all font-body text-sm" 
            placeholder="Search objections or techniques..." 
            type="text"
          />
          <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-secondary group-focus-within:w-full transition-all duration-300"></div>
        </div>
      </div>
    </div>

    {/* Content Grid */}
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Category Rail */}
      <div className="md:col-span-3 space-y-4">
        <h3 className="font-label tracking-widest text-[10px] uppercase text-secondary font-bold mb-6">Tactical Categories</h3>
        <div className="space-y-1">
          <button className="w-full text-left px-4 py-3 bg-surface-container-lowest text-primary font-semibold border-l-2 border-secondary flex items-center justify-between group">
            <span>Financial Hurdles</span>
            <span className="text-[10px] bg-secondary-container px-2 py-0.5 rounded-full text-on-secondary-container">12</span>
          </button>
          <button className="w-full text-left px-4 py-3 text-slate-500 hover:bg-surface-container-low transition-colors flex items-center justify-between group">
            <span>Internal Logic</span>
            <span className="text-[10px] bg-surface-container-high px-2 py-0.5 rounded-full text-on-surface">08</span>
          </button>
          <button className="w-full text-left px-4 py-3 text-slate-500 hover:bg-surface-container-low transition-colors flex items-center justify-between group">
            <span>Timing & Inertia</span>
            <span className="text-[10px] bg-surface-container-high px-2 py-0.5 rounded-full text-on-surface">15</span>
          </button>
          <button className="w-full text-left px-4 py-3 text-slate-500 hover:bg-surface-container-low transition-colors flex items-center justify-between group">
            <span>Authority Gap</span>
            <span className="text-[10px] bg-surface-container-high px-2 py-0.5 rounded-full text-on-surface">05</span>
          </button>
        </div>

        {/* Live Insights */}
        <div className="mt-12 p-6 bg-primary-container text-white rounded-lg relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="font-headline italic text-xl mb-2">Live Insights</h4>
            <p className="text-xs text-on-primary-container mb-4">"Too expensive" is trending in 42% of current active calls.</p>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-secondary w-3/4"></div>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <TrendingUp size={100} strokeWidth={1} />
          </div>
        </div>
      </div>

      {/* Objections Matrix */}
      <div className="md:col-span-9 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Featured Objection Card */}
        <div className="lg:col-span-2 p-8 bg-surface-container-lowest shadow-[0_32px_64px_-12px_rgba(6,29,47,0.05)] rounded-lg border-l-4 border-secondary relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-secondary bg-secondary-container/30 px-2 py-1 rounded">High Impact</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Financial</span>
              </div>
              <h3 className="font-headline text-3xl font-bold">"Your solution is significantly over our budget."</h3>
            </div>
            <Brain className="text-secondary shrink-0" size={28} />
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <div>
              <h4 className="font-label tracking-wider text-[11px] uppercase text-slate-500 mb-3">Suggested Counter</h4>
              <p className="text-on-surface text-lg font-medium leading-relaxed italic border-l-2 border-surface-container-high pl-4">
                "I completely understand. If we look at the 'Cost of Inaction' framework, how does this budget constraint weigh against the $40k monthly revenue leak we identified?"
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-label tracking-wider text-[11px] uppercase text-slate-500">Technique: The Pivot</h4>
              <div className="flex items-start space-x-3 bg-surface-container-low p-4 rounded">
                <CheckCircle2 className="text-secondary shrink-0 mt-0.5" size={16} />
                <p className="text-sm">Validate the concern first to lower cognitive load.</p>
              </div>
              <div className="flex items-start space-x-3 bg-surface-container-low p-4 rounded">
                <CheckCircle2 className="text-secondary shrink-0 mt-0.5" size={16} />
                <p className="text-sm">Shift from 'Cost' (Outflow) to 'ROI' (Inflow) immediately.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Standard Objection Cards */}
        <div className="p-6 bg-surface-container-lowest hover:bg-surface-container transition-colors cursor-pointer group rounded-lg border border-transparent hover:border-outline-variant/20">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Timing</span>
            <ArrowRight className="text-slate-300 group-hover:text-secondary transition-colors" size={20} />
          </div>
          <h3 className="font-headline text-xl font-bold mb-4">"We aren't ready to start until next quarter."</h3>
          <p className="text-on-surface-variant text-sm line-clamp-2">Use the 'Implementation Lag' technique to demonstrate why starting now is essential for Q3 results.</p>
        </div>

        <div className="p-6 bg-surface-container-lowest hover:bg-surface-container transition-colors cursor-pointer group rounded-lg border border-transparent hover:border-outline-variant/20">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Logic</span>
            <ArrowRight className="text-slate-300 group-hover:text-secondary transition-colors" size={20} />
          </div>
          <h3 className="font-headline text-xl font-bold mb-4">"We handle this process internally right now."</h3>
          <p className="text-on-surface-variant text-sm line-clamp-2">The 'Specialization Gap' script highlights hidden overheads of in-house management.</p>
        </div>

        <div className="p-6 bg-surface-container-lowest hover:bg-surface-container transition-colors cursor-pointer group rounded-lg border border-transparent hover:border-outline-variant/20">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Authority</span>
            <ArrowRight className="text-slate-300 group-hover:text-secondary transition-colors" size={20} />
          </div>
          <h3 className="font-headline text-xl font-bold mb-4">"I need to run this by my CTO first."</h3>
          <p className="text-on-surface-variant text-sm line-clamp-2">Equip the champion with the 'Executive Summary' brief to ensure a smooth internal sell.</p>
        </div>

        <div className="p-6 bg-surface-container-lowest hover:bg-surface-container transition-colors cursor-pointer group rounded-lg border border-transparent hover:border-outline-variant/20">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Financial</span>
            <ArrowRight className="text-slate-300 group-hover:text-secondary transition-colors" size={20} />
          </div>
          <h3 className="font-headline text-xl font-bold mb-4">"Your competitor is 20% cheaper."</h3>
          <p className="text-on-surface-variant text-sm line-clamp-2">Value-based differentiation framework focusing on lifecycle stability.</p>
        </div>

      </div>
    </div>
  </div>
);

export default function App() {
  return (
    <div className="min-h-screen bg-surface selection:bg-secondary-container">
      <Sidebar />
      <main className="ml-20 lg:ml-64 min-h-screen relative">
        <TopBar />
        <ObjectionContent />
        <IntelligenceRail />
      </main>
    </div>
  );
}
