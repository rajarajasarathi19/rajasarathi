import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Globe,
  Phone,
  Lock,
  User,
  Calendar,
  Building,
  Headphones,
} from 'lucide-react';
import { Candidate } from '../types.ts';

interface TakeTestPortalProps {
  initialTin?: string;
  onStartActiveTest: (candidate: Candidate) => void;
  onViewReport: (tin: string) => void;
  onValidateCandidate: (tin: string) => Promise<Candidate | null>;
  currentCandidate: Candidate | null;
}

export const TakeTestPortal: React.FC<TakeTestPortalProps> = ({
  initialTin = '27146819',
  onStartActiveTest,
  onViewReport,
  onValidateCandidate,
  currentCandidate,
}) => {
  const [tinInput, setTinInput] = useState(initialTin);
  const [isValidating, setIsValidating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validatedCandidate, setValidatedCandidate] = useState<Candidate | null>(currentCandidate);
  const [deliveryMode, setDeliveryMode] = useState<'Web' | 'Phone'>('Web');
  const [acknowledgedRules, setAcknowledgedRules] = useState(false);

  const handleValidate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!tinInput.trim()) {
      setErrorMessage('Please enter your 8-digit TIN from your test instructions.');
      return;
    }

    setIsValidating(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/candidate/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tin: tinInput.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Invalid TIN. Please verify and try again.');
        setValidatedCandidate(null);
      } else {
        setValidatedCandidate(data.candidate);
        setDeliveryMode(data.candidate.deliveryMode || 'Web');
      }
    } catch (err: any) {
      setErrorMessage('Unable to connect to Pearson validation service. Please check your network.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleQuickFill = (tin: string) => {
    setTinInput(tin);
    setErrorMessage(null);
  };

  const handleStart = () => {
    if (!validatedCandidate) return;
    onStartActiveTest({ ...validatedCandidate, deliveryMode });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Official Scorekeeper take-test header */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm mb-6">
        <div className="bg-slate-100/80 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-mono truncate">
            <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-slate-400">https://</span>
            <span className="text-slate-700 font-semibold">www.versanttest.com/scorekeeper/take-test</span>
          </div>
          <span className="hidden sm:inline-block text-[11px] text-slate-400">Step 1 of 5</span>
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-[#003057]">Take a Versant Test</h1>
                <span className="text-[11px] bg-sky-100 text-sky-800 font-semibold px-2 py-0.5 rounded">
                  Scorekeeper Portal
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Enter your Test Identification Number (TIN) as listed in your test instruction sheet.
              </p>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>256-bit Secure Assessment Channel</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Validation Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm">
        {/* Step 2: Enter TIN Form */}
        <form onSubmit={handleValidate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              2. Test Identification Number (TIN)
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={tinInput}
                onChange={(e) => setTinInput(e.target.value)}
                placeholder="e.g. 27146819"
                maxLength={12}
                className="flex-1 px-4 py-3 font-mono text-lg font-bold text-slate-900 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007788] focus:border-transparent tracking-widest uppercase placeholder:font-normal placeholder:text-sm placeholder:tracking-normal"
              />
              <button
                type="submit"
                disabled={isValidating}
                className="px-6 py-3 text-sm font-bold text-white bg-[#007788] hover:bg-[#005f6d] rounded-md transition-colors whitespace-nowrap flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isValidating ? (
                  <span>Validating...</span>
                ) : (
                  <>
                    <span>3. Click Validate</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
            <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-500">
              <span>Quick fill from PDF:</span>
              <button
                type="button"
                onClick={() => handleQuickFill('27146819')}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-medium rounded border border-slate-300 transition-colors"
              >
                27146819 (RAHUL DRAVID S)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('98451203')}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-medium rounded border border-slate-300 transition-colors"
              >
                98451203 (Completed Demo)
              </button>
            </div>
          </div>
        </form>

        {errorMessage && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-2.5 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{errorMessage}</p>
              <p className="mt-0.5 text-red-700">Please make sure you entered the exact TIN from your instruction PDF (27146819).</p>
            </div>
          </div>
        )}

        {/* Validated Candidate Record */}
        {validatedCandidate && (
          <div className="mt-8 pt-6 border-t border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>TIN Validated with Pearson Scorekeeper Database</span>
              </div>
              <span className="text-xs text-slate-500">
                Status: <strong className="text-slate-800">{validatedCandidate.status}</strong>
              </span>
            </div>

            {/* Candidate Metadata Summary */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Candidate Name
                </span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {validatedCandidate.name}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" /> Assessment
                </span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {validatedCandidate.testTitle}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Valid Until
                </span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {validatedCandidate.expiryDate}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block flex items-center gap-1">
                  <Headphones className="w-3.5 h-3.5 text-slate-400" /> System Check
                </span>
                <span className="font-semibold text-emerald-700 mt-0.5 block">
                  Passed / Web Ready
                </span>
              </div>
            </div>

            {/* Step 4: Select Delivery Mode ("Web") */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                4. Select Delivery Mode (Per Step 4: Select “Web”)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  className={`p-4 rounded-lg border cursor-pointer flex items-start gap-3 transition-colors ${
                    deliveryMode === 'Web'
                      ? 'border-[#007788] bg-sky-50/50 ring-1 ring-[#007788]'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    value="Web"
                    checked={deliveryMode === 'Web'}
                    onChange={() => setDeliveryMode('Web')}
                    className="mt-1 text-[#007788]"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                      <Globe className="w-3.5 h-3.5 text-[#007788]" />
                      <span>Web Delivery (Recommended)</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                      Take test in your modern web browser with boom microphone and headphones.
                    </p>
                  </div>
                </label>

                <label
                  className={`p-4 rounded-lg border cursor-pointer flex items-start gap-3 transition-colors opacity-60 ${
                    deliveryMode === 'Phone'
                      ? 'border-[#007788] bg-sky-50/50 ring-1 ring-[#007788]'
                      : 'border-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    value="Phone"
                    checked={deliveryMode === 'Phone'}
                    onChange={() => setDeliveryMode('Phone')}
                    className="mt-1 text-[#007788]"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>Phone Delivery (Telephony)</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                      Dial an international toll-free access number (requires landline or cell).
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Test Rules Acknowledgment */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-md text-xs text-amber-900 space-y-2">
              <div className="font-bold">Strict Test Conditions (From PDF Instructions):</div>
              <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                <li>Microphone must be 3–5 cm from the mouth at all times.</li>
                <li>Speak naturally with normal speed and volume.</li>
                <li>If you do not know an answer, remain silent or clearly say "I don't know".</li>
                <li>No notes or pens are allowed during this examination.</li>
                <li><strong>The test cannot be paused once started.</strong></li>
              </ul>
              <label className="flex items-center gap-2 pt-2 text-xs font-semibold text-slate-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acknowledgedRules}
                  onChange={(e) => setAcknowledgedRules(e.target.checked)}
                  className="rounded text-[#007788]"
                />
                <span>I understand and agree to all test instructions and guidelines</span>
              </label>
            </div>

            {/* Start Button or View Report */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              {validatedCandidate.status === 'Completed' ? (
                <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-md">
                  <div>
                    <span className="font-bold text-xs text-emerald-950 block">This test has already been completed</span>
                    <span className="text-[11px] text-emerald-800">Overall score: {validatedCandidate.scoreReport?.overallScore || 68}/80 · CEFR {validatedCandidate.scoreReport?.cefrLevel || 'B2'}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onViewReport(validatedCandidate.tin)}
                      className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors"
                    >
                      View Official Score Report
                    </button>
                    <button
                      onClick={handleStart}
                      className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors"
                    >
                      Retake Practice Test
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-500">
                    Step 4: Select “Web” and click on “Start test”
                  </p>
                  <button
                    onClick={handleStart}
                    disabled={!acknowledgedRules}
                    className={`px-8 py-3 text-sm font-bold text-white rounded-md transition-all flex items-center gap-2 shadow-sm ${
                      acknowledgedRules
                        ? 'bg-[#007788] hover:bg-[#005f6d] cursor-pointer'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <span>Start Test</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
