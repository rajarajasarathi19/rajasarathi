/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { PdfInstructionSheet } from './components/PdfInstructionSheet.tsx';
import { VersantCheck } from './components/VersantCheckModal.tsx';
import { TakeTestPortal } from './components/TakeTestPortal.tsx';
import { ActiveTestEngine } from './components/ActiveTestEngine.tsx';
import { ScorekeeperReport } from './components/ScorekeeperReport.tsx';
import { ProctorConsole } from './components/ProctorConsole.tsx';
import { Footer } from './components/Footer.tsx';
import { Candidate, VersantScoreReport } from './types.ts';
import { FileText, Headphones, PlayCircle, Award, Server } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('instructions');
  const [candidateTin, setCandidateTin] = useState<string>('27146819');
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [scoreReport, setScoreReport] = useState<VersantScoreReport | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [systemCheckCompleted, setSystemCheckCompleted] = useState<boolean>(false);

  // Validate candidate on mount with backend
  useEffect(() => {
    fetch('/api/candidate/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tin: candidateTin }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.candidate) {
          setCandidate(data.candidate);
          setBackendOnline(true);
          if (data.candidate.scoreReport) {
            setScoreReport(data.candidate.scoreReport);
          }
        }
      })
      .catch((err) => {
        console.warn('Initial backend connection check:', err);
        setBackendOnline(false);
      });
  }, [candidateTin]);

  const handleValidateCandidate = async (tin: string): Promise<Candidate | null> => {
    try {
      const res = await fetch('/api/candidate/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tin }),
      });
      const data = await res.json();
      if (data.success && data.candidate) {
        setCandidate(data.candidate);
        setCandidateTin(tin);
        if (data.candidate.scoreReport) {
          setScoreReport(data.candidate.scoreReport);
        }
        return data.candidate;
      }
    } catch (e) {
      console.warn('Validation error:', e);
    }
    return null;
  };

  const handleStartActiveTest = (c: Candidate) => {
    setCandidate(c);
    setActiveTab('active-test');
  };

  const handleFinishTest = async (tin: string) => {
    try {
      const res = await fetch(`/api/scorekeeper/report/${tin}`);
      const data = await res.json();
      if (data.success && data.report) {
        setScoreReport(data.report);
        if (candidate) {
          setCandidate({ ...candidate, status: 'Completed', scoreReport: data.report });
        }
      }
    } catch (e) {
      console.warn('Fetch report error:', e);
    }
    setActiveTab('score-report');
  };

  const handleViewReport = async (tin: string) => {
    try {
      const res = await fetch(`/api/scorekeeper/report/${tin}`);
      const data = await res.json();
      if (data.success && data.report) {
        setScoreReport(data.report);
        if (data.candidate) {
          setCandidate(data.candidate);
          setCandidateTin(tin);
        }
        setActiveTab('score-report');
      } else {
        alert(data.error || 'Report not yet available for this candidate.');
      }
    } catch (e) {
      alert('Could not retrieve candidate score report.');
    }
  };

  const handleSelectCandidateFromProctor = (tin: string) => {
    setCandidateTin(tin);
    handleValidateCandidate(tin).then(() => {
      setActiveTab('take-test');
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/60 font-sans text-slate-900 selection:bg-sky-100">
      {/* Pearson Header */}
      <Header
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        candidateTin={candidateTin}
        candidateName={candidate?.name || 'RAHUL DRAVID S'}
        backendOnline={backendOnline}
      />

      {/* Visual Navigation Pill Bar (Interactive Stepper) */}
      <div className="bg-white border-b border-slate-200 py-2.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto text-xs font-medium text-slate-600 space-x-2 sm:space-x-4">
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('instructions')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'instructions'
                  ? 'bg-[#003057] text-white font-semibold shadow-xs'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1. PDF Instructions</span>
            </button>

            <span className="text-slate-300">→</span>

            <button
              onClick={() => setActiveTab('system-check')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'system-check'
                  ? 'bg-[#003057] text-white font-semibold shadow-xs'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>2. VersantCheck.com</span>
            </button>

            <span className="text-slate-300">→</span>

            <button
              onClick={() => setActiveTab('take-test')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'take-test' || activeTab === 'active-test'
                  ? 'bg-[#003057] text-white font-semibold shadow-xs'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>3. Validate & Start</span>
            </button>

            <span className="text-slate-300">→</span>

            <button
              onClick={() => setActiveTab('score-report')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'score-report'
                  ? 'bg-[#003057] text-white font-semibold shadow-xs'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>4. Score Report</span>
            </button>
          </div>

          <div className="shrink-0 flex items-center gap-2 pl-4 border-l border-slate-200">
            <button
              onClick={() => setActiveTab('proctor-console')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                activeTab === 'proctor-console'
                  ? 'bg-[#007788] text-white'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100'
              }`}
            >
              <Server className="w-3 h-3" />
              <span>Backend & Database</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <main className="flex-1">
        {activeTab === 'instructions' && (
          <PdfInstructionSheet
            candidateName={candidate?.name || 'RAHUL DRAVID S'}
            candidateTin={candidateTin}
            onNavigateToSystemCheck={() => setActiveTab('system-check')}
            onNavigateToTakeTest={() => setActiveTab('take-test')}
          />
        )}

        {activeTab === 'system-check' && (
          <VersantCheck
            candidateTin={candidateTin}
            candidateName={candidate?.name || 'RAHUL DRAVID S'}
            onProceedToTakeTest={() => setActiveTab('take-test')}
            onSystemCheckPassed={() => setSystemCheckCompleted(true)}
          />
        )}

        {activeTab === 'take-test' && (
          <TakeTestPortal
            initialTin={candidateTin}
            currentCandidate={candidate}
            onStartActiveTest={handleStartActiveTest}
            onViewReport={handleViewReport}
            onValidateCandidate={handleValidateCandidate}
          />
        )}

        {activeTab === 'active-test' && candidate && (
          <ActiveTestEngine
            candidate={candidate}
            onFinishTest={handleFinishTest}
            onCancel={() => setActiveTab('take-test')}
          />
        )}

        {activeTab === 'score-report' && (
          scoreReport ? (
            <ScorekeeperReport
              report={scoreReport}
              candidate={candidate || {
                tin: candidateTin,
                name: 'RAHUL DRAVID S',
                testTitle: 'Versant English Placement Test (VEPT)',
                organization: 'Pearson Assessment',
                assignedDate: '2026-09-28',
                expiryDate: '2026-10-31',
                status: 'Completed',
                systemCheckStatus: 'Passed',
                deliveryMode: 'Web',
              }}
              onRetake={() => setActiveTab('active-test')}
            />
          ) : (
            <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-200 rounded-lg text-center shadow-sm">
              <Award className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Score Report Generated Yet</h3>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                Complete the Versant assessment to generate your official Pearson CEFR Score Report, or view the completed demo.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('take-test')}
                  className="w-full py-2 px-4 text-xs font-bold text-white bg-[#007788] hover:bg-[#005f6d] rounded transition-colors"
                >
                  Take Test for TIN: {candidateTin}
                </button>
                <button
                  onClick={() => handleViewReport('98451203')}
                  className="w-full py-2 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                >
                  View Sample Completed Score Report (Ananya Sharma)
                </button>
              </div>
            </div>
          )
        )}

        {activeTab === 'proctor-console' && (
          <ProctorConsole
            onSelectCandidate={handleSelectCandidateFromProctor}
            onViewReport={handleViewReport}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
