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
  gseScore: number;
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

export type VersantSectionId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface VersantQuestion {
  id: string;
  sectionId: VersantSectionId;
  sectionName: string;
  itemType: string;
  instructions: string;
  promptText: string;
  displayReadingText?: string;
  audioPromptText: string;
  expectedKeywords?: string[];
  prepTimeSeconds: number;
  responseDurationSeconds: number;
}

export interface AnswerSubmission {
  questionId: string;
  sectionId: VersantSectionId;
  sectionName: string;
  itemType: string;
  promptText: string;
  userTranscript: string;
  audioBlobUrl?: string;
  latencySeconds: number;
}

export interface SystemCheckState {
  micPermission: 'prompt' | 'granted' | 'denied';
  audioLevel: number;
  noiseLevelDb: number;
  quietRoomPassed: boolean;
  speakerTested: boolean;
  latencyMs: number;
  boomDistanceConfirmed: boolean;
  overallStatus: 'pending' | 'passed' | 'failed';
}
