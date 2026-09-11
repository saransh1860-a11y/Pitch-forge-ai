import { describe, it, expect, beforeEach } from 'vitest';
import {
  ToolRegistry,
  DeckState,
  AGENT_ROLE_PERMISSIONS,
} from './toolRegistry';
import { StartupIntake, SlideData, PitchScore } from '../../src/types/pitch';

const mockIntake: StartupIntake = {
  startupName: 'TestStartup AI',
  tagline: 'Autonomous AI Agent Platform',
  rawIdea: 'An autonomous agent platform that optimizes pitch decks using tool execution.',
  problem: 'Founders lack institutional VC feedback.',
  targetCustomer: 'Early stage startup founders',
  solution: 'AI agent deck optimizer',
  businessModel: 'B2B SaaS Subscription',
  stage: 'Early Revenue',
  geography: 'Global',
  existingTraction: '$5k MRR pilot with 3 enterprise clients.',
  competitors: 'Legacy manual consultants',
  competitiveAdvantage: 'Closed-loop tool execution and autonomous VC simulation',
  revenueModel: 'SaaS Subscription',
  teamInfo: 'Ex-Google DeepMind AI Engineers',
  additionalContext: 'Targeting $1M Pre-Seed round',
};

const mockSlides: SlideData[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  slideNumber: i + 1,
  title: `Slide ${i + 1}`,
  category: i === 0 ? 'vision' : i === 7 ? 'traction' : 'problem',
  headline: `Baseline Headline for Slide ${i + 1}`,
  bullets: [`Key bullet point A for slide ${i + 1}`, `Key bullet point B for slide ${i + 1}`],
  visualRecommendation: {
    layoutType: 'split-2-col',
    description: 'Visual mockup layout',
  },
  keyDataPoints: [
    { label: 'Pilot MRR', value: '$5,000', status: 'validated' },
    { label: 'Target NPS', value: '75+', status: 'assumption' },
  ],
  speakerNotes: 'Detailed speaker notes for baseline slide.',
  evidenceRequirements: ['Early cohort retention data'],
}));

const makeCategoryScore = (name: string, score: number) => ({
  name,
  score,
  maxScore: 100,
  feedback: 'Solid foundation with clear metric potential.',
  reasoning: 'Solid foundation with clear metric potential.',
  keyStrengths: ['Good initial framing'],
  keyGaps: ['More proof needed'],
  actionableAdvice: ['Ground in cohort analysis'],
  priority: 'medium' as const,
});

const mockScore: PitchScore = {
  overallScore: 72,
  tier: 'Seed Ready',
  categories: {
    problemClarity: makeCategoryScore('Problem Clarity', 75),
    solutionClarity: makeCategoryScore('Solution Clarity', 70),
    marketOpportunity: makeCategoryScore('Market Opportunity', 75),
    businessModel: makeCategoryScore('Business Model', 70),
    differentiation: makeCategoryScore('Differentiation', 75),
    tractionValidation: makeCategoryScore('Traction & Validation', 65),
    goToMarket: makeCategoryScore('Go To Market', 70),
    storytellingCoherence: makeCategoryScore('Storytelling & Coherence', 75),
  },
  strengths: ['Clear team background'],
  weaknesses: ['Unvalidated market NPS assumptions'],
  topImprovements: ['Ground NPS claims in pilot metrics'],
};

function createInitialDeckState(): DeckState {
  return {
    currentSlides: JSON.parse(JSON.stringify(mockSlides)),
    originalSlides: JSON.parse(JSON.stringify(mockSlides)),
    version: 1,
    score: JSON.parse(JSON.stringify(mockScore)),
    revisionHistory: [],
    intake: mockIntake,
  };
}

describe('ToolRegistry and Agent Tools Integration Tests', () => {
  let registry: ToolRegistry;
  let deckState: DeckState;

  beforeEach(() => {
    registry = new ToolRegistry();
    deckState = createInitialDeckState();
  });

  it('1. Should correctly load and discover registered tools', () => {
    const tools = registry.getAllTools();
    expect(tools.length).toBeGreaterThanOrEqual(7);

    const inspectTool = registry.getTool('inspect_deck');
    expect(inspectTool).toBeDefined();
    expect(inspectTool?.category).toBe('diagnostic');

    const reviseTool = registry.getTool('revise_slide');
    expect(reviseTool).toBeDefined();
    expect(reviseTool?.category).toBe('revision');
  });

  it('2. inspect_deck should return exact slide count and assumption metrics', async () => {
    const result = await registry.executeTool(
      'step-1',
      'Diagnostic Agent',
      'inspect_deck',
      {},
      deckState,
      'Inspect baseline deck'
    );

    expect(result.trace.status).toBe('completed');
    expect(result.result.slideCount).toBe(10);
    expect(result.result.assumptionCount).toBe(10); // 1 per slide
    expect(result.result.validatedCount).toBe(10); // 1 per slide
  });

  it('3. revise_slide should modify in-memory DeckState and record history', async () => {
    const targetSlideNum = 8;
    const newHeadline = 'Verified Traction Engine: $5k MRR and 3 Enterprise Pilots';

    const result = await registry.executeTool(
      'step-2',
      'Revision Agent',
      'revise_slide',
      {
        slideNumber: targetSlideNum,
        revisionObjective: 'Ground traction in enterprise pilot metrics',
        headlineOverride: newHeadline,
      },
      deckState,
      'Revise Slide 8'
    );

    expect(result.trace.status).toBe('completed');
    expect(deckState.currentSlides[7].headline).toBe(newHeadline);
    expect(deckState.version).toBe(2);
    expect(deckState.revisionHistory.length).toBe(1);
    expect(deckState.revisionHistory[0].slides[7].headline).toBe('Baseline Headline for Slide 8');
  });

  it('4. compare_decks should identify exact changed slide numbers', async () => {
    // Modify slide 8
    await registry.executeTool(
      'step-a',
      'Revision Agent',
      'revise_slide',
      {
        slideNumber: 8,
        revisionObjective: 'Update headline',
        headlineOverride: 'New Scalable Headline',
      },
      deckState,
      'Revise Slide 8'
    );

    const compareRes = await registry.executeTool(
      'step-b',
      'Revision Agent',
      'compare_decks',
      { targetVersion: 1 },
      deckState,
      'Compare version 2 against baseline'
    );

    expect(compareRes.result.changedSlides).toEqual([8]);
    expect(compareRes.result.changedHeadlines.length).toBe(1);
    expect(compareRes.result.isIdentical).toBe(false);
  });

  it('5. verify_revision should pass valid 10-slide revisions and fail truncated decks', async () => {
    // Test valid revision
    await registry.executeTool(
      'step-a',
      'Revision Agent',
      'revise_slide',
      {
        slideNumber: 8,
        revisionObjective: 'Update headline',
        headlineOverride: 'Validated Headline',
      },
      deckState,
      'Revise Slide 8'
    );

    const validRes = await registry.executeTool(
      'step-v1',
      'Verification Agent',
      'verify_revision',
      { targetSlideNumber: 8 },
      deckState,
      'Verify valid revision'
    );

    expect(validRes.result.passed).toBe(true);

    // Test invalid truncated deck constraint
    deckState.currentSlides.pop(); // reduce to 9 slides
    const invalidRes = await registry.executeTool(
      'step-v2',
      'Verification Agent',
      'verify_revision',
      { targetSlideNumber: 8 },
      deckState,
      'Verify truncated deck'
    );

    expect(invalidRes.result.passed).toBe(false);
    expect(invalidRes.result.issues[0]).toContain('Deck length constraint violation');
  });

  it('6. rollback_revision should restore previous state and score', async () => {
    // 1. Snapshot initial headline
    const origHeadline = deckState.currentSlides[7].headline;

    // 2. Perform revision
    await registry.executeTool(
      'step-1',
      'Revision Agent',
      'revise_slide',
      {
        slideNumber: 8,
        revisionObjective: 'Bad change',
        headlineOverride: 'Temporary Bad Headline',
      },
      deckState,
      'Bad revision'
    );

    expect(deckState.currentSlides[7].headline).toBe('Temporary Bad Headline');

    // 3. Rollback
    const rollbackRes = await registry.executeTool(
      'step-2',
      'Decision Agent',
      'rollback_revision',
      { targetVersion: 1, reason: 'Test rollback' },
      deckState,
      'Rollback bad change'
    );

    expect(rollbackRes.result.rolledBack).toBe(true);
    expect(deckState.currentSlides[7].headline).toBe(origHeadline);
    expect(deckState.version).toBe(1);
  });

  it('7. Permission Model should reject unauthorized tool execution', async () => {
    // Diagnostic Agent calling revise_slide should be rejected by permission model
    const res = await registry.executeTool(
      'step-perm',
      'Diagnostic Agent',
      'revise_slide',
      { slideNumber: 1, revisionObjective: 'Unauthorized edit' },
      deckState,
      'Unauthorized attempt'
    );

    expect(res.trace.status).toBe('rejected');
    expect(res.result.error).toContain('Permission denied');
  });

  it('8. Input Validation should reject missing required arguments', async () => {
    const res = await registry.executeTool(
      'step-val',
      'Revision Agent',
      'revise_slide',
      { slideNumber: 1 }, // Missing required revisionObjective
      deckState,
      'Missing required field'
    );

    expect(res.trace.status).toBe('failed');
    expect(res.result.error).toContain('Missing required field "revisionObjective"');
  });
});
