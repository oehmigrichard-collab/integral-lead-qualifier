import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore.ts';

export default function AuthGate() {
  const { isFirstSetup, login, setupPassword, error } = useAuthStore();
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);
    if (isFirstSetup) {
      if (pw.length < 6) { setLocalError('Mindestens 6 Zeichen.'); setLoading(false); return; }
      if (pw !== pw2) { setLocalError('Passw\u00f6rter stimmen nicht \u00fcberein.'); setLoading(false); return; }
      await setupPassword(pw);
    } else {
      await login(pw);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="https://cdn.prod.website-files.com/679897a4319b9ce027491552/69788b3d0c8d07768ff7f251_integral-logo-v02.svg" alt="Integral" className="h-10 mx-auto mb-4 brightness-0 invert" />
          <p className="font-label tracking-widest text-[11px] uppercase text-slate-400 mt-2">Lead Qualification Tool</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur rounded-xl p-8 border border-white/10">
          <h2 className="text-white font-semibold text-lg mb-1">
            {isFirstSetup ? 'Zugang einrichten' : 'Anmelden'}
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            {isFirstSetup ? 'W\u00e4hle ein Passwort, um deine Lead-Daten zu verschl\u00fcsseln.' : 'Gib dein Passwort ein, um fortzufahren.'}
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1.5 block">Passwort</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={pw}
                  onChange={e => setPw(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent placeholder-slate-500"
                  placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                  autoFocus
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {isFirstSetup && (
              <div>
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1.5 block">Passwort best\u00e4tigen</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={pw2}
                    onChange={e => setPw2(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent placeholder-slate-500"
                    placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                  />
                </div>
              </div>
            )}
          </div>

          {(error || localError) && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-xs font-medium">{localError || error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !pw}
            className="w-full mt-6 py-3 bg-accent text-white font-semibold text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>{isFirstSetup ? 'Zugang erstellen' : 'Anmelden'} <ArrowRight size={16} /></>
            )}
          </button>

          {isFirstSetup && (
            <p className="mt-4 text-[10px] text-slate-500 text-center leading-relaxed">
              Dein Passwort wird lokal als Hash gespeichert und dient zur Verschl\u00fcsselung deiner Lead-Daten. Es gibt keine Passwort-Wiederherstellung.
            </p>
          )}
        </form>

        <p className="text-center text-[10px] text-slate-600 mt-6">
          Daten werden AES-256-GCM verschl\u00fcsselt im Browser gespeichert.
        </p>
      </div>
    </div>
  );
}
