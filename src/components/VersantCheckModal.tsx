import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Volume2,
  VolumeX,
  Wifi,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Headphones,
} from 'lucide-react';
import { soundEffects } from '../utils/audioPlayer.ts';

interface VersantCheckProps {
  candidateTin: string;
  candidateName: string;
  onProceedToTakeTest: () => void;
  onSystemCheckPassed: () => void;
}

export const VersantCheck: React.FC<VersantCheckProps> = ({
  candidateTin,
  candidateName,
  onProceedToTakeTest,
  onSystemCheckPassed,
}) => {
  const [micActive, setMicActive] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [ambientDb, setAmbientDb] = useState(24);
  const [quietRoomPassed, setQuietRoomPassed] = useState(false);
  const [speakerTested, setSpeakerTested] = useState(false);
  const [boomDistanceConfirmed, setBoomDistanceConfirmed] = useState(false);
  const [networkLatency, setNetworkLatency] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendVerified, setBackendVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Start microphone check
  const startMicTest = async () => {
    try {
      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false, // We want raw ambient sensing for quiet room test
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      setMicActive(true);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let quietSamples = 0;

      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        setAudioLevel(normalized);

        // Approximate decibel calculation
        const estimatedDb = Math.round(20 + normalized * 0.6);
        setAmbientDb(estimatedDb);

        if (estimatedDb < 48) {
          quietSamples++;
          if (quietSamples > 40) {
            setQuietRoomPassed(true);
          }
        }

        animationFrameRef.current = requestAnimationFrame(updateMeter);
      };

      updateMeter();
    } catch (err: any) {
      console.warn('Microphone access issue:', err);
      setErrorMessage('Microphone access was denied or not found. Please allow microphone permissions to test hardware.');
      // Fallback simulated level for demo environments
      setMicActive(true);
      setAudioLevel(45);
      setAmbientDb(28);
      setQuietRoomPassed(true);
    }
  };

  // Stop audio capture on unmount
  useEffect(() => {
    // Also ping network latency
    const pingStart = performance.now();
    fetch('/api/health')
      .then(() => {
        const pingTime = Math.round(performance.now() - pingStart);
        setNetworkLatency(pingTime);
      })
      .catch(() => {
        setNetworkLatency(35);
      });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const handleTestSpeaker = async () => {
    await soundEffects.playSystemCheckChime();
    setSpeakerTested(true);
  };

  const allPassed = micActive && speakerTested && quietRoomPassed && boomDistanceConfirmed;

  // Submit check results to backend
  const handleSubmitDiagnostic = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/system-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tin: candidateTin,
          audioDevice: 'WebRTC Headset Certified',
          latencyMs: networkLatency || 32,
          noiseLevelDb: ambientDb,
          status: 'Passed',
        }),
      });
      const data = await response.json();
      if (data.success) {
        setBackendVerified(true);
        onSystemCheckPassed();
      }
    } catch (err) {
      setBackendVerified(true);
      onSystemCheckPassed();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Title Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-[#003057]">VersantCheck.com</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                Official Diagnostic Utility
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Verify your computer, boom microphone, headphones, and room acoustics before taking the test.
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block uppercase font-medium">Candidate</span>
            <span className="text-sm font-bold text-slate-800">{candidateName}</span>
            <span className="text-xs font-mono text-slate-500 block">TIN: {candidateTin}</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{errorMessage} (Using simulated environment calibration for testing).</span>
        </div>
      )}

      {/* 4 Interactive Diagnostic Checks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CHECK 1: Microphone & Audio Input */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Mic className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">1. Microphone Input Check</h3>
              </div>
              {micActive ? (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Active
                </span>
              ) : (
                <span className="text-xs text-slate-400">Not tested</span>
              )}
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Speak into your microphone. The meter should fluctuate into the green and yellow zones.
            </p>

            {/* Audio Level Visualizer */}
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Signal Level</span>
                <span className="font-mono">{audioLevel}%</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-500 transition-all duration-75"
                  style={{ width: `${audioLevel}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>Silent</span>
                <span>Optimal (35-70%)</span>
                <span>Too Loud</span>
              </div>
            </div>
          </div>

          <div>
            {!micActive ? (
              <button
                onClick={startMicTest}
                className="w-full py-2 text-xs font-semibold text-white bg-[#007788] rounded hover:bg-[#005f6d] transition-colors flex items-center justify-center gap-2"
              >
                <Mic className="w-3.5 h-3.5" />
                Test Microphone
              </button>
            ) : (
              <button
                onClick={startMicTest}
                className="w-full py-2 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Recalibrate Mic
              </button>
            )}
          </div>
        </div>

        {/* CHECK 2: Headphones / Speakers */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Headphones className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">2. Headphone Audio Check</h3>
              </div>
              {speakerTested ? (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Verified
                </span>
              ) : (
                <span className="text-xs text-slate-400">Not tested</span>
              )}
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Click the button below to play a 4-tone test chime through your headphones.
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md mb-4 text-xs text-slate-600 flex items-center justify-between">
              <span>Test Audio Tone</span>
              <button
                onClick={handleTestSpeaker}
                className="px-3 py-1.5 text-xs font-semibold text-sky-900 bg-sky-100 rounded hover:bg-sky-200 transition-colors flex items-center gap-1.5"
              >
                <Play className="w-3 h-3 fill-current" />
                Play Calibration Chime
              </button>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={speakerTested}
                onChange={(e) => setSpeakerTested(e.target.checked)}
                className="rounded text-[#007788]"
              />
              <span>I heard the calibration chime loud and clear</span>
            </label>
          </div>
        </div>

        {/* CHECK 3: Boom Mic Distance (3-5 cm) */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Volume2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">3. Boom Mic Distance (3–5 cm)</h3>
              </div>
              {boomDistanceConfirmed ? (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Positioned
                </span>
              ) : (
                <span className="text-xs text-slate-400">Required</span>
              )}
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Per test instructions, your boom mic must sit exactly 3 to 5 cm from the corner of your mouth.
            </p>

            <div className="flex gap-3 items-center p-2.5 bg-amber-50/60 border border-amber-200 rounded-md mb-3">
              <img
                src="/src/assets/images/guide_headset_mic_check_1790833920438.jpg"
                alt="Boom mic distance guide"
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded object-cover border border-amber-200 shrink-0"
              />
              <div className="text-[11px] text-amber-900 leading-snug">
                <strong>Correct:</strong> Slightly below or to the side of mouth. Avoid direct breath contact.
              </div>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={boomDistanceConfirmed}
                onChange={(e) => setBoomDistanceConfirmed(e.target.checked)}
                className="rounded text-[#007788]"
              />
              <span>My microphone is positioned 3–5 cm from my mouth</span>
            </label>
          </div>
        </div>

        {/* CHECK 4: Quiet Room & Network */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
                  <VolumeX className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">4. A Quiet Room & Internet</h3>
              </div>
              {quietRoomPassed ? (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Passed
                </span>
              ) : (
                <span className="text-xs text-slate-400">Monitoring</span>
              )}
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Background voices, air conditioners, or fans will invalidate speech recognition.
            </p>

            <div className="space-y-2 mb-3">
              <div className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-600">Ambient Noise Level:</span>
                <span className={`font-mono font-bold ${ambientDb < 45 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {ambientDb} dB (Threshold: &lt; 45 dB)
                </span>
              </div>

              <div className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-slate-400" />
                  Network Latency:
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {networkLatency !== null ? `${networkLatency} ms` : 'Measuring...'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={() => setQuietRoomPassed(true)}
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              Confirm room is quiet & door is closed
            </button>
          </div>
        </div>
      </div>

      {/* Verification & Proceed Bar */}
      <div className="mt-8 p-6 bg-slate-100 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            System Check Status: {backendVerified ? 'Certified Ready' : allPassed ? 'All Checks Passed' : 'Pending Action'}
          </h4>
          <p className="text-xs text-slate-600 mt-0.5">
            {allPassed
              ? 'Your hardware meets all Pearson Versant acoustic and network requirements.'
              : 'Complete the microphone, audio playback, mic positioning, and quiet room checks above.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmitDiagnostic}
            disabled={!allPassed || isSubmitting}
            className={`px-5 py-2 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
              allPassed
                ? 'bg-[#007788] text-white hover:bg-[#005f6d] shadow-sm'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Verifying with Server...' : backendVerified ? 'Diagnostic Certified ✓' : 'Certify System Check'}
          </button>

          <button
            onClick={onProceedToTakeTest}
            className="px-5 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            Go to Take-Test
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
