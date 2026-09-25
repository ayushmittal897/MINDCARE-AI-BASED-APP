export type PredictionClass =
  | "Healthy"
  | "MildDep"
  | "ModDep"
  | "SevDep"
  | "MildAnx"
  | "ModAnx";

export interface ModalityWeights {
  wA: number;
  wV: number;
  wL: number;
}

export interface ModalityConfidences {
  cA: number;
  cV: number;
  cL: number;
}

export interface ClassProbability {
  label: PredictionClass;
  probability: number;
}

export interface SHAPFeatureContribution {
  feature: string;
  modality: "acoustic" | "visual" | "linguistic";
  value: number;
}

export interface AnalysisResult {
  sessionId: string;
  displayId?: string;
  prediction: PredictionClass;
  probabilities: ClassProbability[];
  confidences: ModalityConfidences;
  weights: ModalityWeights;
  shapRankings: SHAPFeatureContribution[];
  userSummary: string;
  medicalSummary: string;
  createdAt: string;
  inputs?: any;
}

export interface ClinicalReport {
  sessionId: string;
  displayId?: string;
  userSummary: string;
  medicalSummary: string;
  featureHighlights: SHAPFeatureContribution[];
  weights: ModalityWeights;
  screeningJson?: ScreeningResult;
  generatedAt: string;
}

export interface User {
  id: string;
  patientId: string;
  email: string;
  name?: string;
  role: "patient" | "clinician" | "pending_clinician" | "admin";
  createdAt: string;
}

export interface SessionSummary {
  id: string;
  displayId?: string;
  userId: string;
  startedAt: string;
  endedAt?: string;
  topPrediction?: PredictionClass;
  type: "session" | "screening";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  name?: string;
  role?: "USER" | "DOCTOR";
}

export interface AuthTokens {
  accessToken: string;
  expiresIn: number;
}

export interface QuestionnaireAnswer {
  questionId: number;
  answer: number;
}

export interface ScreeningDomainScore {
  domain: string;
  score: number; // 0-100
  category: "Lower reported concern" | "Mild indicators" | "Moderate indicators" | "Higher indicators";
}

export interface ScreeningResult {
  sessionId: string;
  displayId?: string;
  timestamp: string;

  questionnaire: {
    totalQuestions: number;
    answeredQuestions: number;
    answers: QuestionnaireAnswer[];
    domainScores: Record<string, ScreeningDomainScore>;
  };

  multimodal: {
    questionnaireWeight: number;
    linguisticWeight: number;
    acousticWeight: number;
    visualWeight: number;
    contributions: Record<string, number>;
  };

  screeningIndex: {
    score: number;
    interpretation: string;
  };

  domains: Record<string, ScreeningDomainScore>;
  
  keyFactors: {
    feature: string;
    contribution: number;
  }[];

  signalAgreement: Record<string, string>;

  safety: {
    triggered: boolean;
    status: string;
  };

  summary: string;
  recommendations: string[];
  researchSources: { title: string; url: string }[];
  disclaimer: string;
}

export interface ScreeningRequest {
  answers: QuestionnaireAnswer[];
  transcript?: string;
  audioBase64?: string;
  videoBase64?: string;
}
