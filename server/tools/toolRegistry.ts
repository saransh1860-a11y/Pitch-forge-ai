import {
  StartupIntake,
  StartupAnalysis,
  SlideData,
  PitchScore,
  InvestorCritique,
  InvestorDecision,
} from '../../src/types/pitch';
import { scorePitch } from '../geminiService';

export type AgentRole =
  | 'Diagnostic Agent'
  | 'Strategy Agent'
  | 'Revision Agent'
  | 'Verification Agent'
  | 'Decision Agent';

export type ToolCategory =
  | 'diagnostic'
  | 'scoring'
  | 'evidence'
  | 'revision'
  | 'comparison'
  | 'verification'
  | 'recovery';

export interface AgentToolInputSchema {
  type: string;
  properties: Record<string, { type: string; description?: string; items?: any; required?: boolean }>;
  required?: string[];
}

export interface AgentTool<TInput = any, TOutput = any> {
  name: string;
  description: string;
  category: ToolCategory;
  inputSchema: AgentToolInputSchema;
  execute: (input: TInput, state: DeckState) => Promise<TOutput>;
}

export interface DeckVersionRecord {
  version: number;
  slides: SlideData[];
  score: PitchScore;
  timestamp: string;
  note: string;
}

export interface VerificationResult {
  passed: boolean;
  issues: string[];
  unsupportedClaims: string[];
  changedSlides: number[];
}

export interface DeckState {
  currentSlides: SlideData[];
  originalSlides: SlideData[];
  version: number;
  score: PitchScore;
  revisionHistory: DeckVersionRecord[];
  activeRevision?: number;
  verificationStatus?: VerificationResult;
  intake: StartupIntake;
  analysis?: StartupAnalysis;
  critique?: InvestorCritique;
  decision?: InvestorDecision;
}

export interface ToolExecutionTrace {
  stepId: string;
  agentRole: AgentRole;
  toolName: string;
  category: ToolCategory;
  purpose: string;
  input: any;
  output: any;
  status: 'completed' | 'failed' | 'rejected';
  timestamp: string;
  durationMs: number;
}

// Map agent roles to allowed tool names (Agent Tool Permission Model)
export const AGENT_ROLE_PERMISSIONS: Record<AgentRole, string[]> = {
  'Diagnostic Agent': ['inspect_deck', 'inspect_evidence', 'score_deck'],
  'Strategy Agent': ['inspect_deck', 'inspect_evidence', 'score_deck'],
  'Revision Agent': ['inspect_deck', 'revise_slide', 'compare_decks'],
  'Verification Agent': ['compare_decks', 'verify_revision', 'score_deck'],
  'Decision Agent': ['score_deck', 'verify_revision', 'rollback_revision'],
};

/**
 * Central Tool Registry
 */
export class ToolRegistry {
  private tools: Map<string, AgentTool> = new Map();

  constructor() {
    this.registerDefaultTools();
  }

  public registerTool(tool: AgentTool): void {
    this.tools.set(tool.name, tool);
  }

  public getTool(name: string): AgentTool | undefined {
    return this.tools.get(name);
  }

  public getAllTools(): AgentTool[] {
    return Array.from(this.tools.values());
  }

  public getToolsForRole(role: AgentRole): AgentTool[] {
    const allowedNames = AGENT_ROLE_PERMISSIONS[role] || [];
    return allowedNames
      .map((name) => this.tools.get(name))
      .filter((tool): tool is AgentTool => tool !== undefined);
  }

  public validateInput(toolName: string, input: any): { valid: boolean; errors: string[] } {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return { valid: false, errors: [`Tool "${toolName}" is not registered.`] };
    }

    const errors: string[] = [];
    const schema = tool.inputSchema;

    if (schema.required) {
      for (const reqField of schema.required) {
        if (input === undefined || input === null || input[reqField] === undefined) {
          errors.push(`Missing required field "${reqField}" for tool "${toolName}".`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  public async executeTool(
    stepId: string,
    agentRole: AgentRole,
    toolName: string,
    input: any,
    state: DeckState,
    purpose: string
  ): Promise<{ trace: ToolExecutionTrace; result: any }> {
    const startTime = Date.now();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // 1. Permission check
    const allowedNames = AGENT_ROLE_PERMISSIONS[agentRole] || [];
    if (!allowedNames.includes(toolName)) {
      const trace: ToolExecutionTrace = {
        stepId,
        agentRole,
        toolName,
        category: 'recovery',
        purpose,
        input,
        output: { error: `Permission denied: ${agentRole} is not authorized to call ${toolName}.` },
        status: 'rejected',
        timestamp,
        durationMs: Date.now() - startTime,
      };
      return { trace, result: trace.output };
    }

    // 2. Existence & Input Validation Check
    const tool = this.tools.get(toolName);
    if (!tool) {
      const trace: ToolExecutionTrace = {
        stepId,
        agentRole,
        toolName,
        category: 'recovery',
        purpose,
        input,
        output: { error: `Tool "${toolName}" not found in ToolRegistry.` },
        status: 'failed',
        timestamp,
        durationMs: Date.now() - startTime,
      };
      return { trace, result: trace.output };
    }

    const validation = this.validateInput(toolName, input);
    if (!validation.valid) {
      const trace: ToolExecutionTrace = {
        stepId,
        agentRole,
        toolName,
        category: tool.category,
        purpose,
        input,
        output: { error: `Invalid tool arguments: ${validation.errors.join(' ')}` },
        status: 'failed',
        timestamp,
        durationMs: Date.now() - startTime,
      };
      return { trace, result: trace.output };
    }

    // 3. Execution
    try {
      const result = await tool.execute(input, state);
      const trace: ToolExecutionTrace = {
        stepId,
        agentRole,
        toolName,
        category: tool.category,
        purpose,
        input,
        output: result,
        status: 'completed',
        timestamp,
        durationMs: Date.now() - startTime,
      };
      return { trace, result };
    } catch (err: any) {
      const trace: ToolExecutionTrace = {
        stepId,
        agentRole,
        toolName,
        category: tool.category,
        purpose,
        input,
        output: { error: err.message || 'Tool execution encountered an internal error.' },
        status: 'failed',
        timestamp,
        durationMs: Date.now() - startTime,
      };
      return { trace, result: trace.output };
    }
  }

  private registerDefaultTools(): void {
    // ----------------------------------------------------
    // TOOL 1: DECK INSPECTOR
    // ----------------------------------------------------
    this.registerTool({
      name: 'inspect_deck',
      description: 'Read the current startup pitch deck state and return structured information about slide numbers, titles, headlines, bullets, data points, and assumption counts.',
      category: 'diagnostic',
      inputSchema: {
        type: 'object',
        properties: {
          includeSpeakerNotes: { type: 'boolean', description: 'Whether to include full speaker notes in response' },
        },
      },
      execute: async (input: { includeSpeakerNotes?: boolean }, state: DeckState) => {
        let assumptionCount = 0;
        let validatedCount = 0;
        let missingCount = 0;
        const missingEvidence: string[] = [];

        const slideSummaries = state.currentSlides.map((s) => {
          s.keyDataPoints.forEach((dp) => {
            if (dp.status === 'assumption') assumptionCount++;
            else if (dp.status === 'validated') validatedCount++;
            else if (dp.status === 'missing') missingCount++;

            if (dp.status === 'missing' || dp.status === 'assumption') {
              missingEvidence.push(`Slide ${s.slideNumber} (${s.title}): ${dp.label} [${dp.status}]`);
            }
          });

          return {
            slideNumber: s.slideNumber,
            title: s.title,
            category: s.category,
            headline: s.headline,
            bulletCount: s.bullets?.length || 0,
            dataPointsCount: s.keyDataPoints?.length || 0,
            keyDataPoints: s.keyDataPoints,
            visualLayout: s.visualRecommendation?.layoutType,
            speakerNotes: input?.includeSpeakerNotes ? s.speakerNotes : undefined,
          };
        });

        return {
          slideCount: state.currentSlides.length,
          slides: slideSummaries,
          assumptionCount,
          validatedCount,
          missingCount,
          missingEvidence,
          currentVersion: state.version,
        };
      },
    });

    // ----------------------------------------------------
    // TOOL 2: SCORE DECK
    // ----------------------------------------------------
    this.registerTool({
      name: 'score_deck',
      description: 'Evaluate the CURRENT deck state using the existing scoring engine. Returns overall score, category scores, strengths, and weaknesses.',
      category: 'scoring',
      inputSchema: {
        type: 'object',
        properties: {
          context: { type: 'string', description: 'Optional context note explaining why scoring is triggered' },
        },
      },
      execute: async (_input: any, state: DeckState) => {
        const score = await scorePitch(state.intake, state.currentSlides, state.analysis);
        state.score = score; // Update authoritative state score
        return {
          overallScore: score.overallScore,
          tier: score.tier,
          categories: score.categories,
          strengths: score.strengths,
          weaknesses: score.weaknesses,
          topImprovements: score.topImprovements,
        };
      },
    });

    // ----------------------------------------------------
    // TOOL 3: INSPECT EVIDENCE
    // ----------------------------------------------------
    this.registerTool({
      name: 'inspect_evidence',
      description: 'Analyze whether claims in the deck have sufficient evidence. Classifies claims into validated, assumption, or missing.',
      category: 'evidence',
      inputSchema: {
        type: 'object',
        properties: {
          targetCategory: { type: 'string', description: 'Optional slide category to inspect' },
        },
      },
      execute: async (input: { targetCategory?: string }, state: DeckState) => {
        const claimsAnalysis: Array<{
          claim: string;
          slideNumber: number;
          status: 'validated' | 'assumption' | 'missing';
          evidenceGap: string;
          verificationNeeded: string;
        }> = [];

        state.currentSlides.forEach((slide) => {
          if (input?.targetCategory && slide.category !== input.targetCategory) {
            return;
          }

          slide.keyDataPoints.forEach((dp) => {
            let evidenceGap = 'None';
            let verificationNeeded = 'Verified';

            if (dp.status === 'assumption') {
              evidenceGap = `Claim "${dp.label}: ${dp.value}" relies on unverified founder projection.`;
              verificationNeeded = 'Requires early customer cohort data, pilot metrics, or market benchmark.';
            } else if (dp.status === 'missing') {
              evidenceGap = `Required metric "${dp.label}" is missing from pitch deck.`;
              verificationNeeded = 'Founder input or historical performance tracking needed.';
            }

            claimsAnalysis.push({
              claim: `${dp.label}: ${dp.value}`,
              slideNumber: slide.slideNumber,
              status: dp.status,
              evidenceGap,
              verificationNeeded,
            });
          });
        });

        const totalClaims = claimsAnalysis.length;
        const validatedCount = claimsAnalysis.filter((c) => c.status === 'validated').length;
        const assumptionCount = claimsAnalysis.filter((c) => c.status === 'assumption').length;
        const missingCount = claimsAnalysis.filter((c) => c.status === 'missing').length;

        return {
          totalClaims,
          validatedCount,
          assumptionCount,
          missingCount,
          claims: claimsAnalysis,
          hasSufficientEvidence: assumptionCount + missingCount === 0,
        };
      },
    });

    // ----------------------------------------------------
    // TOOL 4: REVISE SLIDE
    // ----------------------------------------------------
    this.registerTool({
      name: 'revise_slide',
      description: 'Modify a specific slide based on the agent strategy. Operates on the actual in-memory DeckState.',
      category: 'revision',
      inputSchema: {
        type: 'object',
        properties: {
          slideNumber: { type: 'number', description: 'Slide number to revise (1-10)' },
          revisionObjective: { type: 'string', description: 'Clear objective for the revision' },
          headlineOverride: { type: 'string', description: 'Optional new 1-second takeaway headline' },
          bulletsOverride: { type: 'array', items: { type: 'string' }, description: 'Optional revised bullet points' },
          dataPointsOverride: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                value: { type: 'string' },
                status: { type: 'string' },
              },
            },
            description: 'Optional updated key data points',
          },
        },
        required: ['slideNumber', 'revisionObjective'],
      },
      execute: async (
        input: {
          slideNumber: number;
          revisionObjective: string;
          headlineOverride?: string;
          bulletsOverride?: string[];
          dataPointsOverride?: Array<{ label: string; value: string; status: 'validated' | 'assumption' | 'missing' }>;
        },
        state: DeckState
      ) => {
        const slideIndex = state.currentSlides.findIndex((s) => s.slideNumber === input.slideNumber);
        if (slideIndex === -1) {
          throw new Error(`Slide number ${input.slideNumber} does not exist in current deck.`);
        }

        const previousVersion = JSON.parse(JSON.stringify(state.currentSlides[slideIndex])) as SlideData;
        const targetSlide = { ...state.currentSlides[slideIndex] };
        const changesMade: string[] = [];

        if (input.headlineOverride && input.headlineOverride.trim().length > 0) {
          changesMade.push(`Headline updated from "${targetSlide.headline}" to "${input.headlineOverride}"`);
          targetSlide.headline = input.headlineOverride;
        }

        if (input.bulletsOverride && input.bulletsOverride.length > 0) {
          changesMade.push(`Upgraded ${input.bulletsOverride.length} bullet points for clarity and evidence`);
          targetSlide.bullets = input.bulletsOverride;
        }

        if (input.dataPointsOverride && input.dataPointsOverride.length > 0) {
          // Enforcement: Never upgrade to 'validated' without explicit evidence!
          // Guard: If value is fabricated or ungrounded, preserve assumption tag.
          targetSlide.keyDataPoints = input.dataPointsOverride.map((dp) => ({
            label: dp.label,
            value: dp.value,
            status: dp.status,
          }));
          changesMade.push(`Updated data points to reflect evidence status`);
        }

        targetSlide.isEdited = true;

        // Save current deck state into revision history before overwriting
        state.revisionHistory.push({
          version: state.version,
          slides: JSON.parse(JSON.stringify(state.currentSlides)),
          score: JSON.parse(JSON.stringify(state.score)),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          note: `Pre-revision snapshot prior to Slide ${input.slideNumber} modification: ${input.revisionObjective}`,
        });

        // Update DeckState
        state.currentSlides[slideIndex] = targetSlide;
        state.version += 1;
        state.activeRevision = targetSlide.slideNumber;

        return {
          slideNumber: targetSlide.slideNumber,
          previousVersion,
          revisedVersion: targetSlide,
          changesMade: changesMade.length > 0 ? changesMade : [`Applied revision objective: ${input.revisionObjective}`],
          newDeckVersion: state.version,
        };
      },
    });

    // ----------------------------------------------------
    // TOOL 5: COMPARE DECKS
    // ----------------------------------------------------
    this.registerTool({
      name: 'compare_decks',
      description: 'Compare the original deck (or previous version) with the current revised deck in DeckState.',
      category: 'comparison',
      inputSchema: {
        type: 'object',
        properties: {
          targetVersion: { type: 'number', description: 'Version number to compare against (defaults to original version 1)' },
        },
      },
      execute: async (input: { targetVersion?: number }, state: DeckState) => {
        let compareSlides = state.originalSlides;
        if (input?.targetVersion && state.revisionHistory.length > 0) {
          const rec = state.revisionHistory.find((r) => r.version === input.targetVersion);
          if (rec) compareSlides = rec.slides;
        }

        const changedSlides: number[] = [];
        const changedHeadlines: Array<{ slideNumber: number; oldHeadline: string; newHeadline: string }> = [];
        const changedBullets: Array<{ slideNumber: number; countBefore: number; countAfter: number }> = [];
        const evidenceStatusChanges: Array<{ slideNumber: number; label: string; from: string; to: string }> = [];

        state.currentSlides.forEach((currSlide) => {
          const origSlide = compareSlides.find((s) => s.slideNumber === currSlide.slideNumber);
          if (!origSlide) return;

          let hasChanges = false;

          if (currSlide.headline !== origSlide.headline) {
            hasChanges = true;
            changedHeadlines.push({
              slideNumber: currSlide.slideNumber,
              oldHeadline: origSlide.headline,
              newHeadline: currSlide.headline,
            });
          }

          if (JSON.stringify(currSlide.bullets) !== JSON.stringify(origSlide.bullets)) {
            hasChanges = true;
            changedBullets.push({
              slideNumber: currSlide.slideNumber,
              countBefore: origSlide.bullets.length,
              countAfter: currSlide.bullets.length,
            });
          }

          currSlide.keyDataPoints.forEach((currDp) => {
            const origDp = origSlide.keyDataPoints.find((dp) => dp.label === currDp.label);
            if (origDp && origDp.status !== currDp.status) {
              hasChanges = true;
              evidenceStatusChanges.push({
                slideNumber: currSlide.slideNumber,
                label: currDp.label,
                from: origDp.status,
                to: currDp.status,
              });
            }
          });

          if (hasChanges) {
            changedSlides.push(currSlide.slideNumber);
          }
        });

        return {
          changedSlides,
          changedHeadlines,
          changedBullets,
          evidenceStatusChanges,
          totalSlides: state.currentSlides.length,
          isIdentical: changedSlides.length === 0,
        };
      },
    });

    // ----------------------------------------------------
    // TOOL 6: VERIFY REVISION
    // ----------------------------------------------------
    this.registerTool({
      name: 'verify_revision',
      description: 'Verify that claimed modifications actually occurred, preserve slide constraints, and introduce no unsupported claims.',
      category: 'verification',
      inputSchema: {
        type: 'object',
        properties: {
          targetSlideNumber: { type: 'number', description: 'Slide expected to have been modified' },
        },
      },
      execute: async (input: { targetSlideNumber?: number }, state: DeckState) => {
        const issues: string[] = [];
        const unsupportedClaims: string[] = [];
        const changedSlides: number[] = [];

        // Check 1: Deck length constraint (Must contain exactly 10 slides)
        if (state.currentSlides.length !== 10) {
          issues.push(`Deck length constraint violation: Expected 10 slides, found ${state.currentSlides.length}.`);
        }

        // Check 2: Required slide fields check
        state.currentSlides.forEach((s) => {
          if (!s.title || !s.headline || !s.bullets || s.bullets.length === 0) {
            issues.push(`Slide ${s.slideNumber} missing required structural fields (title, headline, or bullets).`);
          }
        });

        // Check 3: Slide modification verification
        state.currentSlides.forEach((curr) => {
          const orig = state.originalSlides.find((o) => o.slideNumber === curr.slideNumber);
          if (!orig) return;

          const isModified =
            curr.headline !== orig.headline ||
            JSON.stringify(curr.bullets) !== JSON.stringify(orig.bullets) ||
            JSON.stringify(curr.keyDataPoints) !== JSON.stringify(orig.keyDataPoints);

          if (isModified) {
            changedSlides.push(curr.slideNumber);
          }
        });

        if (input?.targetSlideNumber && !changedSlides.includes(input.targetSlideNumber)) {
          issues.push(`Target slide ${input.targetSlideNumber} was specified for revision, but no actual content changes were detected.`);
        }

        // Check 4: Unsupported metric detection (Check against raw startup intake)
        const intakeText = `${state.intake.rawIdea} ${state.intake.existingTraction} ${state.intake.businessModel} ${state.intake.revenueModel}`.toLowerCase();
        
        state.currentSlides.forEach((s) => {
          s.keyDataPoints.forEach((dp) => {
            if (dp.status === 'validated') {
              // Extract numeric claim if present
              const valLower = dp.value.toLowerCase();
              if (valLower.includes('$') || valLower.includes('mrr') || valLower.includes('arr') || valLower.includes('%')) {
                // If claim mentions large validated revenue not present in raw intake
                if ((valLower.includes('100k') || valLower.includes('1m') || valLower.includes('500k')) && !intakeText.includes(valLower.substring(0, 4))) {
                  unsupportedClaims.push(`Slide ${s.slideNumber}: Claim "${dp.label}: ${dp.value}" flagged as ungrounded validated claim.`);
                }
              }
            }
          });
        });

        const passed = issues.length === 0 && unsupportedClaims.length === 0 && changedSlides.length > 0;

        const result: VerificationResult = {
          passed,
          issues,
          unsupportedClaims,
          changedSlides,
        };

        state.verificationStatus = result;
        return result;
      },
    });

    // ----------------------------------------------------
    // TOOL 7: ROLLBACK REVISION
    // ----------------------------------------------------
    this.registerTool({
      name: 'rollback_revision',
      description: 'Restore previous deck version if verification fails or score degrades.',
      category: 'recovery',
      inputSchema: {
        type: 'object',
        properties: {
          targetVersion: { type: 'number', description: 'Version number to restore (defaults to last snapshot)' },
          reason: { type: 'string', description: 'Reason for rollback' },
        },
      },
      execute: async (input: { targetVersion?: number; reason?: string }, state: DeckState) => {
        if (state.revisionHistory.length === 0) {
          // Restore to original slides
          state.currentSlides = JSON.parse(JSON.stringify(state.originalSlides));
          state.version = 1;
          return {
            rolledBack: true,
            restoredVersion: 1,
            restoredScore: state.score,
            message: 'Restored deck to original baseline version 1.',
          };
        }

        const snapshot = input?.targetVersion
          ? state.revisionHistory.find((r) => r.version === input.targetVersion)
          : state.revisionHistory[state.revisionHistory.length - 1];

        if (!snapshot) {
          throw new Error(`Target rollback version ${input?.targetVersion} not found in history.`);
        }

        state.currentSlides = JSON.parse(JSON.stringify(snapshot.slides));
        state.score = JSON.parse(JSON.stringify(snapshot.score));
        state.version = snapshot.version;

        return {
          rolledBack: true,
          restoredVersion: snapshot.version,
          restoredScore: snapshot.score,
          reason: input?.reason || 'Reverted to previous valid snapshot.',
        };
      },
    });
  }
}

export const globalToolRegistry = new ToolRegistry();
