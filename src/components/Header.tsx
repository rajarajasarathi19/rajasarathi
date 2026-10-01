import React from 'react';
import { ShieldCheck, Server } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  candidateTin?: string;
  candidateName?: string;
  backendOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  candidateTin = '27146819',
  candidateName = 'RAHUL DRAVID S',
  backendOnline,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('instructions')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded bg-[#003057] flex items-center justify-center text-white font-bold text-base shadow-sm">
              V
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-lg text-[#003057] leading-none">
                VERSANT<span className="text-xs font-semibold align-top ml-0.5 text-slate-500">™</span>
              </span>
              <span className="text-[11px] font-medium text-slate-500 tracking-wider">by Pearson</span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => onSelectTab('instructions')}
            className={`transition-colors pb-1 border-b-2 whitespace-nowrap ${
              currentTab === 'instructions'
                ? 'border-[#007788] text-[#003057] font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Test Instructions
          </button>
          <button
            onClick={() => onSelectTab('system-check')}
            className={`transition-colors pb-1 border-b-2 whitespace-nowrap ${
              currentTab === 'system-check'
                ? 'border-[#007788] text-[#003057] font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            VersantCheck.com
          </button>
          <button
            onClick={() => onSelectTab('take-test')}
            className={`transition-colors pb-1 border-b-2 whitespace-nowrap ${
              currentTab === 'take-test' || currentTab === 'active-test'
                ? 'border-[#007788] text-[#003057] font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Take Test (Scorekeeper)
          </button>
          <button
            onClick={() => onSelectTab('score-report')}
            className={`transition-colors pb-1 border-b-2 whitespace-nowrap ${
              currentTab === 'score-report'
                ? 'border-[#007788] text-[#003057] font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Score Report
          </button>
          <button
            onClick={() => onSelectTab('proctor-console')}
            className={`transition-colors pb-1 border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'proctor-console'
                ? 'border-[#007788] text-[#003057] font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-slate-400" />
            Backend & Proctor
          </button>
        </nav>

        {/* Zone 3: Primary Action & Candidate Badge */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 bg-slate-100/90 px-3 py-1.5 rounded-md border border-slate-200">
            <span className="font-semibold text-slate-800">{candidateName}</span>
            <span className="text-slate-300">|</span>
            <span className="font-mono text-slate-600">TIN: {candidateTin}</span>
            {backendOnline && (
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Backend connected" />
            )}
          </div>

          <button
            onClick={() => onSelectTab('take-test')}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#007788] rounded-md hover:bg-[#005f6d] transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Enter TIN & Start
          </button>
        </div>
      </div>
    </header>
  );
};
