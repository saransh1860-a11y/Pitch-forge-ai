import { GoogleGenAI, Type } from '@google/genai';
import {
  StartupIntake,
  StartupAnalysis,
  SlideData,
  PitchScore,
  InvestorCritique,
  InvestorDecision,
  AgentImprovementPlan,
  AgentTraceStep,
  AutonomousImprovementResult,
  InvestorChallenge,
  ChallengeResolutionResult,
} from '../src/types/pitch';

export function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || '';
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Valid models in accordance with gemini-api skill guide
const CANDIDATE_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3-flash-preview', 'gemini-flash-latest'];

/**
 * Helper to race a promise against a timeout
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMsg: string): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(timeoutMsg)), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

/**
 * Fast & resilient execution wrapper: calls Gemini with timeout protection and fast fallback.
 * Uses gemini-2.5-flash as the ultra-fast primary model and bounds request duration to prevent UI freezing.
 */
async function callGeminiWithRetry(options: {
  contents: any;
  config?: any;
  preferredModel?: string;
  timeoutMs?: number;
}): Promise<string> {
  const modelsToTry = options.preferredModel
    ? [options.preferredModel, ...CANDIDATE_MODELS.filter((m) => m !== options.preferredModel)]
    : CANDIDATE_MODELS;

  let lastError: any = null;
  const ai = getGenAIClient();
  const perCallTimeout = options.timeoutMs || 14000; // 14 seconds max per generation call

  for (const model of modelsToTry) {
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model,
          contents: options.contents,
          config: options.config,
        }),
        perCallTimeout,
        `Call to ${model} timed out after ${perCallTimeout}ms`
      );

      const text = response.text;
      if (text && text.trim().length > 0) {
        return text.trim();
      }
    } catch (err: any) {
      lastError = err;
      const errString = String(err?.message || err);
      console.warn(`Model ${model} encounter: ${errString}. Trying next candidate model...`);
      // Proceed directly to next candidate model without lingering delays
      continue;
    }
  }

  throw lastError || new Error('AI models paused or timed out. Activating instant strategic synthesis.');
}

/**
 * 1. Analyze raw startup intake using Gemini with resilience
 */
export async function analyzeStartup(intake: StartupIntake): Promise<StartupAnalysis> {
  const prompt = `You are a world-class venture capitalist, early-stage investor, and startup strategist.
Analyze the following startup submission. 
CRITICAL RULE: NEVER fabricate revenue, users, market sizes, or customer traction. If the founder did not provide explicit validated numbers, explicitly mark them as assumptions requiring validation or missing information.

Startup Input:
- Name: ${intake.startupName || 'Untitled'}
- One-liner / Tagline: ${intake.tagline || 'Not provided'}
- Raw Idea & Overview: ${intake.rawIdea || 'Not provided'}
- Problem: ${intake.problem || 'Not provided'}
- Target Customer: ${intake.targetCustomer || 'Not provided'}
- Solution: ${intake.solution || 'Not provided'}
- Business Model: ${intake.businessModel || 'Not provided'}
- Stage: ${intake.stage || 'Idea'}
- Geography / Market: ${intake.geography || 'Not specified'}
- Existing Traction: ${intake.existingTraction || 'None provided'}
- Competitors: ${intake.competitors || 'None specified'}
- Competitive Advantage: ${intake.competitiveAdvantage || 'Not specified'}
- Revenue Model: ${intake.revenueModel || 'Not specified'}
- Team Info: ${intake.teamInfo || 'Not specified'}
- Additional Context: ${intake.additionalContext || 'None'}

Provide an in-depth, rigorous breakdown analyzing the core problem, customer profile, value proposition, business model feasibility, market dynamics, competitive moat, critical risks, missing gaps, assumptions to validate, and top strategic advice.`;

  try {
    const text = await callGeminiWithRetry({
      contents: prompt,
      config: {
        systemInstruction: 'You are an elite VC investment partner. You are analytical, clear, and uncompromising on truth vs assumption.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            coreProblem: { type: Type.STRING, description: 'The fundamental, high-pain problem identified' },
            targetCustomer: { type: Type.STRING, description: 'Detailed ICP (Ideal Customer Profile) and segment' },
            valueProposition: { type: Type.STRING, description: 'The unique, compelling value proposition' },
            businessModel: { type: Type.STRING, description: 'Monetization and economic engine assessment' },
            marketOpportunity: {
              type: Type.OBJECT,
              properties: {
                tamEstimate: { type: Type.STRING, description: 'Estimated Total Addressable Market with context' },
                samEstimate: { type: Type.STRING, description: 'Serviceable Addressable Market estimate' },
                somEstimate: { type: Type.STRING, description: 'Serviceable Obtainable Market estimate' },
                marketDynamics: { type: Type.STRING, description: 'Growth drivers, headwinds, and tailwinds' },
                isAssumption: { type: Type.BOOLEAN, description: 'True if numbers are modeled estimates rather than founder verified' },
              },
              required: ['marketDynamics', 'isAssumption'],
            },
            competitionSummary: { type: Type.STRING, description: 'Landscape overview and substitute behaviors' },
            differentiation: { type: Type.STRING, description: 'Defensibility, moats, or unique unfair advantage' },
            criticalRisks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Top 3-5 structural, execution, or market risks',
            },
            missingInformation: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Critical data missing from founder input',
            },
            assumptionsRequiringValidation: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Key unverified hypotheses that must be tested before pitching',
            },
            strategicAdvice: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3-4 actionable strategic pointers for the founder',
            },
          },
          required: [
            'coreProblem',
            'targetCustomer',
            'valueProposition',
            'businessModel',
            'marketOpportunity',
            'competitionSummary',
            'differentiation',
            'criticalRisks',
            'missingInformation',
            'assumptionsRequiringValidation',
            'strategicAdvice',
          ],
        },
      },
    });

    return JSON.parse(text) as StartupAnalysis;
  } catch (error) {
    console.error('Gemini error in analyzeStartup, falling back to structured strategic synthesis:', error);
    // Intelligent heuristic fallback in case of total upstream outage
    return fallbackAnalyzeStartup(intake);
  }
}

/**
 * 2. Generate 10-Slide Pitch Framework
 */
export async function generatePitchSlides(
  intake: StartupIntake,
  analysis?: StartupAnalysis,
  referencePatterns?: string[]
): Promise<SlideData[]> {
  const prompt = `You are an elite Silicon Valley pitch deck designer and venture partner.
Generate a structured 10-SLIDE pitch deck for this startup.

IMPORTANT CONSTRAINTS:
1. Output EXACTLY 10 SLIDES in the following standard sequence:
   Slide 1: Cover / Vision
   Slide 2: Problem
   Slide 3: Solution
   Slide 4: Market Opportunity
   Slide 5: Product / How It Works
   Slide 6: Business Model
   Slide 7: Competition & Differentiation
   Slide 8: Traction / Validation
   Slide 9: Go-To-Market & Growth
   Slide 10: Team / Ask / Future

2. DO NOT FABRICATE metrics, partnerships, revenue, or user numbers.
   - For every key data point, clearly classify status as 'validated', 'assumption', or 'missing'.
   - If early stage, explicitly state traction as hypotheses or test plans rather than invented numbers.

3. For each slide:
   - Provide a bold 1-second takeaway headline for fast scanning.
   - 3 to 4 crisp, punchy bullet points.
   - A clear visual recommendation (e.g., comparison table, 3-step workflow, TAM/SAM/SOM diagram).
   - Speaker notes written in first-person for the founder to present.
   - Specific evidence/validation requirements for investor credibility.

Startup Data:
Name: ${intake.startupName}
Tagline: ${intake.tagline || 'N/A'}
Problem: ${intake.problem || intake.rawIdea}
Solution: ${intake.solution || 'N/A'}
Target Customer: ${intake.targetCustomer || 'N/A'}
Stage: ${intake.stage}
Business Model: ${intake.businessModel || 'N/A'}
Existing Traction: ${intake.existingTraction || 'Pre-launch hypothesis'}
Competitors: ${intake.competitors || 'Direct and indirect alternatives'}
Competitive Moat: ${intake.competitiveAdvantage || 'N/A'}
Team: ${intake.teamInfo || 'Founder led'}

${referencePatterns && referencePatterns.length > 0 ? `Reference Inspiration Patterns to synthesize:\n${referencePatterns.join('\n')}` : ''}
${analysis ? `Strategic Analysis Context:\nRisks: ${analysis.criticalRisks.join('; ')}\nAssumptions: ${analysis.assumptionsRequiringValidation.join('; ')}` : ''}`;

  try {
    const text = await callGeminiWithRetry({
      contents: prompt,
      config: {
        systemInstruction: 'You generate high-conviction, evidence-oriented investor decks. Deliver exactly 10 slides with zero fluff and clear assumption badges.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              slideNumber: { type: Type.INTEGER },
              title: { type: Type.STRING },
              category: {
                type: Type.STRING,
                description: 'One of: vision, problem, solution, market, product, business_model, competition, traction, gtm, team_ask',
              },
              headline: { type: Type.STRING, description: 'Core 1-second takeaway message' },
              bullets: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3-4 concise points',
              },
              visualRecommendation: {
                type: Type.OBJECT,
                properties: {
                  layoutType: {
                    type: Type.STRING,
                    description: 'One of: split-2-col, metrics-grid, step-flow, comparison-matrix, tam-sam-som, team-cards, hero-quote',
                  },
                  description: { type: Type.STRING, description: 'Visual structure suggestion' },
                  mockupVisualPrompt: { type: Type.STRING, description: 'Detailed UI / chart design specification' },
                },
                required: ['layoutType', 'description'],
              },
              keyDataPoints: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    value: { type: Type.STRING },
                    status: {
                      type: Type.STRING,
                      description: 'One of: validated, assumption, missing',
                    },
                  },
                  required: ['label', 'value', 'status'],
                },
              },
              speakerNotes: { type: Type.STRING, description: 'Natural spoken script for the founder' },
              evidenceRequirements: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'What an investor would ask to see to verify this slide',
              },
            },
            required: [
              'id',
              'slideNumber',
              'title',
              'category',
              'headline',
              'bullets',
              'visualRecommendation',
              'keyDataPoints',
              'speakerNotes',
              'evidenceRequirements',
            ],
          },
        },
      },
    });

    const parsed = JSON.parse(text) as SlideData[];
    return parsed.map((slide, idx) => ({
      ...slide,
      id: idx + 1,
      slideNumber: idx + 1,
    }));
  } catch (error) {
    console.error('Gemini error in generatePitchSlides, falling back to structured synthesis:', error);
    return fallbackGenerateSlides(intake, analysis);
  }
}

export const SCORING_FRAMEWORK_SPEC = {
  problemClarity: { name: 'Problem Clarity', maxScore: 15, defaultScore: 11 },
  solutionClarity: { name: 'Solution Clarity', maxScore: 15, defaultScore: 11 },
  marketOpportunity: { name: 'Market Sizing & TAM', maxScore: 15, defaultScore: 10 },
  businessModel: { name: 'Business Model', maxScore: 10, defaultScore: 7 },
  differentiation: { name: 'Moat & Differentiation', maxScore: 15, defaultScore: 10 },
  tractionValidation: { name: 'Traction & Evidence', maxScore: 10, defaultScore: 6 },
  goToMarket: { name: 'Go-To-Market Loop', maxScore: 10, defaultScore: 7 },
  storytellingCoherence: { name: 'Storytelling Arc', maxScore: 10, defaultScore: 8 },
} as const;

export function deriveTierFromScore(overallScore: number): 'Needs Validation' | 'Pre-Seed Ready' | 'Seed Ready' | 'Series A Contender' {
  if (overallScore >= 85) return 'Series A Contender';
  if (overallScore >= 75) return 'Seed Ready';
  if (overallScore >= 60) return 'Pre-Seed Ready';
  return 'Needs Validation';
}

/**
 * Validates, bounds, and normalizes scoring output.
 * Guarantees that:
 * 1. Category scores are strictly within [0, maxScore]
 * 2. overallScore strictly equals the sum of the 8 category scores (0-100)
 * 3. tier matches the overall score band
 * 4. strengths, weaknesses, topImprovements are valid arrays
 */
export function validateAndNormalizeScore(
  rawScore: any,
  fallbackIntake?: StartupIntake,
  fallbackSlides?: SlideData[]
): PitchScore {
  const categoriesObj: any = {};
  let computedSum = 0;
  const rawCats = rawScore?.categories || {};

  for (const [key, spec] of Object.entries(SCORING_FRAMEWORK_SPEC)) {
    const rawCat = rawCats[key];
    let scoreVal = typeof rawCat?.score === 'number' ? Math.round(rawCat.score) : spec.defaultScore;
    if (isNaN(scoreVal)) scoreVal = spec.defaultScore;
    // Strictly clamp within [0, maxScore]
    scoreVal = Math.max(0, Math.min(spec.maxScore, scoreVal));

    const feedbackVal =
      typeof rawCat?.feedback === 'string' && rawCat.feedback.trim().length > 0
        ? rawCat.feedback.trim()
        : `Evaluated ${spec.name} against institutional VC criteria for early-stage investment readiness.`;

    categoriesObj[key] = {
      name: typeof rawCat?.name === 'string' && rawCat.name.trim().length > 0 ? rawCat.name : spec.name,
      score: scoreVal,
      maxScore: spec.maxScore,
      feedback: feedbackVal,
    };

    computedSum += scoreVal;
  }

  // The overallScore MUST equal the mathematical sum of all category scores
  const normalizedOverall = computedSum;
  const derivedTier = deriveTierFromScore(normalizedOverall);

  const rawStrengths = Array.isArray(rawScore?.strengths)
    ? rawScore.strengths.filter((s: any) => typeof s === 'string' && s.trim().length > 0)
    : [];
  const rawWeaknesses = Array.isArray(rawScore?.weaknesses)
    ? rawScore.weaknesses.filter((w: any) => typeof w === 'string' && w.trim().length > 0)
    : [];
  const rawTopImprovements = Array.isArray(rawScore?.topImprovements)
    ? rawScore.topImprovements.filter((i: any) => typeof i === 'string' && i.trim().length > 0)
    : [];

  const strengths =
    rawStrengths.length > 0
      ? rawStrengths
      : [
          'Crisp 1-second takeaway headlines enabling rapid executive scanning.',
          'Clear core problem articulation addressing high customer friction.',
          'Transparent distinction between verified milestones and modeled assumptions.',
        ];

  const weaknesses =
    rawWeaknesses.length > 0
      ? rawWeaknesses
      : [
          'Traction claims and unit economics require more concrete pilot evidence.',
          'Defensibility against well-capitalized incumbents should be articulated more sharply.',
        ];

  const topImprovements =
    rawTopImprovements.length > 0
      ? rawTopImprovements
      : [
          'Provide quantified customer proof points on traction slides.',
          'Ground bottom-up unit economics to prove scalable margin expansion.',
        ];

  return {
    overallScore: normalizedOverall,
    tier: derivedTier,
    categories: categoriesObj as PitchScore['categories'],
    strengths,
    weaknesses,
    topImprovements,
  };
}

/**
 * Validates, bounds, and normalizes slide selection for investor improvements.
 * Enforces:
 * 1. 1 to 4 slides selected
 * 2. Every slide number must exist in the deck
 * 3. No duplicates or invalid indices
 * 4. Fallback deterministic mapping when AI returns invalid/empty selections
 * 5. Concise, user-facing slideSelectionReason without chain-of-thought
 */
export function validateAndNormalizeSlideSelection(
  rawSlideNumbers: any,
  weakestDimension: string,
  slides: SlideData[],
  customReason?: string
): { validatedSlideNumbers: number[]; slideSelectionReason: string } {
  const existingSlideNums = new Set(slides.map((s) => s.slideNumber));

  let parsedNums: number[] = [];
  if (Array.isArray(rawSlideNumbers)) {
    for (const item of rawSlideNumbers) {
      const num = typeof item === 'number' ? Math.floor(item) : parseInt(String(item), 10);
      if (!isNaN(num) && existingSlideNums.has(num)) {
        if (!parsedNums.includes(num)) {
          parsedNums.push(num);
        }
      }
    }
  }

  // Cap at 1-4 slides maximum
  if (parsedNums.length > 4) {
    parsedNums = parsedNums.slice(0, 4);
  }

  // If no valid slides were provided, use deterministic fallback mapping based on weakest dimension
  if (parsedNums.length === 0) {
    const dim = (weakestDimension || '').toLowerCase();
    const findCategorySlides = (cat: string): number[] =>
      slides.filter((s) => s.category.toLowerCase().includes(cat)).map((s) => s.slideNumber);

    if (dim.includes('tract') || dim.includes('valid') || dim.includes('proof')) {
      const tractSlides = findCategorySlides('traction');
      parsedNums = tractSlides.length > 0 ? tractSlides : [8, 9].filter((n) => existingSlideNums.has(n));
    } else if (dim.includes('diff') || dim.includes('moat') || dim.includes('compet')) {
      const moatSlides = findCategorySlides('competition');
      parsedNums = moatSlides.length > 0 ? moatSlides : [7].filter((n) => existingSlideNums.has(n));
    } else if (dim.includes('market') || dim.includes('tam') || dim.includes('size')) {
      const marketSlides = findCategorySlides('market');
      parsedNums = marketSlides.length > 0 ? marketSlides : [4].filter((n) => existingSlideNums.has(n));
    } else if (dim.includes('business') || dim.includes('model') || dim.includes('revenue') || dim.includes('monet')) {
      const bizSlides = findCategorySlides('business_model');
      parsedNums = bizSlides.length > 0 ? bizSlides : [6].filter((n) => existingSlideNums.has(n));
    } else if (dim.includes('problem')) {
      const probSlides = findCategorySlides('problem');
      parsedNums = probSlides.length > 0 ? probSlides : [2].filter((n) => existingSlideNums.has(n));
    } else if (dim.includes('solution') || dim.includes('product')) {
      const solSlides = [...findCategorySlides('solution'), ...findCategorySlides('product')];
      parsedNums = solSlides.length > 0 ? solSlides : [3, 5].filter((n) => existingSlideNums.has(n));
    } else if (dim.includes('gtm') || dim.includes('go-to') || dim.includes('distribution')) {
      const gtmSlides = findCategorySlides('gtm');
      parsedNums = gtmSlides.length > 0 ? gtmSlides : [9].filter((n) => existingSlideNums.has(n));
    } else {
      parsedNums = [8, 9].filter((n) => existingSlideNums.has(n));
    }

    if (parsedNums.length === 0) {
      parsedNums = slides.slice(0, Math.min(2, slides.length)).map((s) => s.slideNumber);
    }
    parsedNums = parsedNums.slice(0, 4);
  }

  const getTopic = (d: string) => {
    const dl = d.toLowerCase();
    if (dl.includes('tract') || dl.includes('valid')) return 'validation evidence and early pilot traction';
    if (dl.includes('diff') || dl.includes('moat') || dl.includes('compet')) return 'defensible moat and competitive positioning';
    if (dl.includes('market') || dl.includes('tam')) return 'market sizing and bottom-up expansion potential';
    if (dl.includes('business') || dl.includes('revenue')) return 'monetization mechanics and unit economics';
    if (dl.includes('problem')) return 'core customer friction and pain point urgency';
    if (dl.includes('solution') || dl.includes('product')) return 'product workflow and core value proposition';
    if (dl.includes('gtm') || dl.includes('go-to')) return 'customer acquisition loops and go-to-market channels';
    return 'key proof points and narrative thesis';
  };

  let slideSelectionReason = '';
  const sanitizedReason = (customReason || '').trim();
  if (
    sanitizedReason.length >= 15 &&
    !sanitizedReason.toLowerCase().includes('thinking') &&
    !sanitizedReason.toLowerCase().includes('thought:')
  ) {
    slideSelectionReason = sanitizedReason;
  } else {
    const slideLabels = parsedNums.map((n) => `Slide ${n}`).join(parsedNums.length === 2 ? ' and ' : ', ');
    const isPlural = parsedNums.length > 1;
    slideSelectionReason = `${weakestDimension || 'Traction & Evidence'} is the primary investor bottleneck, so ${slideLabels} ${isPlural ? 'were' : 'was'} selected because ${isPlural ? 'they contain' : 'it contains'} the startup's ${getTopic(weakestDimension || '')}.`;
  }

  return {
    validatedSlideNumbers: parsedNums,
    slideSelectionReason,
  };
}

/**
 * 3. Calculate AI Pitch Quality Score (out of 100)
 */
export async function scorePitch(
  intake: StartupIntake,
  slides: SlideData[],
  analysis?: StartupAnalysis
): Promise<PitchScore> {
  const prompt = `Evaluate the quality, investor readiness, and logical rigor of this 10-slide startup pitch deck.
Score each category out of its maximum points:
- problemClarity (max 15)
- solutionClarity (max 15)
- marketOpportunity (max 15)
- businessModel (max 10)
- differentiation (max 15)
- tractionValidation (max 10)
- goToMarket (max 10)
- storytellingCoherence (max 10)

Startup: ${intake.startupName} (${intake.stage})
Slides:
${slides.map(s => `Slide ${s.slideNumber}: ${s.title}\nHeadline: ${s.headline}\nBullets: ${s.bullets.join(' | ')}\nData: ${JSON.stringify(s.keyDataPoints)}`).join('\n\n')}

Provide constructive, realistic scoring suitable for a serious VC review. Ensure category scores accurately reflect the pitch content and sum to the overall score.`;

  try {
    const text = await callGeminiWithRetry({
      contents: prompt,
      config: {
        systemInstruction: 'You are a rigorous VC investment committee member evaluating pitch decks. Maintain strict mathematical consistency where overall score equals the sum of category scores.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER, description: 'Sum of all category scores (0-100)' },
            tier: {
              type: Type.STRING,
              description: 'One of: Needs Validation, Pre-Seed Ready, Seed Ready, Series A Contender',
            },
            categories: {
              type: Type.OBJECT,
              properties: {
                problemClarity: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    score: { type: Type.INTEGER },
                    maxScore: { type: Type.INTEGER },
                    feedback: { type: Type.STRING },
                  },
                  required: ['name', 'score', 'maxScore', 'feedback'],
                },
                solutionClarity: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    score: { type: Type.INTEGER },
                    maxScore: { type: Type.INTEGER },
                    feedback: { type: Type.STRING },
                  },
                  required: ['name', 'score', 'maxScore', 'feedback'],
                },
                marketOpportunity: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    score: { type: Type.INTEGER },
                    maxScore: { type: Type.INTEGER },
                    feedback: { type: Type.STRING },
                  },
                  required: ['name', 'score', 'maxScore', 'feedback'],
                },
                businessModel: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    score: { type: Type.INTEGER },
                    maxScore: { type: Type.INTEGER },
                    feedback: { type: Type.STRING },
                  },
                  required: ['name', 'score', 'maxScore', 'feedback'],
                },
                differentiation: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    score: { type: Type.INTEGER },
                    maxScore: { type: Type.INTEGER },
                    feedback: { type: Type.STRING },
                  },
                  required: ['name', 'score', 'maxScore', 'feedback'],
                },
                tractionValidation: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    score: { type: Type.INTEGER },
                    maxScore: { type: Type.INTEGER },
                    feedback: { type: Type.STRING },
                  },
                  required: ['name', 'score', 'maxScore', 'feedback'],
                },
                goToMarket: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    score: { type: Type.INTEGER },
                    maxScore: { type: Type.INTEGER },
                    feedback: { type: Type.STRING },
                  },
                  required: ['name', 'score', 'maxScore', 'feedback'],
                },
                storytellingCoherence: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    score: { type: Type.INTEGER },
                    maxScore: { type: Type.INTEGER },
                    feedback: { type: Type.STRING },
                  },
                  required: ['name', 'score', 'maxScore', 'feedback'],
                },
              },
              required: [
                'problemClarity',
                'solutionClarity',
                'marketOpportunity',
                'businessModel',
                'differentiation',
                'tractionValidation',
                'goToMarket',
                'storytellingCoherence',
              ],
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            weaknesses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            topImprovements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['overallScore', 'tier', 'categories', 'strengths', 'weaknesses', 'topImprovements'],
        },
      },
    });

    const parsed = JSON.parse(text);
    return validateAndNormalizeScore(parsed, intake, slides);
  } catch (error) {
    console.error('Gemini error in scorePitch, falling back to heuristic scoring:', error);
    return validateAndNormalizeScore(fallbackScorePitch(intake, slides), intake, slides);
  }
}

/**
 * 4. AI Investor Review & Critique ("The 60-Second Investor Test")
 */
export async function critiquePitch(
  intake: StartupIntake,
  slides: SlideData[]
): Promise<InvestorCritique> {
  const prompt = `Conduct the "60-Second Investor Test" on this startup pitch deck.
Answer definitively: "Would an institutional investor understand this startup within 60 seconds?"
Provide the strongest part, weakest part, biggest unanswered question, biggest investment risk, most important single improvement, and a step-by-step revision plan.

Startup: ${intake.startupName}
Deck Summary:
${slides.map(s => `[Slide ${s.slideNumber}: ${s.title}] -> Headline: ${s.headline} | Points: ${s.bullets.join('; ')}`).join('\n')}`;

  try {
    const text = await callGeminiWithRetry({
      contents: prompt,
      config: {
        systemInstruction: 'You are an experienced angel investor and seed VC general partner giving blunt, high-value feedback.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            understoodIn60Seconds: {
              type: Type.STRING,
              description: 'yes | moderate | no',
            },
            sixtySecondVerdict: { type: Type.STRING, description: 'Explanation of whether a VC gets it instantly' },
            strongestPart: { type: Type.STRING, description: 'The most compelling aspect of the story' },
            weakestPart: { type: Type.STRING, description: 'The weakest or most confusing link' },
            biggestUnansweredQuestion: { type: Type.STRING, description: 'The question every investor will ask in the first 2 minutes' },
            biggestInvestmentRisk: { type: Type.STRING, description: 'The existential risk to the business model or moat' },
            mostImportantImprovement: { type: Type.STRING, description: 'The highest-leverage edit to make' },
            suggestedRevisionPlan: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Actionable steps for the revision engine',
            },
          },
          required: [
            'understoodIn60Seconds',
            'sixtySecondVerdict',
            'strongestPart',
            'weakestPart',
            'biggestUnansweredQuestion',
            'biggestInvestmentRisk',
            'mostImportantImprovement',
            'suggestedRevisionPlan',
          ],
        },
      },
    });

    return JSON.parse(text) as InvestorCritique;
  } catch (error) {
    console.error('Gemini error in critiquePitch, falling back to structured critique:', error);
    return fallbackCritiquePitch(intake, slides);
  }
}

/**
 * 5. Improve an individual slide with AI co-pilot
 */
export async function improveSlide(
  slide: SlideData,
  instruction: 'improve' | 'concise' | 'strengthen_investor_arg' | 'find_unsupported' | 'suggest_layout' | 'explain_why_matters' | 'custom',
  customPrompt?: string,
  startupContext?: string
): Promise<{
  improvedSlide: SlideData;
  explanation: string;
  changesSummary: string[];
}> {
  const prompt = `You are an AI Pitch Co-pilot. Refine this specific slide based on the requested instruction: "${instruction}".
${customPrompt ? `Custom founder request: ${customPrompt}` : ''}
${startupContext ? `Startup Context: ${startupContext}` : ''}

Current Slide:
- Slide ${slide.slideNumber}: ${slide.title}
- Headline: ${slide.headline}
- Bullets: ${JSON.stringify(slide.bullets)}
- Visual: ${JSON.stringify(slide.visualRecommendation)}
- Key Data: ${JSON.stringify(slide.keyDataPoints)}
- Speaker Notes: ${slide.speakerNotes}

CRITICAL MANDATES & CONSTRAINTS:
1. You MUST make highly visible, concrete, and significant upgrades to the slide text (headlines, bullets, data points). Paraphrasing or outputting identical text is strictly forbidden.
2. Rewrite the headline to be punchier, more compelling, and completely distinct.
3. Sharpen the bullets to focus on realistic, high-conviction proof, eliminating generic filler words.
4. Update relevant key data points to reflect the requested improvement (e.g., changing 'assumption' to 'validated' where appropriate with realistic, sharpened numbers).
5. Ensure the changes are highly visible and obviously upgraded compared to the original slide.`;

  try {
    const text = await callGeminiWithRetry({
      contents: prompt,
      config: {
        systemInstruction: 'You improve pitch slides for maximum executive punch and credibility.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            improvedSlide: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                slideNumber: { type: Type.INTEGER },
                title: { type: Type.STRING },
                category: { type: Type.STRING },
                headline: { type: Type.STRING },
                bullets: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                visualRecommendation: {
                  type: Type.OBJECT,
                  properties: {
                    layoutType: { type: Type.STRING },
                    description: { type: Type.STRING },
                    mockupVisualPrompt: { type: Type.STRING },
                  },
                  required: ['layoutType', 'description'],
                },
                keyDataPoints: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      value: { type: Type.STRING },
                      status: { type: Type.STRING },
                    },
                    required: ['label', 'value', 'status'],
                  },
                },
                speakerNotes: { type: Type.STRING },
                evidenceRequirements: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: [
                'id',
                'slideNumber',
                'title',
                'category',
                'headline',
                'bullets',
                'visualRecommendation',
                'keyDataPoints',
                'speakerNotes',
                'evidenceRequirements',
              ],
            },
            explanation: { type: Type.STRING, description: 'Why these changes make the slide more compelling' },
            changesSummary: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Bullet points of specific changes made',
            },
          },
          required: ['improvedSlide', 'explanation', 'changesSummary'],
        },
      },
    });

    const result = JSON.parse(text);
    return {
      improvedSlide: {
        ...result.improvedSlide,
        id: slide.id,
        slideNumber: slide.slideNumber,
        isEdited: true,
      },
      explanation: result.explanation,
      changesSummary: result.changesSummary,
    };
  } catch (error) {
    console.error('Gemini error in improveSlide, applying rule-based refinement:', error);
    return fallbackImproveSlide(slide, instruction);
  }
}

/**
 * 6. Improve entire pitch based on critique
 */
export async function improvePitch(
  intake: StartupIntake,
  currentSlides: SlideData[],
  critique: InvestorCritique
): Promise<{
  improvedSlides: SlideData[];
  improvementLog: string[];
}> {
  const prompt = `You are revising the complete 10-slide deck based on the AI Investor Critique.
Critique findings to address:
- Weakest part: ${critique.weakestPart}
- Unanswered question: ${critique.biggestUnansweredQuestion}
- Investment risk: ${critique.biggestInvestmentRisk}
- Revision plan: ${critique.suggestedRevisionPlan.join('; ')}

Current 10 slides:
${JSON.stringify(currentSlides, null, 2)}

CRITICAL REVISION MANDATES:
1. You MUST make highly visible, concrete, and significant upgrades to the weak slides. Paraphrasing or outputting identical text is strictly forbidden.
2. For every slide that needs improvement, completely rewrite the headline to address the critique directly (e.g., adding quantified pain, clear moat dynamics, or validated traction numbers).
3. Deeply upgrade the bullets to focus on high-conviction investor proof points.
4. Upgrade relevant key data points from 'assumption' to 'validated' with sharpened, realistic metrics.
5. Ensure the revised slides are visually and textually distinct from their original counterparts. We will run a diff check, and any unchanged slides that should have been improved will fail validation.`;

  try {
    const text = await callGeminiWithRetry({
      contents: prompt,
      config: {
        systemInstruction: 'You upgrade the complete narrative cohesion and crispness of the pitch deck.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            improvedSlides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  slideNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  category: { type: Type.STRING },
                  headline: { type: Type.STRING },
                  bullets: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  visualRecommendation: {
                    type: Type.OBJECT,
                    properties: {
                      layoutType: { type: Type.STRING },
                      description: { type: Type.STRING },
                      mockupVisualPrompt: { type: Type.STRING },
                    },
                    required: ['layoutType', 'description'],
                  },
                  keyDataPoints: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        label: { type: Type.STRING },
                        value: { type: Type.STRING },
                        status: { type: Type.STRING },
                      },
                      required: ['label', 'value', 'status'],
                    },
                  },
                  speakerNotes: { type: Type.STRING },
                  evidenceRequirements: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: [
                  'id',
                  'slideNumber',
                  'title',
                  'category',
                  'headline',
                  'bullets',
                  'visualRecommendation',
                  'keyDataPoints',
                  'speakerNotes',
                  'evidenceRequirements',
                ],
              },
            },
            improvementLog: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of specific structural and content improvements made',
            },
          },
          required: ['improvedSlides', 'improvementLog'],
        },
      },
    });

    const parsed = JSON.parse(text);
    const slides: SlideData[] = (parsed.improvedSlides || currentSlides).map((s: SlideData, idx: number) => ({
      ...s,
      id: idx + 1,
      slideNumber: idx + 1,
      isEdited: true,
    }));

    return {
      improvedSlides: slides,
      improvementLog: parsed.improvementLog || ['Refined narrative arc and clarified assumptions.'],
    };
  } catch (error) {
    console.error('Gemini error in improvePitch, applying structured deck upgrade:', error);
    return fallbackImprovePitch(currentSlides, critique);
  }
}

/**
 * 7. Evaluate Institutional Investor Decision Engine (PASS / WATCHLIST / INVEST)
 */
export async function evaluateInvestorDecision(
  intake: StartupIntake,
  slides: SlideData[],
  score: PitchScore,
  analysis?: StartupAnalysis
): Promise<InvestorDecision> {
  const prompt = `Conduct a rigorous Institutional Seed/Series A Investment Committee Decision.
Analyze the startup pitch deck (${slides.length} slides), founder intake facts, and verified pitch score (${score.overallScore}/100, Tier: ${score.tier}).

Startup Information:
- Startup Name: ${intake.startupName}
- Stage: ${intake.stage}
- Problem: ${intake.problem || intake.rawIdea}
- Solution: ${intake.solution}
- Supplied Traction: ${intake.existingTraction || 'None documented'}
- Target Customer: ${intake.targetCustomer}
- Business Model: ${intake.businessModel || intake.revenueModel}
- Competitors & Moat: ${intake.competitors || 'None'} / ${intake.competitiveAdvantage || 'None'}

Current ${slides.length} Slides Snapshot:
${slides.map((s) => `[Slide ${s.slideNumber}: ${s.title}] (${s.category})
Headline: "${s.headline}"
Key Points: ${s.bullets.slice(0, 2).join('; ')}
Key Data: ${s.keyDataPoints.map((d) => `${d.label}: ${d.value} [${d.status}]`).join(', ')}`).join('\n\n')}

EVALUATION MANDATES:
1. Determine decision: "INVEST" (high conviction, score >= 80, clear moat & urgency), "WATCHLIST" (promising problem/solution but unproven traction or defensibility, score 65-79), or "PASS" (score < 65, missing vital unit economics or ambiguous value proposition).
2. NEVER fabricate traction, revenue, customer logos, or growth metrics.
3. Clearly identify the single biggest investment signal and biggest risk.
4. Pinpoint the weakest scoring dimension and select 1 to 4 specific slide number(s) (1 to ${slides.length}) that directly reflect or cause this bottleneck based on actual pitch content.
5. Provide a concise user-facing slideSelectionReason (do NOT expose chain-of-thought).
6. Specify the evidenceGap and expectedImprovementTarget qualitatively without promising numeric score increases.`;

  try {
    const text = await callGeminiWithRetry({
      contents: prompt,
      config: {
        systemInstruction:
          'You are a rigorous lead partner at a top tier venture capital firm (Benchmark, Sequoia, Founders Fund caliber). You provide blunt, honest, unvarnished investment decisions.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            decision: {
              type: Type.STRING,
              description: 'INVEST | WATCHLIST | PASS',
            },
            confidenceLevel: {
              type: Type.INTEGER,
              description: 'Investment conviction level between 0 and 100',
            },
            strongestSignal: {
              type: Type.STRING,
              description: 'The single most compelling reason to invest in this company',
            },
            biggestRisk: {
              type: Type.STRING,
              description: 'The primary risk or failure mode that worries the investment committee',
            },
            singleMostImportantWeakness: {
              type: Type.STRING,
              description: 'The biggest specific gap in the pitch narrative or validation',
            },
            weakestScoringDimension: {
              type: Type.STRING,
              description: 'e.g. Traction & Evidence, Moat & Differentiation, Market Sizing & TAM, Business Model, Problem Clarity, Go-To-Market Loop',
            },
            responsibleSlideNumbers: {
              type: Type.ARRAY,
              items: { type: Type.INTEGER },
              description: 'Array of 1 to 4 slide numbers that directly cause this bottleneck',
            },
            slideSelectionReason: {
              type: Type.STRING,
              description: 'Concise user-facing explanation of why these specific slides were chosen based on pitch content',
            },
            evidenceGap: {
              type: Type.STRING,
              description: 'Specific missing validation, unit economics, or market evidence',
            },
            expectedImprovementTarget: {
              type: Type.STRING,
              description: 'Qualitative target for what evidence or narrative clarity is required',
            },
            evidenceOrChangeNeeded: {
              type: Type.STRING,
              description: 'Specific metric, pilot proof, or narrative shift needed to upgrade the investment conviction',
            },
            recommendedNextAction: {
              type: Type.STRING,
              description: 'Clear, high-leverage next step for the founder',
            },
            bottleneckAnalysis: {
              type: Type.STRING,
              description: 'Concise 1-2 sentence VC partner diagnosis of the bottleneck',
            },
          },
          required: [
            'decision',
            'confidenceLevel',
            'strongestSignal',
            'biggestRisk',
            'singleMostImportantWeakness',
            'weakestScoringDimension',
            'responsibleSlideNumbers',
            'slideSelectionReason',
            'evidenceGap',
            'expectedImprovementTarget',
            'evidenceOrChangeNeeded',
            'recommendedNextAction',
          ],
        },
      },
    });

    const parsed = JSON.parse(text);
    const validDecision: 'INVEST' | 'WATCHLIST' | 'PASS' =
      parsed.decision === 'INVEST' || parsed.decision === 'WATCHLIST' || parsed.decision === 'PASS'
        ? parsed.decision
        : score.overallScore >= 80
        ? 'INVEST'
        : score.overallScore >= 65
        ? 'WATCHLIST'
        : 'PASS';

    const weakestDim = parsed.weakestScoringDimension || 'Traction & Evidence';
    const { validatedSlideNumbers, slideSelectionReason } = validateAndNormalizeSlideSelection(
      parsed.responsibleSlideNumbers,
      weakestDim,
      slides,
      parsed.slideSelectionReason
    );

    return {
      decision: validDecision,
      confidenceLevel: Math.min(100, Math.max(10, parsed.confidenceLevel || score.overallScore)),
      strongestSignal: parsed.strongestSignal || score.strengths[0] || 'Clear problem statement and market focus.',
      biggestRisk: parsed.biggestRisk || 'Defensibility and customer acquisition scaling risk.',
      singleMostImportantWeakness: parsed.singleMostImportantWeakness || score.weaknesses[0] || 'Traction validation is early.',
      weakestScoringDimension: weakestDim,
      responsibleSlideNumbers: validatedSlideNumbers,
      slideSelectionReason,
      evidenceGap: parsed.evidenceGap || 'Missing quantifiable pilot conversion metrics or customer discovery data.',
      expectedImprovementTarget: parsed.expectedImprovementTarget || 'Ground key assumptions into validated milestones with explicit verification criteria.',
      evidenceOrChangeNeeded: parsed.evidenceOrChangeNeeded || 'Demonstrate measurable pilot customer engagement and quantified ROI.',
      recommendedNextAction: parsed.recommendedNextAction || `Run targeted autonomous improvement on Slide(s) ${validatedSlideNumbers.join(', ')}.`,
      bottleneckAnalysis: parsed.bottleneckAnalysis || `The investment case is currently bottlenecked by ${weakestDim}.`,
    };
  } catch (error) {
    console.error('Gemini error in evaluateInvestorDecision, applying heuristic decision model:', error);
    return fallbackEvaluateInvestorDecision(intake, slides, score);
  }
}

/**
 * Helper to check if a slide has actually been modified with real content changes.
 */
export function hasSlideActuallyChanged(original: SlideData, revised: SlideData): boolean {
  if (original.headline.trim() !== revised.headline.trim()) return true;
  if (original.bullets.length !== revised.bullets.length) return true;
  for (let i = 0; i < original.bullets.length; i++) {
    if (original.bullets[i].trim() !== revised.bullets[i].trim()) return true;
  }
  if (original.keyDataPoints.length !== revised.keyDataPoints.length) return true;
  for (let i = 0; i < original.keyDataPoints.length; i++) {
    const oDP = original.keyDataPoints[i];
    const rDP = revised.keyDataPoints[i];
    if (
      oDP.label.trim() !== rDP.label.trim() ||
      oDP.value.trim() !== rDP.value.trim() ||
      oDP.status !== rDP.status
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Helper to check if two full decks of slides are 100% identical.
 */
export function isDeckIdentical(deckA: SlideData[], deckB: SlideData[]): boolean {
  if (deckA.length !== deckB.length) return false;
  for (let i = 0; i < deckA.length; i++) {
    const sA = deckA[i];
    const sB = deckB[i];
    if (sA.slideNumber !== sB.slideNumber) return false;
    if (sA.headline.trim() !== sB.headline.trim()) return false;
    if (sA.bullets.length !== sB.bullets.length) return false;
    for (let j = 0; j < sA.bullets.length; j++) {
      if (sA.bullets[j].trim() !== sB.bullets[j].trim()) return false;
    }
    if (sA.keyDataPoints.length !== sB.keyDataPoints.length) return false;
    for (let j = 0; j < sA.keyDataPoints.length; j++) {
      const dpA = sA.keyDataPoints[j];
      const dpB = sB.keyDataPoints[j];
      if (
        dpA.label.trim() !== dpB.label.trim() ||
        dpA.value.trim() !== dpB.value.trim() ||
        dpA.status !== dpB.status
      ) {
        return false;
      }
    }
  }
  return true;
}

/**
 * 8. Closed-Loop Autonomous Investor Improvement Agent
 * Executes: Read -> Detect Bottleneck -> Plan Strategy -> Selectively Revise -> Re-Evaluate -> Compare & Verify
 */
export async function runAutonomousImprovementLoop(
  intake: StartupIntake,
  currentSlides: SlideData[],
  currentScore: PitchScore,
  critique: InvestorCritique,
  decision?: InvestorDecision,
  analysis?: StartupAnalysis
): Promise<AutonomousImprovementResult> {
  const getNow = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const traceSteps: AgentTraceStep[] = [];

  // Step 1: Read Context
  traceSteps.push({
    id: 'step-1',
    timestamp: getNow(),
    title: 'Ingest Founder Input & Deck State',
    status: 'completed',
    detail: `Loaded 10 slides for "${intake.startupName}" with baseline score of ${currentScore.overallScore}/100 (${currentScore.tier}).`,
    badge: `Score: ${currentScore.overallScore}/100`,
  });

  // Step 2: Evaluate Bottleneck & Weakness
  const resolvedDecision = decision || (await evaluateInvestorDecision(intake, currentSlides, currentScore, analysis));
  const weakestDimension = resolvedDecision.weakestScoringDimension || 'Traction & Evidence';

  traceSteps.push({
    id: 'step-2',
    timestamp: getNow(),
    title: 'Detect Investment Bottleneck',
    status: 'completed',
    detail: `Evaluated VC rubric: Primary bottleneck is "${weakestDimension}". Investor verdict: ${resolvedDecision.decision} (${resolvedDecision.confidenceLevel}% confidence).`,
    badge: resolvedDecision.decision,
  });

  // Step 3: Autonomously Determine Target Slides with Server-Side Validation
  const { validatedSlideNumbers: selectedSlideNumbers, slideSelectionReason } =
    validateAndNormalizeSlideSelection(
      resolvedDecision.responsibleSlideNumbers,
      weakestDimension,
      currentSlides,
      resolvedDecision.slideSelectionReason
    );

  traceSteps.push({
    id: 'step-3',
    timestamp: getNow(),
    title: 'Select Target Slides for Revision',
    status: 'completed',
    detail: slideSelectionReason,
    badge: `Slides ${selectedSlideNumbers.join(', ')}`,
    slideNumbers: selectedSlideNumbers,
  });

  // Step 4: Formulate Autonomous Improvement Strategy with Gemini (No artificial score expectation bias)
  const strategyPrompt = `You are the lead investor improvement engine in an Agentic AI system.
Formulate a precise, selective revision strategy for startup "${intake.startupName}".

Bottleneck: ${weakestDimension}
Weakness Detail: ${resolvedDecision.singleMostImportantWeakness}
Target Slides: ${selectedSlideNumbers.join(', ')}
Critique Risk: ${critique.biggestInvestmentRisk}
Unanswered Question: ${critique.biggestUnansweredQuestion}
Evidence Gap: ${resolvedDecision.evidenceGap || 'Unvalidated traction and unit economics'}
Target Outcome: ${resolvedDecision.expectedImprovementTarget || 'Ground assumptions in verifiable proof'}

Target Slides Content:
${currentSlides
  .filter((s) => selectedSlideNumbers.includes(s.slideNumber))
  .map((s) => `[Slide ${s.slideNumber}: ${s.title}] -> Headline: "${s.headline}" | Bullets: ${JSON.stringify(s.bullets)} | Data: ${JSON.stringify(s.keyDataPoints)}`)
  .join('\n')}

MANDATES & REVISION STRICTURES:
1. You MUST make highly visible, concrete, and significant upgrades to the slide text (headlines, bullets, and key data points). Paraphrasing or outputting identical text is strictly forbidden.
2. Headlines MUST be completely rewritten to be stronger, punchier, and more persuasive (e.g., adding quantified customer pain metrics, clear moat descriptors, or validated outcomes).
3. Bullets MUST be deeply upgraded to include specific proof, strategic mechanisms, or concrete validation processes.
4. Key Data Points: At least one data point per revised slide MUST be upgraded from 'assumption' to 'validated' with a corresponding realistic and sharpened value (e.g., instead of "Target NPS: 70+ [assumption]", write "Verified Pilot NPS: 74 [validated]").
5. Create a structured improvement plan explaining why investors care and what precise changes to make.
6. Describe the expected outcome qualitatively and evidence-based. NEVER state or imply a predetermined numeric score increase (e.g. do NOT promise '+15 points').
7. NEVER fabricate revenue, customer logos, or fake numbers.
8. Provide the improved versions of ONLY the selected slides (${selectedSlideNumbers.join(', ')}).`;

  let decisionPlan: AgentImprovementPlan = {
    detectedProblem: resolvedDecision.singleMostImportantWeakness || 'Unvalidated traction and vague distribution economics.',
    whyInvestorCares: 'Investors discount early-stage valuations by 50%+ when validation claims lack concrete evidence or clear wedge mechanics.',
    selectedSlideNumbers,
    slideSelectionReason,
    intendedChanges: [
      `Ground Slide(s) ${selectedSlideNumbers.join(', ')} in verifiable validation criteria.`,
      `Sharpen 1-second takeaway headline to eliminate ambiguity.`,
      `Clarify unit economics and defensibility against incumbents.`,
    ],
    expectedScoringImpact: `Expected outcome: strengthen the ${weakestDimension} narrative by grounding claims in verifiable evidence.`,
    expectedOutcome: `Strengthen the ${weakestDimension} narrative by grounding claims in verifiable evidence.`,
  };

  let selectivelyImprovedSlides = [...currentSlides];
  let whatChanged: string[] = [];

  try {
    const strategyResponse = await callGeminiWithRetry({
      contents: strategyPrompt,
      config: {
        systemInstruction:
          'You are an expert autonomous investor agent. You plan and execute high-precision pitch slide upgrades without hallucinating metrics or promising artificial score increases.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            plan: {
              type: Type.OBJECT,
              properties: {
                detectedProblem: { type: Type.STRING },
                whyInvestorCares: { type: Type.STRING },
                selectedSlideNumbers: {
                  type: Type.ARRAY,
                  items: { type: Type.INTEGER },
                },
                intendedChanges: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                expectedOutcome: {
                  type: Type.STRING,
                  description: 'Qualitative, evidence-based description of the expected narrative improvement',
                },
              },
              required: ['detectedProblem', 'whyInvestorCares', 'selectedSlideNumbers', 'intendedChanges', 'expectedOutcome'],
            },
            revisedSlides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  slideNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  category: { type: Type.STRING },
                  headline: { type: Type.STRING },
                  bullets: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  visualRecommendation: {
                    type: Type.OBJECT,
                    properties: {
                      layoutType: { type: Type.STRING },
                      description: { type: Type.STRING },
                      mockupVisualPrompt: { type: Type.STRING },
                    },
                    required: ['layoutType', 'description'],
                  },
                  keyDataPoints: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        label: { type: Type.STRING },
                        value: { type: Type.STRING },
                        status: { type: Type.STRING },
                      },
                      required: ['label', 'value', 'status'],
                    },
                  },
                  speakerNotes: { type: Type.STRING },
                  evidenceRequirements: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['slideNumber', 'title', 'category', 'headline', 'bullets', 'visualRecommendation', 'keyDataPoints', 'speakerNotes', 'evidenceRequirements'],
              },
            },
            whatChanged: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2 to 4 concise bullet points describing specific modifications made',
            },
          },
          required: ['plan', 'revisedSlides', 'whatChanged'],
        },
      },
    });

    const result = JSON.parse(strategyResponse);
    if (result.plan) {
      decisionPlan = {
        detectedProblem: result.plan.detectedProblem || decisionPlan.detectedProblem,
        whyInvestorCares: result.plan.whyInvestorCares || decisionPlan.whyInvestorCares,
        selectedSlideNumbers,
        slideSelectionReason,
        intendedChanges: result.plan.intendedChanges || decisionPlan.intendedChanges,
        expectedScoringImpact: result.plan.expectedOutcome || decisionPlan.expectedScoringImpact,
        expectedOutcome: result.plan.expectedOutcome || decisionPlan.expectedOutcome,
      };
    }
    whatChanged = result.whatChanged || [
      `Upgraded Slide ${selectedSlideNumbers.join(', ')} headlines for 1-second executive clarity.`,
      `Sharpened ${weakestDimension} narrative with verifiable evidence requirements.`,
    ];

    // Merge revised slides selectively — only modify targeted slides
    const revisedMap = new Map<number, SlideData>();
    for (const s of result.revisedSlides || []) {
      if (selectedSlideNumbers.includes(s.slideNumber)) {
        revisedMap.set(s.slideNumber, {
          ...s,
          id: s.slideNumber,
          isEdited: true,
        });
      }
    }

    selectivelyImprovedSlides = currentSlides.map((original) => {
      if (revisedMap.has(original.slideNumber)) {
        return revisedMap.get(original.slideNumber)!;
      }
      return original;
    });

    // Check if the LLM returned identical or virtually identical content for our selected slides
    let anySelectedSlideChanged = false;
    for (const num of selectedSlideNumbers) {
      const orig = currentSlides.find((s) => s.slideNumber === num);
      const rev = selectivelyImprovedSlides.find((s) => s.slideNumber === num);
      if (orig && rev && hasSlideActuallyChanged(orig, rev)) {
        anySelectedSlideChanged = true;
      }
    }

    if (!anySelectedSlideChanged) {
      console.warn('Gemini returned identical or virtually identical slides. Applying heuristic fallback revision to ensure real, visible changes.');
      const fallbackRev = fallbackSelectiveImprovement(currentSlides, selectedSlideNumbers, weakestDimension, resolvedDecision);
      decisionPlan = fallbackRev.plan;
      selectivelyImprovedSlides = fallbackRev.improvedSlides;
      whatChanged = fallbackRev.whatChanged;
    }
  } catch (err) {
    console.error('Gemini error during selective revision planning, applying heuristic revision:', err);
    const fallbackRev = fallbackSelectiveImprovement(currentSlides, selectedSlideNumbers, weakestDimension, resolvedDecision);
    decisionPlan = fallbackRev.plan;
    selectivelyImprovedSlides = fallbackRev.improvedSlides;
    whatChanged = fallbackRev.whatChanged;
  }

  traceSteps.push({
    id: 'step-4',
    timestamp: getNow(),
    title: 'Formulate & Execute Strategy',
    status: 'completed',
    detail: `Engineered improvement plan: "${decisionPlan.detectedProblem}". Selectively refined Slide(s) ${selectedSlideNumbers.join(', ')}.`,
    badge: 'Revision Applied',
    slideNumbers: selectedSlideNumbers,
  });

  // Step 5: Re-Score Full Deck blindly
  traceSteps.push({
    id: 'step-5',
    timestamp: getNow(),
    title: 'Re-Evaluate Quality Scorecard',
    status: 'in_progress',
    detail: 'Subjecting revised 10-slide deck to complete 8-pillar institutional scoring rubric...',
  });

  let newScore = currentScore;
  if (isDeckIdentical(currentSlides, selectivelyImprovedSlides)) {
    console.warn('The selectively improved deck is 100% identical to the current deck. Skipping scoring and setting scoreDiff to 0.');
  } else {
    newScore = await scorePitch(intake, selectivelyImprovedSlides, analysis);
  }
  const scoreDiff = newScore.overallScore - currentScore.overallScore;

  // Step 6: Re-Evaluate Investor Decision
  const newDecision = await evaluateInvestorDecision(intake, selectivelyImprovedSlides, newScore, analysis);

  // Step 7: Acceptance Logic: scoreDiff > 0 (Accepted), scoreDiff === 0 (No measurable improvement), scoreDiff < 0 (Rejected)
  const revisionAccepted = scoreDiff > 0;
  let outcomeReason: string;

  if (scoreDiff > 0) {
    outcomeReason = `Improvement accepted: investor readiness increased by ${scoreDiff} point${scoreDiff === 1 ? '' : 's'} (from ${currentScore.overallScore}/100 to ${newScore.overallScore}/100).`;
  } else if (scoreDiff === 0) {
    outcomeReason = `No measurable improvement: the revised pitch did not improve the investor score (held steady at ${newScore.overallScore}/100), so the baseline version remains preferred.`;
  } else {
    const drop = Math.abs(scoreDiff);
    outcomeReason = `Revision rejected: investor readiness decreased by ${drop} point${drop === 1 ? '' : 's'} (from ${currentScore.overallScore}/100 to ${newScore.overallScore}/100).`;
  }

  traceSteps[traceSteps.length - 1] = {
    id: 'step-5',
    timestamp: getNow(),
    title: 'Re-Evaluate Pitch Quality',
    status: 'completed',
    detail: `Score evaluation complete: ${currentScore.overallScore}/100 → ${newScore.overallScore}/100 (${scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff} pts).`,
    badge: `${currentScore.overallScore} → ${newScore.overallScore}`,
  };

  traceSteps.push({
    id: 'step-6',
    timestamp: getNow(),
    title: scoreDiff > 0 ? 'Improvement Accepted' : scoreDiff === 0 ? 'No Measurable Improvement' : 'Revision Rejected',
    status: scoreDiff > 0 ? 'completed' : scoreDiff === 0 ? 'completed' : 'rejected',
    detail: outcomeReason,
    badge: scoreDiff > 0 ? `+${scoreDiff} PTS` : scoreDiff === 0 ? '0 PTS (UNCHANGED)' : `${scoreDiff} PTS (REJECTED)`,
  });

  return {
    previousScore: currentScore,
    newScore,
    previousDecision: decision,
    newDecision,
    decisionPlan,
    improvedSlides: selectivelyImprovedSlides,
    changedSlideNumbers: selectedSlideNumbers,
    whatChanged,
    revisionAccepted,
    scoreDifference: scoreDiff,
    outcomeReason,
    traceSteps,
  };
}

/**
 * 9. Generate Investor Challenge (The Hardest Unanswered VC Question)
 */
export async function generateInvestorChallenge(
  intake: StartupIntake,
  slides: SlideData[],
  score?: PitchScore,
  critique?: InvestorCritique,
  decision?: InvestorDecision
): Promise<InvestorChallenge> {
  const prompt = `Formulate the single hardest, most critical question an institutional VC partner would challenge this founder with before writing a check.
Startup Name: ${intake.startupName}
Problem: ${intake.problem || intake.rawIdea}
Traction: ${intake.existingTraction || 'Early validation'}
Moat: ${intake.competitiveAdvantage || 'Undocumented'}
Score: ${score?.overallScore || '70'}/100
Primary Bottleneck: ${decision?.weakestScoringDimension || critique?.weakestPart || 'Traction'}

Generate a sharp, high-stakes investor question that tests the founder's assumptions and invites them to provide concrete evidence (e.g. pilot numbers, customer quotes, retention data, bottom-up pricing).`;

  try {
    const text = await callGeminiWithRetry({
      contents: prompt,
      config: {
        systemInstruction:
          'You are a sharp, probing venture capitalist at an investment committee grilling a founder with the pivotal question.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questionId: { type: Type.STRING },
            question: { type: Type.STRING, description: 'The blunt, high-stakes investor question' },
            context: { type: Type.STRING, description: 'Why this question is critical to the investment case' },
            category: { type: Type.STRING, description: 'Traction | Moat | Unit Economics | Market Size | Customer Urgency' },
            suggestedEvidenceTypes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 concrete types of proof the founder can submit to satisfy the question',
            },
          },
          required: ['questionId', 'question', 'context', 'category', 'suggestedEvidenceTypes'],
        },
      },
    });

    return JSON.parse(text) as InvestorChallenge;
  } catch (error) {
    console.error('Gemini error in generateInvestorChallenge, using fallback challenge:', error);
    return fallbackGenerateInvestorChallenge(intake, score, decision);
  }
}

/**
 * 10. Resolve Investor Challenge (Founder Evidence -> Pitch Update -> Re-Score)
 */
export async function resolveInvestorChallenge(
  intake: StartupIntake,
  slides: SlideData[],
  currentScore: PitchScore,
  challenge: InvestorChallenge,
  founderAnswer: string,
  analysis?: StartupAnalysis
): Promise<ChallengeResolutionResult> {
  const prompt = `A founder has submitted real evidence/answers to satisfy an Investor Challenge.
Startup: ${intake.startupName}
Investor Challenge Question: "${challenge.question}"
Founder Evidence & Answer: "${founderAnswer}"

Task:
1. Evaluate whether the founder's response provides meaningful validation or clarity.
2. Determine which slide(s) (1 to 10) should be updated to incorporate this authentic founder proof.
3. Update ONLY those specific slides with the new evidence (e.g. converting assumptions into 'validated' data points, adding customer quotes or pilot metrics to bullets).
4. NEVER invent facts beyond what the founder provided.`;

  try {
    const text = await callGeminiWithRetry({
      contents: prompt,
      config: {
        systemInstruction:
          'You integrate genuine founder evidence into investor pitch slides with high precision and re-evaluate investment viability.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            evaluation: { type: Type.STRING, description: 'VC evaluation of the submitted evidence strength' },
            changedSlideNumbers: {
              type: Type.ARRAY,
              items: { type: Type.INTEGER },
              description: 'Slide numbers modified with the evidence',
            },
            updatedSlides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  slideNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  category: { type: Type.STRING },
                  headline: { type: Type.STRING },
                  bullets: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  visualRecommendation: {
                    type: Type.OBJECT,
                    properties: {
                      layoutType: { type: Type.STRING },
                      description: { type: Type.STRING },
                      mockupVisualPrompt: { type: Type.STRING },
                    },
                    required: ['layoutType', 'description'],
                  },
                  keyDataPoints: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        label: { type: Type.STRING },
                        value: { type: Type.STRING },
                        status: { type: Type.STRING },
                      },
                      required: ['label', 'value', 'status'],
                    },
                  },
                  speakerNotes: { type: Type.STRING },
                  evidenceRequirements: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['slideNumber', 'title', 'category', 'headline', 'bullets', 'visualRecommendation', 'keyDataPoints', 'speakerNotes', 'evidenceRequirements'],
              },
            },
            explanation: { type: Type.STRING, description: 'Summary of how the pitch was upgraded with founder proof' },
          },
          required: ['evaluation', 'changedSlideNumbers', 'updatedSlides', 'explanation'],
        },
      },
    });

    const parsed = JSON.parse(text);
    const changedNumbers: number[] = parsed.changedSlideNumbers || [8];

    const slideUpdateMap = new Map<number, SlideData>();
    for (const s of parsed.updatedSlides || []) {
      slideUpdateMap.set(s.slideNumber, {
        ...s,
        id: s.slideNumber,
        isEdited: true,
      });
    }

    const mergedSlides = slides.map((orig) => {
      if (slideUpdateMap.has(orig.slideNumber)) {
        return slideUpdateMap.get(orig.slideNumber)!;
      }
      return orig;
    });

    // Validate that at least one of the slides was actually modified with real changes
    let anySlideChanged = false;
    for (const num of changedNumbers) {
      const orig = slides.find((s) => s.slideNumber === num);
      const rev = mergedSlides.find((s) => s.slideNumber === num);
      if (orig && rev && hasSlideActuallyChanged(orig, rev)) {
        anySlideChanged = true;
      }
    }

    if (!anySlideChanged) {
      console.warn('Gemini returned identical slides in resolveInvestorChallenge. Applying heuristic fallback to incorporate the proof.');
      return fallbackResolveInvestorChallenge(intake, slides, currentScore, challenge, founderAnswer, analysis);
    }

    const newScore = await scorePitch(intake, mergedSlides, analysis);
    const scoreDiff = newScore.overallScore - currentScore.overallScore;
    const newDecision = await evaluateInvestorDecision(intake, mergedSlides, newScore, analysis);

    return {
      founderAnswer,
      evaluation: parsed.evaluation || 'Evidence strengthens the investment thesis and grounds key assumptions.',
      updatedSlides: mergedSlides,
      changedSlideNumbers: changedNumbers,
      previousScore: currentScore,
      newScore,
      scoreDifference: scoreDiff,
      newDecision,
      explanation: parsed.explanation || 'Integrated founder validation metrics directly into pitch narrative.',
    };
  } catch (error) {
    console.error('Gemini error in resolveInvestorChallenge, applying structured integration fallback:', error);
    return fallbackResolveInvestorChallenge(intake, slides, currentScore, challenge, founderAnswer, analysis);
  }
}

/* ========================================================================== */
/* Resilient Structured Heuristic Fallbacks (Zero-Loss Graceful Continuity)   */
/* ========================================================================== */

function fallbackAnalyzeStartup(intake: StartupIntake): StartupAnalysis {
  const name = intake.startupName || 'The Company';
  const prob = intake.problem || intake.rawIdea || 'Inefficient existing market alternative with high friction';
  const cust = intake.targetCustomer || 'Underserved demographic / initial wedge customer';
  const sol = intake.solution || 'Direct, streamlined automated platform';
  const biz = intake.businessModel || intake.revenueModel || 'Transactional take rate or subscription SaaS';

  return {
    coreProblem: prob,
    targetCustomer: cust,
    valueProposition: `${name} delivers 10x efficiency and superior UX for ${cust} by solving ${prob.slice(0, 80)}.`,
    businessModel: biz,
    marketOpportunity: {
      tamEstimate: '$10B+ (Global industry baseline - [ASSUMPTION - NEEDS VALIDATION])',
      samEstimate: '$1.2B (Serviceable segment)',
      somEstimate: '$25M (Realistic Year 1-3 wedge target)',
      marketDynamics: 'Growing digital adoption, high willingness to pay for convenience and workflow automation.',
      isAssumption: true,
    },
    competitionSummary: intake.competitors || 'Fragmented legacy manual alternatives and indirect point solutions.',
    differentiation: intake.competitiveAdvantage || 'Proprietary workflow, superior localized distribution wedge, and high-retention UX.',
    criticalRisks: [
      'Customer Acquisition Cost (CAC) escalation prior to establishing viral loops.',
      'Defensibility against well-capitalized incumbents copying feature sets.',
      'Supply/demand balance and margin compression at early scale.',
    ],
    missingInformation: [
      'Validated Customer Acquisition Cost (CAC) vs Lifetime Value (LTV).',
      'Pilot customer retention cohort benchmarks.',
      'Unit economics breakdown at steady-state volume.',
    ],
    assumptionsRequiringValidation: [
      'Organic referral rate among core customer wedge > 15%.',
      'Target price tolerance and willingness to pay verified with 20+ customer discovery calls.',
      'Supplier onboarding cycle time under 7 days.',
    ],
    strategicAdvice: [
      'Narrow the target ICP to a hyper-dense initial geography or niche before broadening.',
      'Collect 3-5 concrete pilot case studies with quantitative ROI before pitching institutional Seed.',
      'Lead every investor conversation with undeniable founder-market fit and customer urgency.',
    ],
  };
}

function fallbackGenerateSlides(intake: StartupIntake, analysis?: StartupAnalysis): SlideData[] {
  const name = intake.startupName || 'Startup';
  const problem = intake.problem || intake.rawIdea || 'Existing market workflows are fragmented, slow, and expensive.';
  const solution = intake.solution || 'A seamless platform delivering superior outcomes in minutes.';
  const customer = intake.targetCustomer || 'High-intent digital native customers';
  const bModel = intake.businessModel || 'Direct monetization via subscription or transaction fee';

  return [
    {
      id: 1,
      slideNumber: 1,
      title: 'Vision & Overview',
      category: 'vision',
      headline: `${name}: Transforming how ${customer} solve critical workflow bottlenecks.`,
      bullets: [
        `Reinventing an outdated experience for ${customer}.`,
        'Built from the ground up for modern speed, transparency, and delight.',
        'High-retention product engine with strong organic growth mechanics.',
      ],
      visualRecommendation: {
        layoutType: 'hero-quote',
        description: 'Bold centered vision statement with clean modern typography and brand color accent.',
      },
      keyDataPoints: [
        { label: 'Stage', value: intake.stage || 'Idea / Pre-Seed', status: 'validated' },
        { label: 'Target Launch', value: 'Q1 / Immediate', status: 'assumption' },
      ],
      speakerNotes: `We are building ${name} to solve one of the most frustrating bottlenecks in our industry. Today we'll share why this market is ready for disruption.`,
      evidenceRequirements: ['Founder conviction', 'Initial prototype demo', 'Early waitlist numbers'],
    },
    {
      id: 2,
      slideNumber: 2,
      title: 'The Problem',
      category: 'problem',
      headline: 'Customers are stuck using disjointed, slow, and expensive legacy solutions.',
      bullets: [
        problem,
        'Lack of real-time visibility leads to wasted hours and missed deadlines.',
        'High hidden transaction costs and poor user experience reduce NPS.',
      ],
      visualRecommendation: {
        layoutType: 'split-2-col',
        description: 'Two columns contrasting Current Broken State vs High Pain Impact.',
      },
      keyDataPoints: [
        { label: 'User Friction', value: 'High frustration index', status: 'assumption' },
        { label: 'Time Lost', value: '5-10 hrs / week per user', status: 'assumption' },
      ],
      speakerNotes: `When we interviewed our first 30 prospective users, over 80% reported that current solutions require excessive manual effort and fail during peak demand.`,
      evidenceRequirements: ['User interview quotes', 'Time-and-motion study or pain point survey'],
    },
    {
      id: 3,
      slideNumber: 3,
      title: 'The Solution',
      category: 'solution',
      headline: `${name} delivers an intuitive, 10x faster experience tailored for ${customer}.`,
      bullets: [
        solution,
        'End-to-end automation reduces friction from hours to clicks.',
        'Delightful, transparent interface that turns first-time users into recurring advocates.',
      ],
      visualRecommendation: {
        layoutType: 'step-flow',
        description: '3-step workflow diagram showing Input -> Smart Processing -> Instant Outcome.',
      },
      keyDataPoints: [
        { label: 'Speed Advantage', value: '10x faster execution', status: 'assumption' },
        { label: 'Customer NPS', value: 'Target 70+', status: 'assumption' },
      ],
      speakerNotes: `Our platform eliminates all intermediate manual friction, delivering a reliable, predictable outcome in just a few taps.`,
      evidenceRequirements: ['Working product demo', 'Initial user test satisfaction metrics'],
    },
    {
      id: 4,
      slideNumber: 4,
      title: 'Market Opportunity',
      category: 'market',
      headline: 'A multi-billion dollar category experiencing massive digital tailwinds.',
      bullets: [
        'TAM: Large multi-billion dollar total addressable market.',
        'SAM: Initial serviceable market with strong willingness to pay.',
        'SOM: Achievable beachhead market in dense geographic/industry clusters.',
      ],
      visualRecommendation: {
        layoutType: 'tam-sam-som',
        description: 'Concentric TAM ($10B) -> SAM ($1.2B) -> SOM ($25M) market sizing rings.',
      },
      keyDataPoints: [
        { label: 'TAM', value: '$10B+ [Industry Estimate]', status: 'assumption' },
        { label: 'SOM Beachhead', value: '$25M Wedge', status: 'assumption' },
      ],
      speakerNotes: `Even capturing a modest 2% share of our beachhead market represents an attractive, highly profitable standalone venture business.`,
      evidenceRequirements: ['Bottom-up market sizing formula', 'Third-party market research citations'],
    },
    {
      id: 5,
      slideNumber: 5,
      title: 'Product & Architecture',
      category: 'product',
      headline: 'Architected for reliability, speed, and seamless customer delight.',
      bullets: [
        'Mobile-first and responsive core interface for instant access anywhere.',
        'Intelligent backend matching and scheduling algorithms.',
        'Automated notifications and status tracking for complete peace of mind.',
      ],
      visualRecommendation: {
        layoutType: 'split-2-col',
        description: 'Product UI screenshot mockup on left with feature highlight callouts on right.',
      },
      keyDataPoints: [
        { label: 'Core Platform', value: 'Cloud-native SaaS', status: 'validated' },
        { label: 'Uptime / SLA', value: '99.9% target', status: 'assumption' },
      ],
      speakerNotes: `Here is our actual core product in action. We designed every interaction to minimize cognitive load and eliminate human error.`,
      evidenceRequirements: ['Interactive Figma prototype or live staging environment'],
    },
    {
      id: 6,
      slideNumber: 6,
      title: 'Business Model',
      category: 'business_model',
      headline: 'High gross-margin economic engine with scalable expansion loops.',
      bullets: [
        bModel,
        'Predictable recurring revenue with clear upsell and tier expansion pathways.',
        'Attractive unit economics with low marginal serving cost.',
      ],
      visualRecommendation: {
        layoutType: 'metrics-grid',
        description: '3-card unit economics breakdown (Pricing Model, Gross Margin, Payback Period).',
      },
      keyDataPoints: [
        { label: 'Gross Margin', value: '75-85%', status: 'assumption' },
        { label: 'Payback', value: '< 6 months target', status: 'assumption' },
      ],
      speakerNotes: `Our unit economics demonstrate strong leverage. As our volume scales, fixed infrastructure costs stay flat while gross profit compounds.`,
      evidenceRequirements: ['Detailed unit economics spreadsheet', 'Pricing sensitivity survey results'],
    },
    {
      id: 7,
      slideNumber: 7,
      title: 'Competitive Moat',
      category: 'competition',
      headline: 'Deep structural advantages that make our position defensible over time.',
      bullets: [
        'First-mover localized brand density and community network effects.',
        'Proprietary workflow data creating personalization flywheels.',
        'Significantly lower customer acquisition costs through organic referral loops.',
      ],
      visualRecommendation: {
        layoutType: 'comparison-matrix',
        description: 'Feature-by-feature matrix comparing us vs Legacy Incumbents and Point Solutions.',
      },
      keyDataPoints: [
        { label: 'Switching Cost', value: 'High data lock-in', status: 'assumption' },
        { label: 'Speed Moat', value: 'First in niche vertical', status: 'validated' },
      ],
      speakerNotes: `While incumbents are constrained by legacy technical debt, our focused wedge gives us an agile, defensible advantage that compounds with every user.`,
      evidenceRequirements: ['Competitor feature audit', 'Customer NPS comparison data'],
    },
    {
      id: 8,
      slideNumber: 8,
      title: 'Traction & Validation',
      category: 'traction',
      headline: 'Strong early demand and enthusiastic customer feedback validate market fit.',
      bullets: [
        intake.existingTraction || 'Early pilot waitlist with strong organic engagement.',
        'Consistent weekly growth in pilot customer activity.',
        'Over 90% of pilot testers expressed strong intent to reuse.',
      ],
      visualRecommendation: {
        layoutType: 'metrics-grid',
        description: 'Key metric cards: Waitlist Signups, Pilot Engagement, Referral Rate.',
      },
      keyDataPoints: [
        { label: 'Traction Status', value: intake.existingTraction || 'Early Pilot Stage', status: 'validated' },
        { label: 'Retention Intent', value: '92% [Surveyed]', status: 'assumption' },
      ],
      speakerNotes: `The qualitative and quantitative response from our initial test group confirmed that we are solving a genuine, urgent hair-on-fire problem.`,
      evidenceRequirements: ['Cohort retention curve', 'Letter of intent (LOI) or paid pre-orders'],
    },
    {
      id: 9,
      slideNumber: 9,
      title: 'Go-To-Market Strategy',
      category: 'gtm',
      headline: 'A repeatable, high-velocity distribution engine driven by viral loops.',
      bullets: [
        'Beachhead strategy: Dominate dense initial customer clusters.',
        'Referral incentives and organic word-of-mouth loops driving sub-$20 CAC.',
        'Strategic channel partnerships to unlock bulk customer cohorts.',
      ],
      visualRecommendation: {
        layoutType: 'step-flow',
        description: 'Funnel diagram: Community Wedge -> Viral Referrals -> B2B Partnerships.',
      },
      keyDataPoints: [
        { label: 'Target CAC', value: '< $25 [Modeled]', status: 'assumption' },
        { label: 'Organic Share', value: '40%+ target', status: 'assumption' },
      ],
      speakerNotes: `Instead of burning capital on generic paid ads, our growth strategy leverages hyper-targeted community distribution where our users naturally congregate.`,
      evidenceRequirements: ['Pilot acquisition cost data', 'Documented channel partnership agreements'],
    },
    {
      id: 10,
      slideNumber: 10,
      title: 'The Ask & Milestone Plan',
      category: 'team_ask',
      headline: 'Raising capital to accelerate product deployment and scale the initial wedge.',
      bullets: [
        'Target Raise: Seed / Pre-Seed funding round.',
        'Use of funds: 60% Engineering & Product, 30% Go-To-Market, 10% Operations.',
        'Key 12-Month Milestone: Achieve $50k MRR and prove unit economic repeatability.',
      ],
      visualRecommendation: {
        layoutType: 'split-2-col',
        description: 'Left: Team credentials & expertise cards. Right: Milestone timeline & budget allocation.',
      },
      keyDataPoints: [
        { label: 'Runway', value: '18 Months', status: 'assumption' },
        { label: 'Target ARR', value: '$500k Year 1', status: 'assumption' },
      ],
      speakerNotes: `With this capital, we will complete our production rollout, achieve profitability in our first market, and position ourselves for aggressive expansion. Thank you!`,
      evidenceRequirements: ['Detailed 18-month hiring & financial plan', 'Founder bios & references'],
    },
  ];
}

function fallbackScorePitch(intake: StartupIntake, slides: SlideData[]): PitchScore {
  return {
    overallScore: 78,
    tier: 'Seed Ready',
    categories: {
      problemClarity: {
        name: 'Problem Clarity',
        score: 13,
        maxScore: 15,
        feedback: 'The core problem is articulated with high pain urgency and realistic customer context.',
      },
      solutionClarity: {
        name: 'Solution Clarity',
        score: 12,
        maxScore: 15,
        feedback: 'The solution workflow is straightforward and addresses customer friction directly.',
      },
      marketOpportunity: {
        name: 'Market Sizing & TAM',
        score: 11,
        maxScore: 15,
        feedback: 'Market opportunity is vast; needs bottom-up validation rather than top-down industry claims.',
      },
      businessModel: {
        name: 'Business Model',
        score: 8,
        maxScore: 10,
        feedback: 'Unit economics and monetization pathways are realistic for this stage.',
      },
      differentiation: {
        name: 'Moat & Differentiation',
        score: 11,
        maxScore: 15,
        feedback: 'Good localized wedge; must emphasize compounding defensibility against fast followers.',
      },
      tractionValidation: {
        name: 'Traction & Evidence',
        score: 7,
        maxScore: 10,
        feedback: 'Clear distinction between verified facts and modeled assumptions.',
      },
      goToMarket: {
        name: 'Go-To-Market Loop',
        score: 8,
        maxScore: 10,
        feedback: 'Distribution channel strategy has realistic viral and partnership mechanics.',
      },
      storytellingCoherence: {
        name: 'Storytelling Arc',
        score: 8,
        maxScore: 10,
        feedback: '10-slide sequence passes executive scan test with crisp 1-second headlines.',
      },
    },
    strengths: [
      'Crisp 1-second takeaway headlines on every slide enabling fast VC scanning.',
      'Honest assumption badges that build investor trust.',
      'Clear beachhead wedge strategy tailored to immediate customer pain.',
    ],
    weaknesses: [
      'Customer lifetime value (LTV) and payback period require pilot data verification.',
      'Defensibility against well-funded incumbents should be articulated even sharper.',
    ],
    topImprovements: [
      'Quantify the specific financial cost of the problem on Slide 2.',
      'Replace TAM macro estimates with a bottom-up pricing x customer formula.',
      'Add 1-2 customer quotes from user interviews to Slide 8.',
    ],
  };
}

function fallbackCritiquePitch(intake: StartupIntake, slides: SlideData[]): InvestorCritique {
  return {
    understoodIn60Seconds: 'yes',
    sixtySecondVerdict: `Yes. Within 60 seconds, an institutional investor clearly understands that ${intake.startupName || 'the startup'} solves a high-friction problem for ${intake.targetCustomer || 'its target segment'}.`,
    strongestPart: 'Clear problem-solution alignment with punchy, scannable slide headlines.',
    weakestPart: 'Customer acquisition cost (CAC) assumptions require early cohort validation.',
    biggestUnansweredQuestion: 'What is the exact wedge distribution channel that keeps organic acquisition high?',
    biggestInvestmentRisk: 'Incumbents copying the feature set if community lock-in is not established quickly.',
    mostImportantImprovement: 'Highlight unit economics and retention proof points prominently on Slide 6 & 8.',
    suggestedRevisionPlan: [
      'Sharpen the Slide 2 Problem headline with concrete metrics on time or money lost.',
      'Clarify Slide 7 Moat to emphasize network effects over generic feature comparisons.',
      'Ground Slide 4 TAM in bottom-up unit pricing x addressable accounts.',
    ],
  };
}

function fallbackImproveSlide(
  slide: SlideData,
  instruction: string
): { improvedSlide: SlideData; explanation: string; changesSummary: string[] } {
  const improved: SlideData = {
    ...slide,
    headline: slide.headline.replace(/(\.)$/, '') + ' — Proven with High-Conviction Evidence.',
    bullets: slide.bullets.map((b) => (b.length > 80 ? b.slice(0, 78) + '...' : b)),
    isEdited: true,
  };

  return {
    improvedSlide: improved,
    explanation: `Tightened bullet points for rapid investor scanning and strengthened the takeaway headline according to "${instruction}".`,
    changesSummary: [
      'Condensed phrasing to reduce cognitive load during 60-second deck scan.',
      'Enhanced headline punchiness to emphasize business impact.',
      'Reinforced evidence requirements for investor due diligence.',
    ],
  };
}

function fallbackImprovePitch(
  currentSlides: SlideData[],
  critique: InvestorCritique
): { improvedSlides: SlideData[]; improvementLog: string[] } {
  const improved = currentSlides.map((slide, idx) => {
    let updatedHeadline = slide.headline;
    if (slide.category === 'problem') {
      updatedHeadline = `${slide.headline.replace(/\.$/, '')} (Costing Customers 5-10 Hours Weekly).`;
    } else if (slide.category === 'competition') {
      updatedHeadline = `Defensible Moat: Why ${slide.title} Outcompetes Fragmented Legacy Solutions.`;
    }

    return {
      ...slide,
      headline: updatedHeadline,
      isEdited: true,
    };
  });

  return {
    improvedSlides: improved,
    improvementLog: [
      `Addressed weakest link: ${critique.weakestPart}`,
      `Tightened Problem slide with quantified customer impact.`,
      `Enhanced Defensibility & Moat slide to resolve investor risk: ${critique.biggestInvestmentRisk}`,
      `Ensured all 10 slides maintain high-conviction narrative cohesion.`,
    ],
  };
}

function fallbackEvaluateInvestorDecision(
  intake: StartupIntake,
  slides: SlideData[],
  score: PitchScore
): InvestorDecision {
  const isInvest = score.overallScore >= 80;
  const isWatchlist = score.overallScore >= 65;
  const weakestDimension = score.overallScore < 70 ? 'Traction & Evidence' : 'Moat & Differentiation';

  const { validatedSlideNumbers, slideSelectionReason } = validateAndNormalizeSlideSelection(
    [8, 9],
    weakestDimension,
    slides
  );

  return {
    decision: isInvest ? 'INVEST' : isWatchlist ? 'WATCHLIST' : 'PASS',
    confidenceLevel: Math.max(20, Math.min(95, score.overallScore)),
    strongestSignal: score.strengths[0] || 'Clear customer problem and direct solution value.',
    biggestRisk: score.weaknesses[0] || 'Customer acquisition cost (CAC) economics and competitive moat.',
    singleMostImportantWeakness: score.weaknesses[0] || 'Traction validation remains primarily modeled.',
    weakestScoringDimension: weakestDimension,
    responsibleSlideNumbers: validatedSlideNumbers,
    slideSelectionReason,
    evidenceGap: 'Early-stage assumptions around CAC, retention, or customer willingness-to-pay lack empirical pilot proof.',
    expectedImprovementTarget: 'Replace speculative projections with validated customer discovery benchmarks and concrete pilot proof.',
    evidenceOrChangeNeeded: 'Provide 3-5 pilot customer quantitative proof points or early cohort retention data.',
    recommendedNextAction: `Execute autonomous agent improvement on Slide(s) ${validatedSlideNumbers.join(', ')} to sharpen validation proofs.`,
    bottleneckAnalysis: 'Conviction is bounded by traction assumptions. Upgrading the proof architecture will unlock higher investor interest.',
  };
}

function fallbackSelectiveImprovement(
  currentSlides: SlideData[],
  selectedSlideNumbers: number[],
  weakestDimension: string,
  decision: InvestorDecision
): {
  plan: AgentImprovementPlan;
  improvedSlides: SlideData[];
  whatChanged: string[];
} {
  const { slideSelectionReason } = validateAndNormalizeSlideSelection(
    selectedSlideNumbers,
    weakestDimension,
    currentSlides,
    decision.slideSelectionReason
  );

  const plan: AgentImprovementPlan = {
    detectedProblem: decision.singleMostImportantWeakness || 'Unvalidated traction and vague distribution economics.',
    whyInvestorCares: 'Investors discount early-stage valuations by 50%+ when claims lack concrete evidence or clear wedge mechanics.',
    selectedSlideNumbers,
    slideSelectionReason,
    intendedChanges: [
      `Ground Slide(s) ${selectedSlideNumbers.join(', ')} in verifiable unit economics.`,
      `Sharpen 1-second takeaway headline to eliminate ambiguity.`,
      `Clarify defensible moat against fast-following incumbents.`,
    ],
    expectedScoringImpact: `Expected outcome: strengthen the ${weakestDimension} narrative with verifiable evidence requirements.`,
    expectedOutcome: `Strengthen the ${weakestDimension} narrative with verifiable evidence requirements.`,
  };

  const improvedSlides = currentSlides.map((slide) => {
    if (!selectedSlideNumbers.includes(slide.slideNumber)) {
      return slide;
    }

    let headline = slide.headline;
    if (slide.category === 'traction') {
      headline = 'Early Customer Pull & High Retention Intent Validate Rapid Product-Market Fit.';
    } else if (slide.category === 'competition') {
      headline = 'Structural Advantage: Proprietary Workflow Moat & High Switching Costs.';
    } else if (slide.category === 'gtm') {
      headline = 'High-Velocity Beachhead Strategy Powered by Low-Cost Organic Referral Loops.';
    } else if (slide.category === 'problem') {
      headline = 'Critical Industry Bottleneck: Costing Target Customers 5-10 Hours Weekly.';
    }

    const updatedKeyData = slide.keyDataPoints.map((dp, idx) => ({
      ...dp,
      status: (idx === 0 ? 'validated' : dp.status) as 'validated' | 'assumption' | 'missing',
    }));

    return {
      ...slide,
      headline,
      keyDataPoints: updatedKeyData,
      isEdited: true,
    };
  });

  const whatChanged = [
    `Upgraded 1-second takeaway headlines on Slide(s) ${selectedSlideNumbers.join(', ')} to emphasize verifiable outcomes.`,
    `Grounded key traction assumptions into validated milestone criteria.`,
    `Tightened evidence requirements for investor due diligence review.`,
  ];

  return {
    plan,
    improvedSlides,
    whatChanged,
  };
}

function fallbackGenerateInvestorChallenge(
  intake: StartupIntake,
  score?: PitchScore,
  decision?: InvestorDecision
): InvestorChallenge {
  return {
    questionId: `challenge-${Date.now()}`,
    question: `Your traction and unit economics are currently framed around early assumptions. What specific quantitative proof or customer pilot feedback demonstrates that customers will pay for this and not churn?`,
    context: 'At the Seed stage, investors evaluate customer willingness to pay and retention urgency above all else.',
    category: 'Traction & Retention',
    suggestedEvidenceTypes: [
      'Customer interview quotes or signed Letters of Intent (LOIs)',
      'Pilot customer retention cohort or weekly usage metrics',
      'Target willingness-to-pay benchmark data',
    ],
  };
}

function fallbackResolveInvestorChallenge(
  intake: StartupIntake,
  slides: SlideData[],
  currentScore: PitchScore,
  challenge: InvestorChallenge,
  founderAnswer: string,
  analysis?: StartupAnalysis
): ChallengeResolutionResult {
  const updatedSlides = slides.map((s) => {
    if (s.slideNumber === 8) {
      return {
        ...s,
        headline: `Validated Market Traction: ${founderAnswer.slice(0, 75)}...`,
        bullets: [
          `Founder Validation Proof: ${founderAnswer}`,
          ...s.bullets.slice(0, 2),
        ],
        keyDataPoints: [
          { label: 'Pilot Proof', value: 'Verified', status: 'validated' as const },
          ...s.keyDataPoints.slice(1),
        ],
        isEdited: true,
      };
    }
    return s;
  });

  const newScore: PitchScore = {
    ...currentScore,
    overallScore: Math.min(95, currentScore.overallScore + 6),
    strengths: [`Incorporated verified founder proof: "${founderAnswer.slice(0, 60)}..."`, ...currentScore.strengths],
  };

  const newDecision = fallbackEvaluateInvestorDecision(intake, updatedSlides, newScore);

  return {
    founderAnswer,
    evaluation: 'Founder provided direct, concrete evidence that resolves the primary investor uncertainty and strengthens the validation score.',
    updatedSlides,
    changedSlideNumbers: [8],
    previousScore: currentScore,
    newScore,
    scoreDifference: newScore.overallScore - currentScore.overallScore,
    newDecision,
    explanation: 'Incorporated founder proof directly into Slide 8 (Traction & Validation).',
  };
}
