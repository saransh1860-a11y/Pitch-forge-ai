export interface StartupIntake {
  id?: string;
  startupName: string;
  tagline?: string;
  rawIdea: string;
  problem: string;
  targetCustomer: string;
  solution: string;
  businessModel: string;
  stage: 'Idea' | 'Prototype' | 'MVP / Beta' | 'Early Revenue' | 'Growth';
  geography: string;
  existingTraction: string;
  competitors: string;
  competitiveAdvantage: string;
  revenueModel: string;
  teamInfo: string;
  additionalContext: string;
}

export interface AssumptionItem {
  claim: string;
  type: 'assumption' | 'validated' | 'missing';
  recommendation: string;
}

export interface StartupAnalysis {
  coreProblem: string;
  targetCustomer: string;
  valueProposition: string;
  businessModel: string;
  marketOpportunity: {
    tamEstimate?: string;
    samEstimate?: string;
    somEstimate?: string;
    marketDynamics: string;
    isAssumption: boolean;
  };
  competitionSummary: string;
  differentiation: string;
  criticalRisks: string[];
  missingInformation: string[];
  assumptionsRequiringValidation: string[];
  strategicAdvice: string[];
}

export interface SlideData {
  id: number;
  slideNumber: number;
  title: string;
  category: 'vision' | 'problem' | 'solution' | 'market' | 'product' | 'business_model' | 'competition' | 'traction' | 'gtm' | 'team_ask';
  headline: string; // 1-second investor takeaway
  bullets: string[];
  visualRecommendation: {
    layoutType: 'split-2-col' | 'metrics-grid' | 'step-flow' | 'comparison-matrix' | 'tam-sam-som' | 'team-cards' | 'hero-quote';
    description: string;
    mockupVisualPrompt?: string;
  };
  keyDataPoints: {
    label: string;
    value: string;
    status: 'validated' | 'assumption' | 'missing';
  }[];
  speakerNotes: string;
  evidenceRequirements: string[];
  isEdited?: boolean;
}

export interface CategoryScore {
  name: string;
  score: number;
  maxScore: number;
  feedback: string;
}

export interface PitchScore {
  overallScore: number;
  tier: 'Needs Validation' | 'Pre-Seed Ready' | 'Seed Ready' | 'Series A Contender';
  categories: {
    problemClarity: CategoryScore; // 15
    solutionClarity: CategoryScore; // 15
    marketOpportunity: CategoryScore; // 15
    businessModel: CategoryScore; // 10
    differentiation: CategoryScore; // 15
    tractionValidation: CategoryScore; // 10
    goToMarket: CategoryScore; // 10
    storytellingCoherence: CategoryScore; // 10
  };
  strengths: string[];
  weaknesses: string[];
  topImprovements: string[];
}

export interface InvestorCritique {
  understoodIn60Seconds: 'yes' | 'moderate' | 'no';
  sixtySecondVerdict: string;
  strongestPart: string;
  weakestPart: string;
  biggestUnansweredQuestion: string;
  biggestInvestmentRisk: string;
  mostImportantImprovement: string;
  suggestedRevisionPlan: string[];
}

export interface InvestorDecision {
  decision: 'INVEST' | 'WATCHLIST' | 'PASS';
  confidenceLevel: number; // 0-100%
  strongestSignal: string;
  biggestRisk: string;
  singleMostImportantWeakness: string;
  weakestScoringDimension: string;
  responsibleSlideNumbers: number[];
  slideSelectionReason?: string;
  evidenceGap?: string;
  expectedImprovementTarget?: string;
  evidenceOrChangeNeeded?: string;
  recommendedNextAction?: string;
  bottleneckAnalysis?: string;
}

export interface AgentImprovementPlan {
  detectedProblem: string;
  whyInvestorCares: string;
  selectedSlideNumbers: number[];
  slideSelectionReason?: string;
  intendedChanges: string[];
  expectedScoringImpact?: string;
  expectedOutcome?: string;
}

export interface AgentTraceStep {
  id: string;
  timestamp: string;
  title: string;
  status: 'completed' | 'in_progress' | 'pending' | 'rejected' | 'failed';
  detail: string;
  badge?: string;
  slideNumbers?: number[];
}

export interface AutonomousImprovementResult {
  previousScore: PitchScore;
  newScore: PitchScore;
  previousDecision?: InvestorDecision;
  newDecision?: InvestorDecision;
  decisionPlan: AgentImprovementPlan;
  improvedSlides: SlideData[];
  changedSlideNumbers: number[];
  whatChanged: string[];
  revisionAccepted: boolean;
  scoreDifference: number;
  outcomeReason: string;
  traceSteps: AgentTraceStep[];
}

export interface InvestorChallenge {
  questionId: string;
  title?: string;
  question: string;
  context: string;
  category: string;
  suggestedEvidenceTypes: string[];
  status?: 'pending' | 'resolved';
  founderResponse?: string;
  resolutionSummary?: string;
}

export interface ChallengeResolutionResult {
  founderAnswer: string;
  evaluation: string;
  updatedSlides: SlideData[];
  changedSlideNumbers: number[];
  previousScore: PitchScore;
  newScore: PitchScore;
  scoreDifference: number;
  newDecision?: InvestorDecision;
  explanation: string;
}

export interface PitchVersion {
  versionId: string;
  versionNumber: number;
  createdAt: string;
  note: string;
  slides: SlideData[];
  score?: PitchScore;
  decision?: InvestorDecision;
  critique?: InvestorCritique;
  analysis?: StartupAnalysis;
  changedSlideNumbers?: number[];
  whatChanged?: string[];
}

export interface PitchProject {
  id: string;
  createdAt: string;
  updatedAt: string;
  intake: StartupIntake;
  analysis?: StartupAnalysis;
  slides: SlideData[];
  currentVersion: number;
  versions: PitchVersion[];
  score?: PitchScore;
  decision?: InvestorDecision;
  critique?: InvestorCritique;
  lastAgentResult?: AutonomousImprovementResult;
  lastChallenge?: InvestorChallenge;
  status: 'draft' | 'analyzed' | 'generated' | 'critiqued' | 'refined';
}

export type AppWorkflowStep = 
  | 'raw_idea'
  | 'analysis'
  | 'structure'
  | 'pitch_view'
  | 'critique'
  | 'refinement'
  | 'final';

