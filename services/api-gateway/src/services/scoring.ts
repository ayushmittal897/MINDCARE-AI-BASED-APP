import type { QuestionnaireAnswer, ScreeningDomainScore, ScreeningRequest } from "@mindcare/types";

export const QUESTIONS = [
  // Mood (PHQ-9 inspired)
  { id: 1, text: "How often have you felt unusually low or down recently?", domain: "Mood", scoringDirection: "higher_is_concerning" },
  { id: 2, text: "How often do you feel hopeless about the future?", domain: "Mood", scoringDirection: "higher_is_concerning" },
  { id: 3, text: "How often have you felt bad about yourself, or that you are a failure?", domain: "Mood", scoringDirection: "higher_is_concerning" },
  
  // Interest / Pleasure
  { id: 4, text: "How often do you have little interest or pleasure in doing things you usually enjoy?", domain: "Interest", scoringDirection: "higher_is_concerning" },
  { id: 5, text: "How often do you feel a sense of enjoyment in your daily activities?", domain: "Interest", scoringDirection: "lower_is_concerning" },
  
  // Anxiety (GAD-7 inspired)
  { id: 6, text: "How often do you feel nervous, anxious, or on edge?", domain: "Anxiety", scoringDirection: "higher_is_concerning" },
  { id: 7, text: "How often do you feel you cannot stop or control worrying?", domain: "Anxiety", scoringDirection: "higher_is_concerning" },
  { id: 8, text: "How often do you have trouble relaxing?", domain: "Anxiety", scoringDirection: "higher_is_concerning" },
  
  // Worry
  { id: 9, text: "How often do you worry too much about different things?", domain: "Worry", scoringDirection: "higher_is_concerning" },
  { id: 10, text: "How often do you feel afraid, as if something awful might happen?", domain: "Worry", scoringDirection: "higher_is_concerning" },
  
  // Stress
  { id: 11, text: "How often do you feel overwhelmed by your responsibilities?", domain: "Stress", scoringDirection: "higher_is_concerning" },
  { id: 12, text: "How often do you feel capable of coping with the things you have to do?", domain: "Stress", scoringDirection: "lower_is_concerning" },
  
  // Sleep
  { id: 13, text: "How often do you have trouble falling asleep or staying asleep?", domain: "Sleep", scoringDirection: "higher_is_concerning" },
  { id: 14, text: "How often do you sleep too much?", domain: "Sleep", scoringDirection: "higher_is_concerning" },
  { id: 15, text: "How often do you wake up feeling well-rested?", domain: "Sleep", scoringDirection: "lower_is_concerning" },
  
  // Energy
  { id: 16, text: "How often do you feel tired or have little energy?", domain: "Energy", scoringDirection: "higher_is_concerning" },
  { id: 17, text: "How often do you feel vibrant and energetic throughout the day?", domain: "Energy", scoringDirection: "lower_is_concerning" },
  
  // Concentration
  { id: 18, text: "How often do you have trouble concentrating on things, such as reading or watching TV?", domain: "Concentration", scoringDirection: "higher_is_concerning" },
  { id: 19, text: "How often do you find it easy to focus on complex tasks?", domain: "Concentration", scoringDirection: "lower_is_concerning" },
  
  // Motivation
  { id: 20, text: "How often do you feel motivated to start new projects or tasks?", domain: "Motivation", scoringDirection: "lower_is_concerning" },
  { id: 21, text: "How often do you find yourself procrastinating because you lack the drive?", domain: "Motivation", scoringDirection: "higher_is_concerning" },
  
  // Social connection
  { id: 22, text: "How often do you feel connected and close to the people around you?", domain: "Social Connection", scoringDirection: "lower_is_concerning" },
  { id: 23, text: "How often do you withdraw from friends or social activities?", domain: "Social Connection", scoringDirection: "higher_is_concerning" },
  
  // Loneliness
  { id: 24, text: "How often do you feel lonely or isolated?", domain: "Loneliness", scoringDirection: "higher_is_concerning" },
  
  // Daily functioning
  { id: 25, text: "How often do your feelings interfere with your ability to get your work done?", domain: "Functioning", scoringDirection: "higher_is_concerning" },
  { id: 26, text: "How often do you successfully manage your daily chores and self-care?", domain: "Functioning", scoringDirection: "lower_is_concerning" },
  
  // Emotional regulation
  { id: 27, text: "How often do you become easily annoyed or irritable?", domain: "Emotional Regulation", scoringDirection: "higher_is_concerning" },
  { id: 28, text: "How often do you feel in control of your emotional reactions?", domain: "Emotional Regulation", scoringDirection: "lower_is_concerning" },
  { id: 29, text: "How often do you experience sudden mood swings?", domain: "Emotional Regulation", scoringDirection: "higher_is_concerning" },
  
  // Coping
  { id: 30, text: "How often do you use healthy strategies (like exercise or talking) to deal with stress?", domain: "Coping", scoringDirection: "lower_is_concerning" },
  { id: 31, text: "How often do you turn to unhealthy habits when you feel distressed?", domain: "Coping", scoringDirection: "higher_is_concerning" },
  
  // Positive well-being (WHO-5 inspired)
  { id: 32, text: "How often do you feel cheerful and in good spirits?", domain: "Well-being", scoringDirection: "lower_is_concerning" },
  { id: 33, text: "How often do you feel calm and relaxed?", domain: "Well-being", scoringDirection: "lower_is_concerning" },
  { id: 34, text: "How often do you feel active and vigorous?", domain: "Well-being", scoringDirection: "lower_is_concerning" },
  { id: 35, text: "How often do you wake up feeling fresh and rested?", domain: "Well-being", scoringDirection: "lower_is_concerning" },
  { id: 36, text: "How often do you feel that your daily life is filled with things that interest you?", domain: "Well-being", scoringDirection: "lower_is_concerning" },
  
  // Miscellaneous / Self-harm (Safety)
  { id: 37, text: "How often do you feel that your life has meaning and purpose?", domain: "Well-being", scoringDirection: "lower_is_concerning" },
  { id: 38, text: "How often do you feel proud of something you've accomplished recently?", domain: "Well-being", scoringDirection: "lower_is_concerning" },
  { id: 39, text: "How often do you have thoughts that you would be better off dead, or of hurting yourself?", domain: "Safety", scoringDirection: "higher_is_concerning", isSafetyTrigger: true },
  { id: 40, text: "How often do you feel completely unable to cope with life's demands?", domain: "Functioning", scoringDirection: "higher_is_concerning" },
];

export function calculateDomainScores(answers: QuestionnaireAnswer[]): {
  domains: Record<string, ScreeningDomainScore>;
  overallScore: number;
  safetyTriggered: boolean;
} {
  const domainTotals: Record<string, { current: number; max: number }> = {};
  let safetyTriggered = false;

  for (const q of QUESTIONS) {
    domainTotals[q.domain] = { current: 0, max: 0 };
  }

  for (const ans of answers) {
    const q = QUESTIONS.find((x) => x.id === ans.questionId);
    if (!q) continue;

    if (q.isSafetyTrigger && ans.answer > 0) {
      safetyTriggered = true;
    }

    // Determine score contribution. 0-3 scale.
    // If higher_is_concerning: score is the answer value.
    // If lower_is_concerning: score is (3 - answer value).
    const scoreVal = q.scoringDirection === "higher_is_concerning" ? ans.answer : 3 - ans.answer;

    if (!domainTotals[q.domain]) domainTotals[q.domain] = { current: 0, max: 0 };
    domainTotals[q.domain].current += scoreVal;
    domainTotals[q.domain].max += 3;
  }

  const domains: Record<string, ScreeningDomainScore> = {};
  let totalScore = 0;
  let totalMax = 0;

  for (const [domain, totals] of Object.entries(domainTotals)) {
    if (totals.max === 0) continue; // Skip unused domains
    const normalized = Math.round((totals.current / totals.max) * 100);
    
    let category: ScreeningDomainScore["category"] = "Lower reported concern";
    if (normalized >= 75) category = "Higher indicators";
    else if (normalized >= 50) category = "Moderate indicators";
    else if (normalized >= 25) category = "Mild indicators";

    domains[domain] = { domain, score: normalized, category };
    
    totalScore += totals.current;
    totalMax += totals.max;
  }

  const overallScore = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

  return { domains, overallScore, safetyTriggered };
}

export function getInterpretation(score: number): string {
  if (score >= 75) return "The responses indicate a higher level of reported concern across several assessed areas.";
  if (score >= 50) return "The responses indicate a moderate level of reported concern across several assessed areas.";
  if (score >= 25) return "The responses indicate a mild level of reported concern across several assessed areas.";
  return "The responses indicate a lower level of reported concern across the assessed areas.";
}

export function generateMultimodalContributions(
  req: ScreeningRequest,
  questionnaireScore: number
): {
  questionnaireWeight: number;
  linguisticWeight: number;
  acousticWeight: number;
  visualWeight: number;
  contributions: Record<string, number>;
  signalAgreement: Record<string, string>;
} {
  // If there's an actual multimodal model, we would fetch its results.
  // For now, we simulate the fusion. The real application has existing weights:
  // e.g., wA, wV, wL from `mlClient`.
  
  const hasText = !!req.transcript;
  const hasAudio = !!req.audioBase64;
  const hasVisual = !!req.videoBase64;

  let linguisticWeight = hasText ? 0.20 : 0;
  let acousticWeight = hasAudio ? 0.15 : 0;
  let visualWeight = hasVisual ? 0.15 : 0;
  let questionnaireWeight = 1.0 - (linguisticWeight + acousticWeight + visualWeight);
  
  if (questionnaireWeight < 0) questionnaireWeight = 0;

  // Signal agreement logic
  const signalAgreement: Record<string, string> = {
    Questionnaire: getInterpretation(questionnaireScore).includes("higher") ? "Higher indicators" 
                 : getInterpretation(questionnaireScore).includes("moderate") ? "Moderate indicators" 
                 : getInterpretation(questionnaireScore).includes("mild") ? "Mild indicators" 
                 : "Lower reported concern",
  };

  if (hasText) signalAgreement["Linguistic"] = questionnaireScore > 50 ? "Moderate indicators" : "Mild indicators";
  else signalAgreement["Linguistic"] = "Limited signal";

  if (hasAudio) signalAgreement["Acoustic"] = questionnaireScore > 60 ? "Moderate indicators" : "Mild indicators";
  else signalAgreement["Acoustic"] = "Limited signal";

  if (hasVisual) signalAgreement["Visual"] = questionnaireScore > 70 ? "Moderate indicators" : "Mild indicators";
  else signalAgreement["Visual"] = "Limited signal";

  return {
    questionnaireWeight,
    linguisticWeight,
    acousticWeight,
    visualWeight,
    contributions: {
      Questionnaire: questionnaireScore,
      Linguistic: hasText ? questionnaireScore * 0.9 : 0,
      Acoustic: hasAudio ? questionnaireScore * 0.8 : 0,
      Visual: hasVisual ? questionnaireScore * 0.85 : 0,
    },
    signalAgreement
  };
}
