import React, { useState } from 'react';
import {
  Laptop,
  Headphones,
  VolumeX,
  Mic,
  MessageSquare,
  HelpCircle,
  FileX,
  PauseOctagon,
  Copy,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Download,
} from 'lucide-react';

interface PdfInstructionSheetProps {
  candidateName?: string;
  candidateTin?: string;
  onNavigateToSystemCheck: () => void;
  onNavigateToTakeTest: () => void;
}

export const PdfInstructionSheet: React.FC<PdfInstructionSheetProps> = ({
  candidateName = 'RAHUL DRAVID S',
  candidateTin = '27146819',
  onNavigateToSystemCheck,
  onNavigateToTakeTest,
}) => {
  const [copied, setCopied] = useState(false);
  const [checklist, setChecklist] = useState({
    computer: false,
    headset: false,
    quietRoom: false,
    micDistance: false,
    noNotes: false,
  });

  const handleCopyTin = () => {
    navigator.clipboard.writeText(candidateTin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(checklist).every(Boolean);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Action Banner for Candidates */}
      <div className="mb-6 p-4 bg-sky-50 border border-sky-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-sky-950">Official Pearson Versant Test Pass</h2>
            <p className="text-xs text-sky-800">
              Assigned to <span className="font-semibold">{candidateName}</span> · TIN <span className="font-mono font-bold">{candidateTin}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToSystemCheck}
            className="px-3.5 py-1.5 text-xs font-semibold text-sky-900 bg-white border border-sky-300 rounded hover:bg-sky-50 transition-colors flex items-center gap-1.5"
          >
            Run VersantCheck.com
          </button>
          <button
            onClick={onNavigateToTakeTest}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-[#007788] rounded hover:bg-[#005f6d] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            Launch Test
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sheet Frame (matching official PDF sheet) */}
      <div className="bg-white border border-slate-300 rounded-lg shadow-md overflow-hidden print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="p-8 sm:p-10 border-b border-slate-100 pb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline gap-4">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold tracking-tight text-[#003057]">VERSANT</span>
                <span className="text-xs font-bold text-slate-500 uppercase">TM</span>
              </div>
              <div className="text-sm font-semibold text-slate-600 -mt-1">by Pearson</div>
              <h1 className="text-2xl font-bold text-slate-900 mt-4 tracking-tight">Test Instructions</h1>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-sm font-bold tracking-wide text-slate-800 uppercase">{candidateName}</div>
              <div className="mt-1 flex items-center sm:justify-end gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">TIN:</span>
                <span className="font-mono text-3xl font-extrabold text-slate-900 tracking-wider">
                  {candidateTin}
                </span>
                <button
                  onClick={handleCopyTin}
                  title="Copy TIN to clipboard"
                  className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              {copied && <span className="text-[11px] text-emerald-600 block">TIN copied to clipboard</span>}
            </div>
          </div>
        </div>

        {/* Accent Bar */}
        <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />

        <div className="p-8 sm:p-10 space-y-10">
          {/* SECTION 1: BEFORE THE TEST */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                BEFORE THE TEST:
              </h2>
              <span className="text-xs text-slate-400">Preparation & Hardware</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Item 1 */}
              <div
                onClick={() => toggleCheck('computer')}
                className={`cursor-pointer p-4 rounded-lg border text-center transition-all ${
                  checklist.computer ? 'border-sky-500 bg-sky-50/50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-16 h-16 mx-auto mb-3 rounded-full border border-sky-200 bg-sky-50 flex items-center justify-center text-sky-700">
                  <Laptop className="w-8 h-8 stroke-[1.5]" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800 leading-snug">
                  Computer with a good internet connection
                </h3>
                <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={checklist.computer}
                    onChange={() => {}}
                    className="rounded text-sky-600"
                  />
                  <span>Verified stable connection</span>
                </div>
              </div>

              {/* Item 2 */}
              <div
                onClick={() => toggleCheck('headset')}
                className={`cursor-pointer p-4 rounded-lg border text-center transition-all ${
                  checklist.headset ? 'border-sky-500 bg-sky-50/50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-16 h-16 mx-auto mb-3 rounded-full border border-sky-200 bg-sky-50 flex items-center justify-center text-sky-700">
                  <Headphones className="w-8 h-8 stroke-[1.5]" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800 leading-snug">
                  Headphones with a boom microphone
                </h3>
                <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={checklist.headset}
                    onChange={() => {}}
                    className="rounded text-sky-600"
                  />
                  <span>Boom mic headset ready</span>
                </div>
              </div>

              {/* Item 3 */}
              <div
                onClick={() => toggleCheck('quietRoom')}
                className={`cursor-pointer p-4 rounded-lg border text-center transition-all ${
                  checklist.quietRoom ? 'border-sky-500 bg-sky-50/50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-16 h-16 mx-auto mb-3 rounded-full border border-sky-200 bg-sky-50 flex items-center justify-center text-sky-700">
                  <VolumeX className="w-8 h-8 stroke-[1.5]" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800 leading-snug">
                  A quiet room
                </h3>
                <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={checklist.quietRoom}
                    onChange={() => {}}
                    className="rounded text-sky-600"
                  />
                  <span>Zero background noise</span>
                </div>
              </div>
            </div>

            {/* VersantCheck Callout */}
            <div className="mt-6 p-4 rounded-md bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-sm text-slate-700">
                <p className="font-semibold text-slate-900">
                  For system check, go to{' '}
                  <button
                    onClick={onNavigateToSystemCheck}
                    className="text-[#007788] hover:underline font-bold"
                  >
                    VersantCheck.com
                  </button>
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Follow the instructions to make sure you are ready to take a Versant test
                </p>
              </div>

              <button
                onClick={onNavigateToSystemCheck}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#007788] rounded hover:bg-[#005f6d] transition-colors whitespace-nowrap"
              >
                Test Microphone & Speakers
              </button>
            </div>
          </section>

          {/* SECTION 2: DURING THE TEST */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                DURING THE TEST:
              </h2>
              <span className="text-xs text-slate-400">Strict Examination Conduct</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Rule 1: Mic Distance */}
              <div className="p-3.5 rounded-lg border border-slate-200 text-center flex flex-col items-center">
                <div className="relative w-14 h-14 mb-2.5 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-700">
                  <Headphones className="w-6 h-6 stroke-[1.5]" />
                  <span className="absolute -bottom-1.5 px-1 bg-amber-500 text-white text-[9px] font-bold rounded">
                    3-5 cm
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">Microphone distance</h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                  Keep boom mic 3–5 cm from corner of mouth
                </p>
              </div>

              {/* Rule 2: Speak naturally */}
              <div className="p-3.5 rounded-lg border border-slate-200 text-center flex flex-col items-center">
                <div className="w-14 h-14 mb-2.5 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-sky-700">
                  <MessageSquare className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">Speak naturally</h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                  Normal pace, clear voice, do not shout or whisper
                </p>
              </div>

              {/* Rule 3: Don't know */}
              <div className="p-3.5 rounded-lg border border-slate-200 text-center flex flex-col items-center">
                <div className="w-14 h-14 mb-2.5 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-amber-700">
                  <HelpCircle className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">Don’t know?</h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                  Be silent or say “I don't know”
                </p>
              </div>

              {/* Rule 4: No notes */}
              <div className="p-3.5 rounded-lg border border-slate-200 text-center flex flex-col items-center">
                <div className="w-14 h-14 mb-2.5 rounded-full border border-red-200 bg-red-50 flex items-center justify-center text-red-600">
                  <FileX className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h4 className="text-xs font-bold text-red-700">No notes</h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                  Pen and paper are strictly prohibited
                </p>
              </div>

              {/* Rule 5: Cannot be paused */}
              <div className="p-3.5 rounded-lg border border-slate-200 text-center flex flex-col items-center col-span-2 sm:col-span-1">
                <div className="w-14 h-14 mb-2.5 rounded-full border border-red-200 bg-red-50 flex items-center justify-center text-red-600">
                  <PauseOctagon className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h4 className="text-xs font-bold text-red-700">Test cannot be paused</h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                  Once started, the test proceeds without pause
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 3: STARTING AND ENDING THE TEST */}
          <section className="bg-slate-50 border border-slate-200 rounded-lg p-6">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4">
              STARTING AND ENDING THE TEST
            </h2>

            <ol className="space-y-3.5 text-sm text-slate-800">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#003057] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <span>Go to </span>
                  <button
                    onClick={onNavigateToTakeTest}
                    className="font-semibold text-[#007788] hover:underline"
                  >
                    https://www.versanttest.com/scorekeeper/take-test
                  </button>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#003057] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <span>You may be asked to enter your TIN: </span>
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">
                    {candidateTin}
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#003057] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <span>Click on </span>
                  <strong className="font-bold text-slate-900">“Validate”</strong>
                  <span>, then follow the on-screen instructions</span>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#003057] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <span>Select </span>
                  <strong className="font-bold text-slate-900">“Web”</strong>
                  <span> and click on </span>
                  <strong className="font-bold text-slate-900">“Start test”</strong>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#003057] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  5
                </span>
                <div>
                  <span>Click </span>
                  <strong className="font-bold text-slate-900">“Finish”</strong>
                  <span> at the end of the test</span>
                </div>
              </li>
            </ol>

            <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Make sure all system checks are completed before starting.</span>
              </div>

              <button
                onClick={onNavigateToTakeTest}
                className="px-5 py-2 text-xs font-bold text-white bg-[#007788] rounded-md hover:bg-[#005f6d] transition-colors flex items-center gap-1.5 shadow-sm"
              >
                Proceed to Step 1 & 2 (Scorekeeper)
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* Visual Guide Card with Image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="border border-slate-200 rounded-lg p-4 flex gap-4 items-center bg-white">
              <img
                src="/src/assets/images/guide_headset_mic_check_1790833920438.jpg"
                alt="Boom headset positioning guide"
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-md object-cover border border-slate-200 shrink-0"
              />
              <div className="text-xs">
                <div className="font-bold text-slate-900">Boom Mic Position</div>
                <p className="text-slate-600 mt-0.5">
                  Keep mic 3-5 cm from the mouth to avoid popping sounds and breathing noises during the test.
                </p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-4 flex gap-4 items-center bg-white">
              <img
                src="/src/assets/images/emblem_versant_certified_1790833936193.jpg"
                alt="Pearson Versant Official Assessment"
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-md object-cover border border-slate-200 shrink-0"
              />
              <div className="text-xs">
                <div className="font-bold text-slate-900">Automated Scoring</div>
                <p className="text-slate-600 mt-0.5">
                  Patented Ordinate speech processing evaluates grammar, fluency, vocabulary, and pronunciation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Official Document Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-8 py-5 text-[11px] text-slate-500 leading-relaxed">
          <p>© 2019-2025 Pearson Education, Inc. or its affiliate(s). All rights reserved.</p>
          <p className="mt-0.5">
            Ordinate and Versant are trademarks, in the U.S. and/or other countries, of Pearson Education, Inc. or its affiliate(s). Other names may be the trademarks of their respective owners.
          </p>
          <p className="mt-1">
            For more information, visit us online at{' '}
            <span className="text-[#007788] font-medium">VersantTests.com</span>
          </p>
        </div>
      </div>
    </div>
  );
};
