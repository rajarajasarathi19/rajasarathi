import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Clock,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Info,
  Shield,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { Candidate, AnswerSubmission, VersantQuestion } from '../types.ts';
import { mockVersantQuestions } from '../data/mockQuestions.ts';
import { soundEffects } from '../utils/audioPlayer.ts';

interface ActiveTestEngineProps {
  candidate: Candidate;
  onFinishTest: (tin: string) => void;
  onCancel: () => void;
}

export const ActiveTestEngine: React.FC<ActiveTestEngineProps> = ({
  candidate,
  onFinishTest,
  onCancel,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState<'listening' | 'recording' | 'submitting'>('listening');
  const [countdown, setCountdown] = useState(0);
  const [userTranscript, setUserTranscript] = useState('');
  const [answers, setAnswers] = useState<AnswerSubmission[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [micLevel, setMicLevel] = useState(30);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  const currentQuestion: VersantQuestion = mockVersantQuestions[currentIdx] || mockVersantQuestions[0];
  const totalQuestions = mockVersantQuestions.length;

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            interimTranscript += event.results[i][0].transcript;
          }
          if (interimTranscript) {
            setUserTranscript(interimTranscript);
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition error:', e.error);
        };

        recognitionRef.current = recognition;
      } catch (e) {
        console.warn('SpeechRecognition initialization error:', e);
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      soundEffects.stopSpeaking();
    };
  }, []);

  // When question changes, play prompt audio and then transition to recording
  useEffect(() => {
    setUserTranscript('');
    setPhase('listening');
    setCountdown(currentQuestion.prepTimeSeconds);

    let isCancelled = false;

    const playPromptSequence = async () => {
      // Speak instruction / prompt
      if (currentQuestion.audioPromptText) {
        await soundEffects.speakPrompt(currentQuestion.audioPromptText);
      }

      if (isCancelled) return;

      // Play official Versant tone
      await soundEffects.playPromptTone();

      if (isCancelled) return;

      // Start recording phase
      setPhase('recording');
      setCountdown(currentQuestion.responseDurationSeconds);

      try {
        if (recognitionRef.current) {
          recognitionRef.current.start();
        }
      } catch (err) {
        // Recognition already started or not allowed
      }
    };

    playPromptSequence();

    return () => {
      isCancelled = true;
      soundEffects.stopSpeaking();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [currentIdx]);

  // Countdown timer for recording phase
  useEffect(() => {
    if (phase !== 'recording') return;

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleNextQuestion();
          return 0;
        }
        return prev - 1;
      });
      // Simulate slight mic level variation
      setMicLevel(Math.floor(25 + Math.random() * 50));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, currentIdx]);

  const handleNextQuestion = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    // Save answer
    const newAnswer: AnswerSubmission = {
      questionId: currentQuestion.id,
      sectionId: currentQuestion.sectionId,
      sectionName: currentQuestion.sectionName,
      itemType: currentQuestion.itemType,
      promptText: currentQuestion.displayReadingText || currentQuestion.promptText,
      userTranscript: userTranscript || (currentQuestion.sectionId === 'A' ? currentQuestion.displayReadingText || '' : ''),
      latencySeconds: Math.max(1, currentQuestion.responseDurationSeconds - countdown),
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (currentIdx + 1 < totalQuestions) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Completed all items, show Step 5 Finish
      setPhase('submitting');
    }
  };

  const handleSayDontKnow = () => {
    setUserTranscript("I don't know");
    setTimeout(() => {
      handleNextQuestion();
    }, 400);
  };

  // Step 5: Click Finish at the end of the test
  const handleFinishTest = async () => {
    setIsEvaluating(true);
    try {
      const response = await fetch('/api/test/evaluate-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tin: candidate.tin,
          answers,
          totalTimeTakenSeconds: 180,
        }),
      });

      const data = await response.json();
      if (data.success) {
        onFinishTest(candidate.tin);
      } else {
        onFinishTest(candidate.tin);
      }
    } catch (e) {
      onFinishTest(candidate.tin);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Top Test Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#003057] text-white flex items-center justify-center font-bold text-sm">
            V
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">{candidate.testTitle}</div>
            <div className="text-[11px] text-slate-500">
              Candidate: <span className="font-semibold text-slate-700">{candidate.name}</span> · TIN: <span className="font-mono">{candidate.tin}</span>
            </div>
          </div>
        </div>

        {/* Cannot be paused warning per PDF */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-200 rounded text-xs text-red-700 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span>Test cannot be paused</span>
          </div>

          <div className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
            Item {currentIdx + 1} of {totalQuestions}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-[#007788] transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {phase === 'submitting' ? (
        /* STEP 5: FINISH TEST SCREEN */
        <div className="bg-white border border-slate-200 rounded-lg p-8 sm:p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#003057] mb-2">Test Sections Completed</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
            Per instructions: <strong>Step 5. Click “Finish” at the end of the test.</strong> Your spoken responses will be sent to the Pearson Scorekeeper engine for CEFR evaluation.
          </p>

          <div className="max-w-md mx-auto p-4 bg-slate-50 rounded-lg border border-slate-200 text-left text-xs mb-8 space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Candidate Name:</span>
              <strong className="text-slate-900">{candidate.name}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Candidate TIN:</span>
              <strong className="font-mono text-slate-900">{candidate.tin}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Responses Recorded:</span>
              <strong className="text-slate-900">{answers.length} spoken items</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Ordinate Speech AI:</span>
              <strong className="text-emerald-700">Ready for evaluation</strong>
            </div>
          </div>

          <button
            onClick={handleFinishTest}
            disabled={isEvaluating}
            className="px-8 py-3.5 text-base font-bold text-white bg-[#007788] hover:bg-[#005f6d] rounded-md transition-all shadow-md flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
          >
            {isEvaluating ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                Evaluating Versant Score...
              </span>
            ) : (
              <>
                <span>Click “Finish” to Generate Score Report</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      ) : (
        /* ACTIVE QUESTION STAGE */
        <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-10 shadow-sm relative">
          {/* Section Indicator */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-[#007788] uppercase tracking-wider block">
                {currentQuestion.sectionName}
              </span>
              <h2 className="text-lg font-bold text-slate-900">{currentQuestion.itemType}</h2>
            </div>

            {/* Countdown / Phase badge */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold font-mono bg-slate-100 text-slate-800 border border-slate-200">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{countdown}s</span>
              </div>
              <div
                className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 ${
                  phase === 'recording'
                    ? 'bg-red-100 text-red-700 animate-pulse'
                    : 'bg-sky-100 text-sky-800'
                }`}
              >
                {phase === 'recording' ? (
                  <>
                    <Mic className="w-3.5 h-3.5 text-red-600" />
                    <span>Speaking</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-sky-600" />
                    <span>Listening</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Instructions Kicker */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 mb-6 flex items-start gap-2">
            <Info className="w-4 h-4 text-[#007788] shrink-0 mt-0.5" />
            <p className="leading-relaxed">{currentQuestion.instructions}</p>
          </div>

          {/* Central Question Display Area */}
          <div className="py-6 text-center">
            {currentQuestion.sectionId === 'A' ? (
              /* Part A: Reading Sentence */
              <div className="max-w-2xl mx-auto p-6 bg-sky-50/50 border border-sky-200 rounded-lg">
                <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block mb-2">
                  {currentQuestion.promptText}
                </span>
                <p className="text-xl sm:text-2xl font-semibold text-slate-900 leading-relaxed">
                  "{currentQuestion.displayReadingText}"
                </p>
              </div>
            ) : currentQuestion.sectionId === 'D' ? (
              /* Part D: Sentence Builds */
              <div className="max-w-xl mx-auto">
                <span className="text-xs font-semibold text-slate-500 uppercase block mb-2">
                  Rearrange these groups into a sentence:
                </span>
                <p className="text-xl font-bold text-slate-800 tracking-wide">
                  {currentQuestion.promptText}
                </p>
              </div>
            ) : (
              /* Spoken Audio Prompts (Repeat / Questions / Story / Open) */
              <div className="max-w-xl mx-auto">
                <div className="w-14 h-14 bg-sky-100 text-sky-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Volume2 className="w-7 h-7" />
                </div>
                <p className="text-base text-slate-700 italic">
                  "{currentQuestion.promptText}"
                </p>
              </div>
            )}

            {/* Mic Status & Live Audio Wave */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    phase === 'recording'
                      ? 'bg-red-600 text-white shadow-lg ring-4 ring-red-100'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <Mic className="w-5 h-5" />
                </div>
                <div className="text-left text-xs">
                  <span className="font-bold text-slate-800 block">
                    {phase === 'recording' ? 'Microphone Active — Speak Now' : 'Listening to Audio Prompt...'}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Keep boom mic 3–5 cm from corner of mouth
                  </span>
                </div>
              </div>

              {/* Dynamic Speech Recognition Preview or Text input */}
              <div className="w-full max-w-lg mt-2">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-left min-h-[46px] flex items-center justify-between">
                  <div className="text-slate-700">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Your Response:</span>
                    <span className="font-medium">
                      {userTranscript || (phase === 'recording' ? 'Listening...' : 'Waiting for tone...')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row & Rules Reminders */}
          <div className="mt-6 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            {/* Quick "I don't know" button per PDF rule */}
            <button
              onClick={handleSayDontKnow}
              className="text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded px-3 py-1.5 bg-white hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              title="Per instructions: Don't know? Be silent or say 'I don't know'"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Say “I don't know” & Skip</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleNextQuestion}
                className="px-5 py-2 text-xs font-bold text-white bg-[#007788] hover:bg-[#005f6d] rounded transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>{currentIdx + 1 === totalQuestions ? 'Complete & Finish' : 'Next Item'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
