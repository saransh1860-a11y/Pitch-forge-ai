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

async function parseApiResponse<T>(res: Response, defaultError: string): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  if (!res.ok) {
    if (contentType.includes('application/json')) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || defaultError);
    }
    const text = await res.text().catch(() => '');
    throw new Error(text && text.length < 150 ? text : defaultError);
  }
  if (!contentType.includes('application/json')) {
    throw new Error('Server returned an unexpected response format. Please try again.');
  }
  return res.json();
}

export async function analyzeStartupApi(intake: StartupIntake): Promise<StartupAnalysis> {
  const res = await fetch('/api/analyze-startup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ intake }),
  });
  return parseApiResponse<StartupAnalysis>(res, 'Failed to analyze startup with Gemini');
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
  const data = await parseApiResponse<{ slides: SlideData[] }>(res, 'Failed to generate 10-slide pitch with Gemini');
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
  return parseApiResponse<PitchScore>(res, 'Failed to score pitch deck');
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
  return parseApiResponse<InvestorCritique>(res, 'Failed to run AI investor critique');
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
  return parseApiResponse(res, 'Failed to improve slide with AI');
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
  return parseApiResponse(res, 'Failed to refine pitch with AI');
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
  return parseApiResponse<InvestorDecision>(res, 'Failed to evaluate investor decision');
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
  return parseApiResponse<AutonomousImprovementResult>(res, 'Failed to run autonomous investor improvement');
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
  return parseApiResponse<InvestorChallenge>(res, 'Failed to generate investor challenge');
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
  return parseApiResponse<ChallengeResolutionResult>(res, 'Failed to resolve investor challenge');
}

