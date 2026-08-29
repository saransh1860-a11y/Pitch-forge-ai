import {
  StartupIntake,
  StartupAnalysis,
  SlideData,
  PitchScore,
  InvestorCritique,
  InvestorDecision,
  AutonomousImprovementResult,
  InvestorChallenge,
  ChallengeResolutionResult,
} from '../types/pitch';

export async function analyzeStartupApi(intake: StartupIntake): Promise<StartupAnalysis> {
  const res = await fetch('/api/analyze-startup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ intake }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to analyze startup with Gemini');
  }
  return res.json();
}

export async function generatePitchApi(
  intake: StartupIntake,
  analysis?: StartupAnalysis
): Promise<SlideData[]> {
  const res = await fetch('/api/generate-pitch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ intake, analysis }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to generate 10-slide pitch with Gemini');
  }
  const data = await res.json();
  return data.slides;
}

export async function scorePitchApi(
  intake: StartupIntake,
  slides: SlideData[],
  analysis?: StartupAnalysis
): Promise<PitchScore> {
  const res = await fetch('/api/score-pitch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ intake, slides, analysis }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to score pitch deck');
  }
  return res.json();
}

export async function critiquePitchApi(
  intake: StartupIntake,
  slides: SlideData[]
): Promise<InvestorCritique> {
  const res = await fetch('/api/critique-pitch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ intake, slides }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to run AI investor critique');
  }
  return res.json();
}

export async function improveSlideApi(
  slide: SlideData,
  instruction: 'improve' | 'concise' | 'strengthen_investor_arg' | 'find_unsupported' | 'suggest_layout' | 'explain_why_matters' | 'custom',
  customPrompt?: string,
  startupContext?: string
): Promise<{
  improvedSlide: SlideData;
  explanation: string;
  changesSummary: string[];
}> {
  const res = await fetch('/api/improve-slide', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slide, instruction, customPrompt, startupContext }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to improve slide with AI');
  }
  return res.json();
}

export async function improvePitchApi(
  intake: StartupIntake,
  slides: SlideData[],
  critique: InvestorCritique
): Promise<{
  improvedSlides: SlideData[];
  improvementLog: string[];
}> {
  const res = await fetch('/api/improve-pitch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ intake, slides, critique }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to refine pitch with AI');
  }
  return res.json();
}

export async function evaluateInvestorDecisionApi(
  intake: StartupIntake,
  slides: SlideData[],
  score: PitchScore,
  analysis?: StartupAnalysis
): Promise<InvestorDecision> {
  const res = await fetch('/api/investor-decision', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ intake, slides, score, analysis }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to evaluate investor decision');
  }
  return res.json();
}

export async function autonomousImprovePitchApi(
  intake: StartupIntake,
  slides: SlideData[],
  currentScore: PitchScore,
  critique: InvestorCritique,
  decision?: InvestorDecision,
  analysis?: StartupAnalysis
): Promise<AutonomousImprovementResult> {
  const res = await fetch('/api/autonomous-improve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ intake, slides, currentScore, critique, decision, analysis }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to run autonomous investor improvement');
  }
  return res.json();
}

export async function generateInvestorChallengeApi(
  intake: StartupIntake,
  slides: SlideData[],
  score?: PitchScore,
  critique?: InvestorCritique,
  decision?: InvestorDecision
): Promise<InvestorChallenge> {
  const res = await fetch('/api/generate-challenge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ intake, slides, score, critique, decision }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to generate investor challenge');
  }
  return res.json();
}

export async function resolveInvestorChallengeApi(
  intake: StartupIntake,
  slides: SlideData[],
  currentScore: PitchScore,
  challenge: InvestorChallenge,
  founderAnswer: string,
  analysis?: StartupAnalysis
): Promise<ChallengeResolutionResult> {
  const res = await fetch('/api/resolve-challenge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ intake, slides, currentScore, challenge, founderAnswer, analysis }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to resolve investor challenge');
  }
  return res.json();
}
