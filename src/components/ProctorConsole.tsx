import React, { useState, useEffect } from 'react';
import {
  Server,
  Activity,
  Users,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  Shield,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Candidate } from '../types.ts';

interface ProctorConsoleProps {
  onSelectCandidate: (tin: string) => void;
  onViewReport: (tin: string) => void;
}

export const ProctorConsole: React.FC<ProctorConsoleProps> = ({
  onSelectCandidate,
  onViewReport,
}) => {
  const [health, setHealth] = useState<any>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTitle, setNewTitle] = useState('Versant 4 Skills English Test');
  const [createMsg, setCreateMsg] = useState<string | null>(null);

  const fetchBackendData = async () => {
    setIsLoading(true);
    try {
      const [hRes, cRes] = await Promise.all([
        fetch('/api/health'),
        fetch('/api/candidates'),
      ]);
      const hData = await hRes.json();
      const cData = await cRes.json();

      setHealth(hData);
      setCandidates(cData.candidates || []);
    } catch (err) {
      console.warn('Backend fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBackendData();
  }, []);

  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsCreating(true);
    setCreateMsg(null);
    try {
      const res = await fetch('/api/candidate/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          testTitle: newTitle,
          organization: 'Pearson Client Testing Center',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCreateMsg(`Created candidate ${data.candidate.name} with TIN ${data.candidate.tin}!`);
        setNewName('');
        fetchBackendData();
      }
    } catch (e: any) {
      setCreateMsg('Failed to create candidate on backend');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Title */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-[#007788]" />
            <h1 className="text-xl font-extrabold text-[#003057]">
              Backend Connection & Proctor Dashboard
            </h1>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
              Express Server API
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Real-time server connection, candidate database registry, and Ordinate AI scoring logs.
          </p>
        </div>

        <button
          onClick={fetchBackendData}
          disabled={isLoading}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-300 rounded hover:bg-slate-200 transition-colors flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Registry
        </button>
      </div>

      {/* Server Health Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Server API Status</div>
          <div className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>{health?.status === 'ok' ? 'Online & Active' : 'Connecting...'}</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block font-mono">Port 3000 · Express</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Scoring Engine</div>
          <div className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#007788]" />
            <span>{health?.geminiEnabled ? 'Gemini 3.8 Flash AI' : 'Ordinate Algorithmic AI'}</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Patented Speech CEFR Scale</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Registered Candidate TINs</div>
          <div className="text-lg font-bold text-slate-900 mt-1 font-mono">
            {candidates.length} Profiles
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Includes Rahul Dravid S (PDF)</span>
        </div>
      </div>

      {/* Candidate Database Registry */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-600" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Scorekeeper Candidate Database
            </h2>
          </div>
          <span className="text-xs text-slate-500">Live Backend State</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">TIN</th>
                <th className="py-3 px-4">Candidate Name</th>
                <th className="py-3 px-4">Test Title</th>
                <th className="py-3 px-4">Assigned / Expiry</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {candidates.map((c) => (
                <tr key={c.tin} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {c.tin}
                    {c.tin === '27146819' && (
                      <span className="ml-2 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-sans">
                        PDF Record
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">{c.name}</td>
                  <td className="py-3 px-4 text-slate-600 truncate max-w-xs">{c.testTitle}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono">
                    {c.assignedDate} → {c.expiryDate}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        c.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    {c.scoreReport ? (
                      <button
                        onClick={() => onViewReport(c.tin)}
                        className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
                      >
                        View Report ({c.scoreReport.overallScore}/80)
                      </button>
                    ) : (
                      <button
                        onClick={() => onSelectCandidate(c.tin)}
                        className="px-2.5 py-1 text-xs font-semibold text-white bg-[#007788] hover:bg-[#005f6d] rounded transition-colors"
                      >
                        Launch Test
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Candidate for Testing */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-[#007788]" />
          Issue New Candidate TIN Pass (Backend Demonstration)
        </h3>
        <p className="text-xs text-slate-600 mb-4">
          Want to test with another candidate besides Rahul Dravid S? Register a new profile to generate a unique 8-digit TIN in the Scorekeeper backend database.
        </p>

        <form onSubmit={handleCreateCandidate} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Candidate full name (e.g. JOHN DOE)"
            required
            className="px-3 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#007788]"
          />
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Assessment package title"
            className="px-3 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#007788]"
          />
          <button
            type="submit"
            disabled={isCreating || !newName.trim()}
            className="py-2 text-xs font-bold text-white bg-[#007788] hover:bg-[#005f6d] rounded transition-colors disabled:opacity-50"
          >
            {isCreating ? 'Issuing...' : 'Generate New TIN'}
          </button>
        </form>

        {createMsg && (
          <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{createMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};
