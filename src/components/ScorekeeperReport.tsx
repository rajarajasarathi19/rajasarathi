import React, { useRef } from 'react';
import {
  Printer,
  Download,
  Award,
  CheckCircle2,
  Calendar,
  FileText,
  User,
  Building,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { VersantScoreReport, Candidate } from '../types.ts';

interface ScorekeeperReportProps {
  report: VersantScoreReport;
  candidate: Candidate;
  onRetake: () => void;
}

export const ScorekeeperReport: React.FC<ScorekeeperReportProps> = ({
  report,
  candidate,
  onRetake,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const getCefrDescription = (level: string) => {
    switch (level) {
      case 'C2':
        return 'Proficient / Mastery: Can understand with ease virtually everything heard or read. Expresses spontaneously and fluently.';
      case 'C1':
        return 'Effective Operational Proficiency: Can understand a wide range of demanding clauses. Expresses fluently without much searching for expressions.';
      case 'B2':
        return 'Vantage / Independent User: Can interact with a degree of fluency and spontaneity. Can produce clear, detailed speech on a wide range of subjects.';
      case 'B1':
        return 'Threshold / Intermediate User: Can understand the main points of clear standard speech on familiar matters regularly encountered in work or study.';
      case 'A2':
        return 'Waystage / Elementary User: Can communicate in simple and routine tasks requiring a simple and direct exchange of information.';
      default:
        return 'Breakthrough / Beginner User: Can understand and use familiar everyday expressions and basic phrases.';
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Action Toolbar */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-lg shadow-sm print:hidden">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            Official Scorekeeper Candidate Report
          </h2>
          <p className="text-xs text-slate-500">
            Certified result for TIN <span className="font-mono font-bold text-slate-700">{report.tin}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRetake}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            Practice Again
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-1.5 text-xs font-bold text-white bg-[#007788] rounded hover:bg-[#005f6d] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Official Printable Score Report Card */}
      <div
        ref={reportRef}
        className="bg-white border border-slate-300 rounded-lg shadow-md overflow-hidden print:border-none print:shadow-none"
      >
        {/* Pearson Official Header */}
        <div className="p-8 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold tracking-tight text-[#003057]">VERSANT</span>
              <span className="text-[10px] font-bold text-slate-500">TM</span>
            </div>
            <div className="text-xs font-semibold text-slate-600 -mt-1">by Pearson</div>
            <h1 className="text-xl font-bold text-slate-900 mt-3">Official Test Score Report</h1>
          </div>

          <div className="flex items-center gap-3">
            <img
              src="/src/assets/images/emblem_versant_certified_1790833936193.jpg"
              alt="Certified Credential Seal"
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-full border border-slate-200 object-cover shrink-0"
            />
            <div className="text-left sm:text-right text-xs">
              <div className="font-mono text-slate-400">ID: {report.testId}</div>
              <div className="font-semibold text-slate-700">Ordinate Speech Processing</div>
              <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 justify-end">
                <CheckCircle2 className="w-3 h-3" /> Validated
              </div>
            </div>
          </div>
        </div>

        {/* Candidate Information Band */}
        <div className="bg-[#003057] text-white px-8 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-300 block text-[11px]">Candidate Name</span>
            <strong className="text-white text-sm tracking-wide block uppercase font-bold">
              {report.candidateName}
            </strong>
          </div>
          <div>
            <span className="text-slate-300 block text-[11px]">Test Identification (TIN)</span>
            <strong className="font-mono text-white text-sm tracking-wider block font-bold">
              {report.tin}
            </strong>
          </div>
          <div>
            <span className="text-slate-300 block text-[11px]">Test Date</span>
            <strong className="text-white text-sm block font-medium">
              {report.testDate}
            </strong>
          </div>
          <div>
            <span className="text-slate-300 block text-[11px]">Assessment Package</span>
            <strong className="text-white text-xs block font-medium truncate">
              {report.testTitle}
            </strong>
          </div>
        </div>

        {/* Primary Scores Summary (Versant Scale 20 - 80) */}
        <div className="p-8 border-b border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Overall Score Dial */}
            <div className="text-center p-6 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Overall Versant Score
              </span>
              <div className="text-5xl font-extrabold text-[#003057] font-mono my-2 tabular-nums">
                {report.overallScore}
                <span className="text-lg text-slate-400 font-normal">/80</span>
              </div>
              <span className="text-xs text-slate-500 block">Official Scaled Score (20–80)</span>
            </div>

            {/* CEFR Level */}
            <div className="text-center p-6 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                CEFR Equivalent
              </span>
              <div className="text-5xl font-extrabold text-[#007788] font-mono my-2">
                {report.cefrLevel}
              </div>
              <span className="text-xs text-slate-600 block leading-tight px-2">
                Common European Framework of Reference
              </span>
            </div>

            {/* GSE Score */}
            <div className="text-center p-6 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Global Scale of English
              </span>
              <div className="text-5xl font-extrabold text-amber-600 font-mono my-2 tabular-nums">
                {report.gseScore}
                <span className="text-lg text-slate-400 font-normal">/90</span>
              </div>
              <span className="text-xs text-slate-500 block">Pearson GSE Scale (10–90)</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-sky-50/60 border border-sky-200 rounded text-xs text-sky-900">
            <strong>CEFR Level {report.cefrLevel}:</strong> {getCefrDescription(report.cefrLevel)}
          </div>
        </div>

        {/* Subscore Breakdown Bars */}
        <div className="p-8 border-b border-slate-200">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-6">
            Skill Subscores (Scale 20 – 80)
          </h3>

          <div className="space-y-5">
            {/* Sentence Mastery */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-bold text-slate-800">Sentence Mastery</span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {report.subScores.sentenceMastery} / 80
                </span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#003057] transition-all duration-500"
                  style={{ width: `${(report.subScores.sentenceMastery / 80) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {report.feedback.sentenceMasteryDetail}
              </p>
            </div>

            {/* Vocabulary */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-bold text-slate-800">Vocabulary</span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {report.subScores.vocabulary} / 80
                </span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#007788] transition-all duration-500"
                  style={{ width: `${(report.subScores.vocabulary / 80) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {report.feedback.vocabularyDetail}
              </p>
            </div>

            {/* Fluency */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-bold text-slate-800">Fluency</span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {report.subScores.fluency} / 80
                </span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-600 transition-all duration-500"
                  style={{ width: `${(report.subScores.fluency / 80) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {report.feedback.fluencyDetail}
              </p>
            </div>

            {/* Pronunciation */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-bold text-slate-800">Pronunciation</span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {report.subScores.pronunciation} / 80
                </span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all duration-500"
                  style={{ width: `${(report.subScores.pronunciation / 80) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {report.feedback.pronunciationDetail}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Qualitative Diagnostic & Suggestions */}
        <div className="p-8 space-y-6">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-2">
              Performance Summary
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-md border border-slate-200">
              {report.feedback.overallSummary}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-2">
              Actionable Recommendations for Professional Growth
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-md border border-slate-200">
              {(report.feedback.actionableSuggestions || []).map((suggestion, idx) => (
                <li key={idx} className="leading-relaxed">
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Official Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-8 py-5 text-[11px] text-slate-500 leading-relaxed flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <p>© 2019-2025 Pearson Education, Inc. or its affiliate(s). All rights reserved.</p>
            <p className="mt-0.5">
              Ordinate and Versant are trademarks of Pearson Education, Inc. Validated for university admissions and employment screening.
            </p>
          </div>
          <div className="text-left sm:text-right shrink-0">
            <span className="font-mono text-slate-400">Scorekeeper v4.2 Authenticated</span>
          </div>
        </div>
      </div>
    </div>
  );
};
