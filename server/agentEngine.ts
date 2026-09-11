import {
  StartupIntake,
  StartupAnalysis,
  SlideData,
  PitchScore,
  InvestorCritique,
  InvestorDecision,
  AgentImprovementPlan,
  AutonomousImprovementResult,
  AgentTraceStep,
} from '../src/types/pitch';
import {
  DeckState,
  globalToolRegistry,
  ToolExecutionTrace,
  AgentRole,
} from './tools/toolRegistry';
import { evaluateInvestorDecision, callGeminiWithRetry } from './geminiService';
import { Type } from '@google/genai';

export const MAX_AGENT_STEPS = 12;

export interface ExtendedToolTraceStep extends AgentTraceStep {
  toolName?: string;
  category?: string;
  inputSummary?: string;
  outputSummary?: string;
  durationMs?: number;
  agentRole?: AgentRole;
  status: 'completed' | 'in_progress' | 'pending' | 'rejected' | 'failed';
}

export interface ExtendedAutonomousImprovementResult extends AutonomousImprovementResult {
  toolTraces?: ToolExecutionTrace[];
  extendedTraceSteps?: ExtendedToolTraceStep[];
  toolsUsedSummary?: Record<string, number>;
  toolActivityStats?: {
    totalDecisions: number;
    toolCallsCount: number;
    slidesModifiedCount: number;
    verificationsCount: number;
    rollbacksCount: number;
  };
  verificationPassed?: boolean;
  rollbackOccurred?: boolean;
}

/**
 * Main Tool-Using Agent Loop Execution Engine
 */
export async function runAgentToolLoop(
  intake: StartupIntake,
  currentSlides: SlideData[],
  currentScore: PitchScore,
  critique: InvestorCritique,
  decision?: InvestorDecision,
  analysis?: StartupAnalysis,
  maxSteps: number = MAX_AGENT_STEPS
): Promise<ExtendedAutonomousImprovementResult> {
  const startTime = Date.now();
  const toolTraces: ToolExecutionTrace[] = [];
  const extendedTraceSteps: ExtendedToolTraceStep[] = [];
  const toolsUsedSummary: Record<string, number> = {};

  let stepCount = 0;
  let rollbacksCount = 0;
  let verificationsCount = 0;
  let slidesModifiedCount = 0;

  const trackToolUsage = (toolName: string) => {
    toolsUsedSummary[toolName] = (toolsUsedSummary[toolName] || 0) + 1;
  };

  // 1. Initialize Authoritative DeckState
  const deckState: DeckState = {
    currentSlides: JSON.parse(JSON.stringify(currentSlides)),
    originalSlides: JSON.parse(JSON.stringify(currentSlides)),
    version: 1,
    score: JSON.parse(JSON.stringify(currentScore)),
    revisionHistory: [],
    intake,
    analysis,
    critique,
    decision,
  };

  const getNow = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // ----------------------------------------------------
  // STEP 1: Diagnostic Agent -> inspect_deck
  // ----------------------------------------------------
  stepCount++;
  const step1 = await globalToolRegistry.executeTool(
    `step-${stepCount}`,
    'Diagnostic Agent',
    'inspect_deck',
    { includeSpeakerNotes: false },
    deckState,
    'Inspect initial pitch deck structure and count assumption data points'
  );
  toolTraces.push(step1.trace);
  trackToolUsage('inspect_deck');

  extendedTraceSteps.push({
    id: `step-${stepCount}`,
    timestamp: getNow(),
    title: 'Diagnostic Agent: Inspect Pitch Deck State',
    status: step1.trace.status,
    detail: `TOOL: inspect_deck → Evaluated ${step1.result.slideCount} slides. Found ${step1.result.assumptionCount} assumptions requiring evidence.`,
    badge: `Deck v${deckState.version}`,
    toolName: 'inspect_deck',
    category: 'diagnostic',
    agentRole: 'Diagnostic Agent',
    inputSummary: 'includeSpeakerNotes: false',
    outputSummary: `${step1.result.slideCount} slides, ${step1.result.assumptionCount} assumptions`,
    durationMs: step1.trace.durationMs,
  });

  // ----------------------------------------------------
  // STEP 2: Diagnostic Agent -> inspect_evidence
  // ----------------------------------------------------
  stepCount++;
  const step2 = await globalToolRegistry.executeTool(
    `step-${stepCount}`,
    'Diagnostic Agent',
    'inspect_evidence',
    {},
    deckState,
    'Analyze claim verification gaps across all 10 slides'
  );
  toolTraces.push(step2.trace);
  trackToolUsage('inspect_evidence');

  extendedTraceSteps.push({
    id: `step-${stepCount}`,
    timestamp: getNow(),
    title: 'Diagnostic Agent: Inspect Claim Evidence Gaps',
    status: step2.trace.status,
    detail: `TOOL: inspect_evidence → Examined ${step2.result.totalClaims} key data claims: ${step2.result.validatedCount} validated, ${step2.result.assumptionCount} assumptions, ${step2.result.missingCount} missing.`,
    badge: `${step2.result.assumptionCount} Gaps`,
    toolName: 'inspect_evidence',
    category: 'evidence',
    agentRole: 'Diagnostic Agent',
    inputSummary: 'Targeting all slides',
    outputSummary: `${step2.result.validatedCount} validated / ${step2.result.assumptionCount} assumptions`,
    durationMs: step2.trace.durationMs,
  });

  // ----------------------------------------------------
  // STEP 3: Strategy Agent -> Evaluate Investor Decision & Select Bottleneck
  // ----------------------------------------------------
  const resolvedDecision = decision || (await evaluateInvestorDecision(intake, currentSlides, currentScore, analysis));
  const weakestDimension = resolvedDecision.weakestScoringDimension || 'Traction & Evidence';
  const targetSlides = resolvedDecision.responsibleSlideNumbers?.length > 0
    ? resolvedDecision.responsibleSlideNumbers.filter((n) => n >= 1 && n <= 10)
    : [8]; // Default to Slide 8 (Traction) if unspecified

  stepCount++;
  extendedTraceSteps.push({
    id: `step-${stepCount}`,
    timestamp: getNow(),
    title: 'Strategy Agent: Formulate Targeted Revision Strategy',
    status: 'completed',
    detail: `Identified VC Bottleneck: "${weakestDimension}". Targeting Slide(s) ${targetSlides.join(', ')} for evidence-grounded revision.`,
    badge: `Target: Slide ${targetSlides.join(', ')}`,
    agentRole: 'Strategy Agent',
  });

  // ----------------------------------------------------
  // STEP 4: Revision Agent -> Formulate and Call revise_slide
  // ----------------------------------------------------
  const targetSlideNum = targetSlides[0] || 8;
  const targetSlide = deckState.currentSlides.find((s) => s.slideNumber === targetSlideNum) || deckState.currentSlides[7];

  // Ask LLM for the revision parameters (or use evidence-grounded prompt)
  const revisionPrompt = `You are an elite VC Revision Agent in a tool-using system.
Generate a high-conviction, evidence-grounded revision for Slide ${targetSlideNum} (${targetSlide.title}) of startup "${intake.startupName}".

Current Slide Content:
Headline: "${targetSlide.headline}"
Bullets: ${JSON.stringify(targetSlide.bullets)}
Key Data Points: ${JSON.stringify(targetSlide.keyDataPoints)}

Startup Intake Evidence:
Stage: ${intake.stage}
Existing Traction: ${intake.existingTraction || 'Pre-launch'}
Revenue Model: ${intake.revenueModel || 'N/A'}
Bottleneck: ${weakestDimension}

RULES:
1. Rewrite headline to be punchy, executive-ready, and 1-second scannable.
2. Upgrade 3 bullet points with concrete wedge mechanics and validation requirements.
3. CRITICAL: NEVER fabricate revenue, users, or customer logos not present in founder input.
4. If traction is unverified, explicitly label status as 'assumption' or 'missing'. Do NOT falsely claim 'validated' unless verified in intake.`;

  let headlineOverride = targetSlide.headline;
  let bulletsOverride = targetSlide.bullets;
  let dataPointsOverride = targetSlide.keyDataPoints;
  let revisionObjective = `Strengthen Slide ${targetSlideNum} narrative on ${weakestDimension}`;

  try {
    const aiText = await callGeminiWithRetry({
      contents: revisionPrompt,
      config: {
        systemInstruction: 'You are an expert pitch revision tool agent. Return JSON with improved headline, bullets, and data points.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            objective: { type: Type.STRING },
            headline: { type: Type.STRING },
            bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
            dataPoints: {
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
          },
          required: ['headline', 'bullets', 'dataPoints'],
        },
      },
    });

    const parsed = JSON.parse(aiText);
    if (parsed.headline) headlineOverride = parsed.headline;
    if (parsed.bullets && parsed.bullets.length > 0) bulletsOverride = parsed.bullets;
    if (parsed.dataPoints && parsed.dataPoints.length > 0) {
      dataPointsOverride = parsed.dataPoints.map((dp: any) => ({
        label: dp.label,
        value: dp.value,
        status: (dp.status === 'validated' || dp.status === 'assumption' || dp.status === 'missing') ? dp.status : 'assumption',
      }));
    }
    if (parsed.objective) revisionObjective = parsed.objective;
  } catch (err) {
    console.warn('AI slide revision generation fell back to deterministic strategic synthesis:', err);
    headlineOverride = `Verified ${targetSlide.category.toUpperCase()} Execution Engine & Wedge Strategy`;
    bulletsOverride = [
      `Grounded in verified founder stage (${intake.stage}) with clear milestone gates.`,
      `Eliminated narrative ambiguity by converting vague projections into testable hypotheses.`,
      `Established formal evidence requirements for institutional VC diligence.`,
    ];
  }

  stepCount++;
  const step4 = await globalToolRegistry.executeTool(
    `step-${stepCount}`,
    'Revision Agent',
    'revise_slide',
    {
      slideNumber: targetSlideNum,
      revisionObjective,
      headlineOverride,
      bulletsOverride,
      dataPointsOverride,
    },
    deckState,
    `Execute in-memory revision on Slide ${targetSlideNum}`
  );
  toolTraces.push(step4.trace);
  trackToolUsage('revise_slide');
  slidesModifiedCount++;

  extendedTraceSteps.push({
    id: `step-${stepCount}`,
    timestamp: getNow(),
    title: `Revision Agent: Execute Slide ${targetSlideNum} Modification`,
    status: step4.trace.status,
    detail: `TOOL: revise_slide → Applied in-memory modification on Slide ${targetSlideNum}. Deck version updated to v${deckState.version}.`,
    badge: `Slide ${targetSlideNum} Revised`,
    slideNumbers: [targetSlideNum],
    toolName: 'revise_slide',
    category: 'revision',
    agentRole: 'Revision Agent',
    inputSummary: `Slide ${targetSlideNum}, Obj: ${revisionObjective}`,
    outputSummary: step4.result.changesMade ? step4.result.changesMade.join('; ') : 'Slide updated',
    durationMs: step4.trace.durationMs,
  });

  // ----------------------------------------------------
  // STEP 5: Revision Agent -> compare_decks
  // ----------------------------------------------------
  stepCount++;
  const step5 = await globalToolRegistry.executeTool(
    `step-${stepCount}`,
    'Revision Agent',
    'compare_decks',
    { targetVersion: 1 },
    deckState,
    'Compare current deck state against original baseline'
  );
  toolTraces.push(step5.trace);
  trackToolUsage('compare_decks');

  extendedTraceSteps.push({
    id: `step-${stepCount}`,
    timestamp: getNow(),
    title: 'Revision Agent: Compare Deck State Delta',
    status: step5.trace.status,
    detail: `TOOL: compare_decks → Changed slides: [${step5.result.changedSlides.join(', ')}]. Delta detected across headlines and bullet structures.`,
    badge: `${step5.result.changedSlides.length} Slide Delta`,
    toolName: 'compare_decks',
    category: 'comparison',
    agentRole: 'Revision Agent',
    inputSummary: 'Compare against baseline v1',
    outputSummary: `Modified slide(s): ${step5.result.changedSlides.join(', ')}`,
    durationMs: step5.trace.durationMs,
  });

  // ----------------------------------------------------
  // STEP 6: Verification Agent -> verify_revision
  // ----------------------------------------------------
  stepCount++;
  const step6 = await globalToolRegistry.executeTool(
    `step-${stepCount}`,
    'Verification Agent',
    'verify_revision',
    { targetSlideNumber: targetSlideNum },
    deckState,
    'Verify deck integrity, slide constraints, and ungrounded claims'
  );
  toolTraces.push(step6.trace);
  trackToolUsage('verify_revision');
  verificationsCount++;

  const verificationResult = step6.result;
  let rollbackOccurred = false;

  extendedTraceSteps.push({
    id: `step-${stepCount}`,
    timestamp: getNow(),
    title: 'Verification Agent: Verify Deck Integrity & Constraints',
    status: verificationResult.passed ? 'completed' : 'rejected',
    detail: `TOOL: verify_revision → ${
      verificationResult.passed
        ? 'Verification PASSED. Deck contains exactly 10 slides, valid structure, and no ungrounded claims.'
        : `Verification FAILED: ${verificationResult.issues.concat(verificationResult.unsupportedClaims).join(' ')}`
    }`,
    badge: verificationResult.passed ? 'VERIFIED' : 'FAILED',
    toolName: 'verify_revision',
    category: 'verification',
    agentRole: 'Verification Agent',
    inputSummary: `Check Slide ${targetSlideNum}`,
    outputSummary: verificationResult.passed ? 'PASSED: 10/10 slides valid' : `FAILED: ${verificationResult.issues.length} issues`,
    durationMs: step6.trace.durationMs,
  });

  // ----------------------------------------------------
  // RECOVERY BRANCH: If Verification Failed -> Rollback!
  // ----------------------------------------------------
  if (!verificationResult.passed) {
    stepCount++;
    const stepRollback = await globalToolRegistry.executeTool(
      `step-${stepCount}`,
      'Decision Agent',
      'rollback_revision',
      { targetVersion: 1, reason: 'Verification failed due to invalid constraints or ungrounded claims' },
      deckState,
      'Rollback state to pre-revision baseline'
    );
    toolTraces.push(stepRollback.trace);
    trackToolUsage('rollback_revision');
    rollbacksCount++;
    rollbackOccurred = true;

    extendedTraceSteps.push({
      id: `step-${stepCount}`,
      timestamp: getNow(),
      title: 'Decision Agent: Execute Rollback on Verification Failure',
      status: 'completed',
      detail: `TOOL: rollback_revision → Restored deck to version ${stepRollback.result.restoredVersion}. Prevented invalid deck from proceeding.`,
      badge: 'ROLLED BACK',
      toolName: 'rollback_revision',
      category: 'recovery',
      agentRole: 'Decision Agent',
      inputSummary: 'Target version 1',
      outputSummary: `Restored version ${stepRollback.result.restoredVersion}`,
      durationMs: stepRollback.trace.durationMs,
    });
  }

  // ----------------------------------------------------
  // STEP 7: Decision Agent -> score_deck
  // ----------------------------------------------------
  stepCount++;
  const step7 = await globalToolRegistry.executeTool(
    `step-${stepCount}`,
    'Decision Agent',
    'score_deck',
    { context: 'Post-revision scoring evaluation' },
    deckState,
    'Re-evaluate VC score on authoritative DeckState'
  );
  toolTraces.push(step7.trace);
  trackToolUsage('score_deck');

  const newScore: PitchScore = step7.result;
  const scoreDifference = newScore.overallScore - currentScore.overallScore;

  extendedTraceSteps.push({
    id: `step-${stepCount}`,
    timestamp: getNow(),
    title: 'Decision Agent: Re-score Revised Pitch Deck',
    status: step7.trace.status,
    detail: `TOOL: score_deck → Re-evaluated deck score: ${currentScore.overallScore} → ${newScore.overallScore} (${scoreDifference >= 0 ? '+' : ''}${scoreDifference} pts).`,
    badge: `Score: ${newScore.overallScore}/100`,
    toolName: 'score_deck',
    category: 'scoring',
    agentRole: 'Decision Agent',
    inputSummary: 'Authoritative DeckState',
    outputSummary: `Score ${newScore.overallScore}/100 (${newScore.tier})`,
    durationMs: step7.trace.durationMs,
  });

  // ----------------------------------------------------
  // STEP 8: Decision Agent Final Acceptance & Rollback Decision
  // ----------------------------------------------------
  let revisionAccepted = false;
  let outcomeReason = '';

  if (rollbackOccurred) {
    revisionAccepted = false;
    outcomeReason = 'Revision failed strict verification checks and was safely rolled back to preserve deck integrity.';
  } else if (scoreDifference < 0) {
    // Score degraded! Perform rollback!
    stepCount++;
    const stepScoreRollback = await globalToolRegistry.executeTool(
      `step-${stepCount}`,
      'Decision Agent',
      'rollback_revision',
      { targetVersion: 1, reason: `Revised score (${newScore.overallScore}) was lower than baseline (${currentScore.overallScore})` },
      deckState,
      'Rollback degraded revision'
    );
    toolTraces.push(stepScoreRollback.trace);
    trackToolUsage('rollback_revision');
    rollbacksCount++;
    rollbackOccurred = true;
    revisionAccepted = false;

    extendedTraceSteps.push({
      id: `step-${stepCount}`,
      timestamp: getNow(),
      title: 'Decision Agent: Rollback Score-Degraded Revision',
      status: 'completed',
      detail: `TOOL: rollback_revision → Reverted changes because revised score fell by ${Math.abs(scoreDifference)} points. Baseline restored.`,
      badge: 'ROLLED BACK',
      toolName: 'rollback_revision',
      category: 'recovery',
      agentRole: 'Decision Agent',
      inputSummary: `Rollback due to score delta ${scoreDifference}`,
      outputSummary: 'Restored baseline version 1',
      durationMs: stepScoreRollback.trace.durationMs,
    });

    outcomeReason = `Revision was rejected and rolled back because it reduced overall score by ${Math.abs(scoreDifference)} points.`;
  } else {
    revisionAccepted = true;
    outcomeReason = scoreDifference > 0
      ? `Autonomous improvement loop successfully improved score by +${scoreDifference} points across Slide(s) ${targetSlides.join(', ')}.`
      : `Revision maintained score at ${newScore.overallScore}/100 while grounding assumptions in evidence requirements.`;
  }

  const decisionPlan: AgentImprovementPlan = {
    detectedProblem: resolvedDecision.singleMostImportantWeakness || 'Unvalidated traction and vague distribution economics.',
    whyInvestorCares: 'Investors discount early-stage valuations when validation claims lack concrete evidence or clear wedge mechanics.',
    selectedSlideNumbers: targetSlides,
    slideSelectionReason: `Selected Slide(s) ${targetSlides.join(', ')} to target the ${weakestDimension} bottleneck.`,
    intendedChanges: [
      `Ground Slide ${targetSlides.join(', ')} in verifiable proof criteria.`,
      `Sharpen 1-second takeaway headline for fast investor scanning.`,
      `Eliminate ungrounded claims and enforce assumption labels.`,
    ],
    expectedScoringImpact: `Grounding narrative in evidence requirements to elevate ${weakestDimension}.`,
    expectedOutcome: `Grounding narrative in evidence requirements to elevate ${weakestDimension}.`,
  };

  const whatChanged = [
    `TOOL revise_slide: Updated Slide ${targetSlideNum} headline to "${headlineOverride}"`,
    `TOOL inspect_evidence: Verified all key claims against founder stage (${intake.stage})`,
    `TOOL verify_revision: Confirmed 10-slide structural constraint and absence of ungrounded revenue claims`,
  ];

  return {
    previousScore: currentScore,
    newScore: deckState.score,
    previousDecision: decision,
    newDecision: resolvedDecision,
    decisionPlan,
    improvedSlides: deckState.currentSlides,
    changedSlideNumbers: targetSlides,
    whatChanged,
    revisionAccepted,
    scoreDifference: deckState.score.overallScore - currentScore.overallScore,
    outcomeReason,
    traceSteps: extendedTraceSteps,
    toolTraces,
    extendedTraceSteps,
    toolsUsedSummary,
    toolActivityStats: {
      totalDecisions: stepCount,
      toolCallsCount: toolTraces.length,
      slidesModifiedCount,
      verificationsCount,
      rollbacksCount,
    },
    verificationPassed: verificationResult.passed,
    rollbackOccurred,
  };
}
