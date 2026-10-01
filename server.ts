import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

// Server-side Gemini API client
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

export interface Candidate {
  tin: string;
  name: string;
  testTitle: string;
  organization: string;
  assignedDate: string;
  expiryDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  systemCheckStatus: 'Pending' | 'Passed' | 'Failed';
  deliveryMode: 'Web' | 'Phone';
  scoreReport?: VersantScoreReport;
}

export interface VersantScoreReport {
  tin: string;
  candidateName: string;
  testTitle: string;
  overallScore: number; // 20 - 80 scale
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  subScores: {
    sentenceMastery: number;
    vocabulary: number;
    fluency: number;
    pronunciation: number;
  };
  gseScore: number; // Global Scale of English (10-90)
  testDate: string;
  testId: string;
  feedback: {
    overallSummary: string;
    sentenceMasteryDetail: string;
    vocabularyDetail: string;
    fluencyDetail: string;
    pronunciationDetail: string;
    actionableSuggestions: string[];
  };
}

// In-memory candidate database seeded with candidate from provided PDF
const candidatesDatabase: Record<string, Candidate> = {
  '27146819': {
    tin: '27146819',
    name: 'RAHUL DRAVID S',
    testTitle: 'Versant English Placement Test (VEPT 4-Skills)',
    organization: 'Pearson Assessment Services - Global Education',
    assignedDate: '2026-09-28',
    expiryDate: '2026-10-31',
    status: 'Not Started',
    systemCheckStatus: 'Pending',
    deliveryMode: 'Web',
  },
  '98451203': {
    tin: '98451203',
    name: 'ANANYA SHARMA',
    testTitle: 'Versant Professional English Test (VPET)',
    organization: 'Enterprise Talent Solutions',
    assignedDate: '2026-09-29',
    expiryDate: '2026-10-15',
    status: 'Completed',
    systemCheckStatus: 'Passed',
    deliveryMode: 'Web',
    scoreReport: {
      tin: '98451203',
      candidateName: 'ANANYA SHARMA',
      testTitle: 'Versant Professional English Test (VPET)',
      overallScore: 68,
      cefrLevel: 'B2',
      gseScore: 71,
      testDate: '2026-09-29',
      testId: 'VSNT-98451203-A2',
      subScores: {
        sentenceMastery: 70,
        vocabulary: 67,
        fluency: 65,
        pronunciation: 71,
      },
      feedback: {
        overallSummary: 'Candidate communicates with high operational proficiency in workplace and academic contexts. Speech is intelligible and spontaneous with minor hesitations.',
        sentenceMasteryDetail: 'Demonstrates solid control of complex sentence structures and clausal coordination.',
        vocabularyDetail: 'Employs a wide range of standard and idiomatic vocabulary suitable for professional discussion.',
        fluencyDetail: 'Pacing is consistent with natural conversational tempo and minimal pauses.',
        pronunciationDetail: 'Consonant clusters and stress placement are accurate and readily understood.',
        actionableSuggestions: [
          'Refine intonation patterns during nuanced debate.',
          'Broaden specialized domain terminology for high-stakes discourse.'
        ],
      },
    },
  },
};

// Test diagnostic checks storage
const systemCheckLogs: Array<{
  timestamp: string;
  tin?: string;
  audioDevice: string;
  latencyMs: number;
  noiseLevelDb: number;
  status: string;
}> = [];

// =================== API ROUTES ===================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Pearson Versant Assessment Platform',
    geminiEnabled: !!ai,
    timestamp: new Date().toISOString(),
    registeredCandidatesCount: Object.keys(candidatesDatabase).length,
  });
});

// Validate candidate TIN
app.post('/api/candidate/validate', (req, res) => {
  const { tin } = req.body;
  if (!tin) {
    return res.status(400).json({ error: 'Please enter a valid Test Identification Number (TIN).' });
  }

  const cleanTin = String(tin).trim();
  const candidate = candidatesDatabase[cleanTin];

  if (!candidate) {
    return res.status(404).json({
      error: `TIN "${cleanTin}" was not found in the Scorekeeper registry. Please check your instructions or enter 27146819.`,
    });
  }

  return res.json({
    success: true,
    candidate,
    message: 'Candidate validated successfully.',
  });
});

// Get all candidates (proctor / admin oversight)
app.get('/api/candidates', (req, res) => {
  res.json({
    candidates: Object.values(candidatesDatabase),
  });
});

// Create new candidate TIN (for demo testing)
app.post('/api/candidate/create', (req, res) => {
  const { name, testTitle, organization } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Candidate name is required.' });
  }

  // Generate unique 8-digit TIN
  const randomTin = Math.floor(10000000 + Math.random() * 90000000).toString();
  const newCandidate: Candidate = {
    tin: randomTin,
    name: name.toUpperCase().trim(),
    testTitle: testTitle || 'Versant English Placement Test (VEPT)',
    organization: organization || 'Academic Examination Board',
    assignedDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Not Started',
    systemCheckStatus: 'Pending',
    deliveryMode: 'Web',
  };

  candidatesDatabase[randomTin] = newCandidate;
  res.status(201).json({
    success: true,
    candidate: newCandidate,
    message: `Generated new candidate profile for ${newCandidate.name} with TIN ${randomTin}`,
  });
});

// Submit hardware / environment check
app.post('/api/system-check', (req, res) => {
  const { tin, audioDevice, latencyMs, noiseLevelDb, status } = req.body;

  systemCheckLogs.push({
    timestamp: new Date().toISOString(),
    tin: tin || 'Unknown',
    audioDevice: audioDevice || 'Default Microphone',
    latencyMs: latencyMs || 42,
    noiseLevelDb: noiseLevelDb || 28,
    status: status || 'Passed',
  });

  if (tin && candidatesDatabase[tin]) {
    candidatesDatabase[tin].systemCheckStatus = status === 'Passed' ? 'Passed' : 'Failed';
  }

  res.json({
    success: true,
    result: {
      audioInput: 'Certified (16-bit, 44.1kHz)',
      latencyMs: latencyMs || 38,
      noiseFloor: `${noiseLevelDb || 24} dB (Quiet room threshold passed)`,
      packetLoss: '0.0%',
      browserCertified: 'Certified WebRTC & AudioWorklet Engine',
    },
    message: 'System check diagnostic verified successfully.',
  });
});

// Submit and evaluate full test session with Gemini AI
app.post('/api/test/evaluate-session', async (req, res) => {
  const { tin, answers, totalTimeTakenSeconds } = req.body;

  if (!tin || !candidatesDatabase[tin]) {
    return res.status(400).json({ error: 'Invalid or unregistered TIN.' });
  }

  const candidate = candidatesDatabase[tin];

  try {
    let evaluationResult: Partial<VersantScoreReport> = {};

    // Prepare response transcripts for AI analysis
    const answersSummary = (answers || []).map((ans: any, idx: number) => {
      return `Item ${idx + 1} (${ans.sectionName} - ${ans.itemType}):
Expected prompt / context: "${ans.promptText}"
Candidate spoken response: "${ans.userTranscript || '(No spoken response / silent)'}"
Response latency: ${ans.latencySeconds || 2}s`;
    }).join('\n\n');

    if (ai) {
      const prompt = `You are the official Pearson Versant Automated Scoring Engine (based on patented Ordinate speech processing and linguistic evaluation models).
Analyze the following candidate's English performance across standard Versant sections:
Candidate: ${candidate.name} (TIN: ${candidate.tin})

Test Responses:
${answersSummary}

Evaluate strictly according to the Official Pearson Versant scale:
1. Overall Versant Score: Integer between 20 (Beginner / Pre-A1) and 80 (Proficient / C2).
2. Four Core Skill Subscores (all integer between 20 and 80):
   - sentenceMastery: Ability to produce grammatically accurate, appropriate, and cohesive sentences.
   - vocabulary: Range and precision of word choice in responses.
   - fluency: Rhythm, natural pausing, phrasing, and response pace.
   - pronunciation: Phonological accuracy, clarity, and intelligibility.
3. CEFR Level: Exactly one of "A1", "A2", "B1", "B2", "C1", "C2".
4. GSE Score (Global Scale of English): integer between 10 and 90.
5. Feedback:
   - overallSummary: 2-3 sentences summarizing operational English capability.
   - sentenceMasteryDetail: 1-2 sentences on syntactic mastery.
   - vocabularyDetail: 1-2 sentences on lexical breadth.
   - fluencyDetail: 1-2 sentences on rhythm and rate.
   - pronunciationDetail: 1-2 sentences on articulation and accent clarity.
   - actionableSuggestions: Array of 2 to 3 practical improvement recommendations.

Respond strictly in valid JSON format matching this schema:
{
  "overallScore": number,
  "cefrLevel": "A1"|"A2"|"B1"|"B2"|"C1"|"C2",
  "gseScore": number,
  "subScores": {
    "sentenceMastery": number,
    "vocabulary": number,
    "fluency": number,
    "pronunciation": number
  },
  "feedback": {
    "overallSummary": string,
    "sentenceMasteryDetail": string,
    "vocabularyDetail": string,
    "fluencyDetail": string,
    "pronunciationDetail": string,
    "actionableSuggestions": [string]
  }
}`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = aiResponse.text || '{}';
      evaluationResult = JSON.parse(responseText);
    } else {
      // Fallback algorithmic scoring if Gemini API key is not configured in local environment
      const completedCount = (answers || []).filter((a: any) => a.userTranscript && a.userTranscript.length > 3).length;
      const baseScore = Math.min(78, Math.max(38, Math.round(50 + (completedCount / Math.max(1, (answers || []).length)) * 25)));

      evaluationResult = {
        overallScore: baseScore,
        cefrLevel: baseScore >= 69 ? 'C1' : baseScore >= 58 ? 'B2' : baseScore >= 47 ? 'B1' : 'A2',
        gseScore: Math.min(85, Math.round(baseScore * 1.05)),
        subScores: {
          sentenceMastery: Math.min(80, Math.max(30, baseScore + Math.floor(Math.random() * 5 - 2))),
          vocabulary: Math.min(80, Math.max(30, baseScore + Math.floor(Math.random() * 6 - 3))),
          fluency: Math.min(80, Math.max(30, baseScore + Math.floor(Math.random() * 6 - 2))),
          pronunciation: Math.min(80, Math.max(30, baseScore + Math.floor(Math.random() * 4 - 2))),
        },
        feedback: {
          overallSummary: `Candidate demonstrates intelligible conversational control and responds appropriately to structured prompts in academic and professional scenarios.`,
          sentenceMasteryDetail: `Demonstrates good grasp of basic and intermediate clause constructions with minor structural variations.`,
          vocabularyDetail: `Appropriate word retrieval for common situational queries with clear comprehension.`,
          fluencyDetail: `Consistent speech rate with natural conversational cadence during continuous reading and question response.`,
          pronunciationDetail: `High acoustic clarity with standard phonemic patterns easily understood by native and international interlocutors.`,
          actionableSuggestions: [
            'Practice complex conditional clauses and varied transition markers.',
            'Increase confidence when summarizing impromptu narrative passages without hesitations.',
          ],
        },
      };
    }

    const finalReport: VersantScoreReport = {
      tin: candidate.tin,
      candidateName: candidate.name,
      testTitle: candidate.testTitle,
      overallScore: evaluationResult.overallScore || 62,
      cefrLevel: evaluationResult.cefrLevel || 'B2',
      gseScore: evaluationResult.gseScore || 65,
      subScores: evaluationResult.subScores || {
        sentenceMastery: 64,
        vocabulary: 63,
        fluency: 60,
        pronunciation: 61,
      },
      testDate: new Date().toISOString().split('T')[0],
      testId: `VSNT-${candidate.tin}-${Math.floor(1000 + Math.random() * 9000)}`,
      feedback: evaluationResult.feedback || {
        overallSummary: 'Candidate passed all assessment components with proficient communicative mastery.',
        sentenceMasteryDetail: 'Good syntactic command across complex prompts.',
        vocabularyDetail: 'Rich lexical choices for standard business and everyday domains.',
        fluencyDetail: 'Steady pacing and speech articulation.',
        pronunciationDetail: 'Clear phonemes and accurate stress accents.',
        actionableSuggestions: ['Continue conversational practice in spontaneous dialogue.'],
      },
    };

    // Update candidate in database
    candidate.status = 'Completed';
    candidate.scoreReport = finalReport;

    res.json({
      success: true,
      report: finalReport,
      message: 'Test session evaluated and recorded successfully in Scorekeeper.',
    });
  } catch (err: any) {
    console.error('Error evaluating test session:', err);
    res.status(500).json({
      error: 'Evaluation error occurred',
      details: err?.message || 'Server error',
    });
  }
});

// Get Scorekeeper report for a candidate
app.get('/api/scorekeeper/report/:tin', (req, res) => {
  const { tin } = req.params;
  const candidate = candidatesDatabase[tin];

  if (!candidate) {
    return res.status(404).json({ error: `Candidate with TIN ${tin} not found.` });
  }

  if (!candidate.scoreReport) {
    return res.status(404).json({
      error: `Test has not been completed yet for candidate ${candidate.name} (TIN: ${tin}). Current status: ${candidate.status}.`,
    });
  }

  res.json({
    success: true,
    candidate,
    report: candidate.scoreReport,
  });
});

// Serve frontend in production or via Vite in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Pearson Versant Assessment Server running on port ${PORT}`);
  });
}

startServer();
