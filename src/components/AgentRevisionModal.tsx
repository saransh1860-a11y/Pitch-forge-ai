import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Layers,
  Cpu,
  ShieldCheck,
  Zap,
  Target,
  FileText,
  Download,
  X,
  Clock,
  Terminal,
  ChevronRight,
  Award,
  BarChart3,
  Bot,
} from 'lucide-react';
import { AutonomousImprovementResult, PitchProject, SlideData } from '../types/pitch';

interface AgentRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRunning: boolean;
  result: AutonomousImprovementResult | null;
  project: PitchProject;
  onOpenBeforeAfter: () => void;
  onOpenStudio: () => void;
  onOpenScore: () => void;
  onOpenExport: () => void;
}

interface AgentPipelineStep {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
}

const AGENT_PIPELINE: AgentPipelineStep[] = [
  {
    id: 'agent-1',
    name: 'Investment Committee Diagnostic Agent',
    role: 'Pillar Diagnostics & Bottleneck Audit',
    description: 'Audits all 10 slides against the 8-pillar institutional rubric, identifying the single weakest scoring bottleneck.',
    icon: ShieldCheck,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
  },
  {
    id: 'agent-2',
    name: 'VC Deal Partner Strategy Agent',
    role: 'Surgical Revision Thesis & Slide Targeting',
    description: 'Formulates the exact tactical plan, anticipates LP due-diligence pushback, and selects target slides.',
    icon: Target,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  {
    id: 'agent-3',
    name: 'Executive Pitch Crafting Agent',
    role: 'Narrative & Evidence Synthesis',
    description: 'Selectively rewrites target slide headlines for 1-second clarity, upgrades bullet points, and grounds assumptions in proof.',
    icon: Sparkles,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
  },
  {
    id: 'agent-4',
    name: 'Blind Institutional Re-Scoring Agent',
    role: 'Unbiased Quality & Metric Evaluation',
    description: 'Re-evaluates the revised 10-slide deck across all 8 dimensions to calculate the exact delta in score points.',
    icon: BarChart3,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
  },
  {
    id: 'agent-5',
    name: 'Managing Director Decision Agent',
    role: 'Consensus Decision & Version Finalization',
    description: 'Issues updated VC partner consensus (Term Sheet / Partner Meeting), validates positive gain, and commits to history.',
    icon: Award,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
];

export const AgentRevisionModal: React.FC<AgentRevisionModalProps> = ({
  isOpen,
  onClose,
  isRunning,
  result,
  project,
  onOpenBeforeAfter,
  onOpenStudio,
  onOpenScore,
  onOpenExport,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [liveLogs, setLiveLogs] = useState<string[]>([]);

  // Simulation timer during async processing
  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setLiveLogs([]);
      return;
    }

    if (isRunning && !result) {
      setCurrentStepIndex(0);
      setLiveLogs([
        `[${new Date().toLocaleTimeString()}] Initializing Autonomous Multi-Agent Revision Loop...`,
        `[${new Date().toLocaleTimeString()}] Agent 1 (Diagnostic): Ingesting 10-slide deck "${project.name || 'Startup Pitch'}"`,
      ]);

      const t1 = setTimeout(() => {
        setCurrentStepIndex(1);
        setLiveLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Agent 1: Weakest dimension detected in institutional rubric.`,
          `[${new Date().toLocaleTimeString()}] Agent 2 (Strategy Partner): Formulating selective improvement plan & defense thesis...`,
        ]);
      }, 2400);

      const t2 = setTimeout(() => {
        setCurrentStepIndex(2);
        setLiveLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Agent 2: Identified high-leverage target slides.`,
          `[${new Date().toLocaleTimeString()}] Agent 3 (Pitch Crafter): Rewriting headlines for 1-second executive clarity & adding evidence...`,
        ]);
      }, 5200);

      const t3 = setTimeout(() => {
        setCurrentStepIndex(3);
        setLiveLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Agent 3: Surgical slide rewrites synthesized.`,
          `[${new Date().toLocaleTimeString()}] Agent 4 (Re-Scorer): Subjecting updated deck to blind 8-pillar institutional scoring...`,
        ]);
      }, 8200);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else if (result) {
      setCurrentStepIndex(4);
      setLiveLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Agent 4: Blind Re-scoring complete: ${result.previousScore?.overallScore || 70} → ${result.newScore?.overallScore || 82} (${result.scoreDifference >= 0 ? `+${result.scoreDifference}` : result.scoreDifference} pts).`,
        `[${new Date().toLocaleTimeString()}] Agent 5 (Managing Director): Revision ${result.revisionAccepted ? 'ACCEPTED' : 'REJECTED'}. Version history updated.`,
      ]);
    }
  }, [isOpen, isRunning, result, project]);

  if (!isOpen) return null;

  const isComplete = Boolean(result) && !isRunning;
  const activeStep = AGENT_PIPELINE[currentStepIndex] || AGENT_PIPELINE[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-amber-500/40 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 p-5 sm:p-7 shadow-2xl space-y-6 my-auto text-zinc-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-inner">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  Autonomous Multi-Agent Pitch Revision
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {isComplete ? 'Execution Complete' : 'Active Multi-Agent Loop'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Real-time visibility into the 5 specialized AI investor & narrative agents
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isRunning}
            className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Multi-Agent Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-zinc-400">Pipeline Execution Progress</span>
            <span className="text-amber-400 font-mono">
              {isComplete ? '100% (Completed)' : `${Math.round(((currentStepIndex + 1) / AGENT_PIPELINE.length) * 100)}%`}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800/80 p-0.5 border border-zinc-700/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400 transition-all duration-500"
              style={{
                width: isComplete ? '100%' : `${Math.max(15, ((currentStepIndex + 1) / AGENT_PIPELINE.length) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* 5-Agent Step Visualizer */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          {AGENT_PIPELINE.map((agent, index) => {
            const isStepDone = isComplete || index < currentStepIndex;
            const isStepActive = !isComplete && index === currentStepIndex;
            const Icon = agent.icon;

            return (
              <div
                key={agent.id}
                className={`relative flex flex-col justify-between rounded-xl border p-3 transition-all ${
                  isStepActive
                    ? `${agent.bgColor} ${agent.borderColor} shadow-lg shadow-amber-500/10 scale-[1.02]`
                    : isStepDone
                    ? 'border-emerald-500/30 bg-emerald-950/20 text-zinc-300'
                    : 'border-zinc-800/60 bg-zinc-900/30 text-zinc-500 opacity-60'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                        isStepActive ? 'bg-amber-500/30 text-amber-300' : isStepDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {isStepDone ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : isStepActive ? (
                        <Zap className="h-4 w-4 text-amber-400 animate-spin" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">0{index + 1}</span>
                  </div>

                  <h4 className="text-xs font-bold leading-tight text-white line-clamp-1">{agent.name.replace(' Agent', '')}</h4>
                  <p className="text-[10px] text-zinc-400 line-clamp-2 leading-tight">{agent.role}</p>
                </div>

                <div className="mt-2 pt-1 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-medium">
                  <span
                    className={
                      isStepDone
                        ? 'text-emerald-400 font-bold'
                        : isStepActive
                        ? 'text-amber-400 font-bold animate-pulse'
                        : 'text-zinc-500'
                    }
                  >
                    {isStepDone ? 'Completed' : isStepActive ? 'Working...' : 'Queued'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Agent Working Focus Box / Final Results Box */}
        {isComplete && result ? (
          <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 via-zinc-900/90 to-zinc-950 p-5 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Revision Outcome & Score Delta</h3>
                  <p className="text-xs text-zinc-300">
                    {result.outcomeReason}
                  </p>
                </div>
              </div>

              {/* Score Progression Badge */}
              <div className="flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Baseline</span>
                  <span className="text-sm font-black text-zinc-300">{result.previousScore.overallScore}/100</span>
                </div>
                <ArrowRight className="h-4 w-4 text-amber-400 mx-1" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block">Revised</span>
                  <span className="text-sm font-black text-emerald-400">{result.newScore.overallScore}/100</span>
                </div>
                <span
                  className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-black border ${
                    result.scoreDifference > 0
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : result.scoreDifference === 0
                      ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {result.scoreDifference > 0
                    ? `+${result.scoreDifference} PTS`
                    : result.scoreDifference === 0
                    ? '0 PTS (UNCHANGED)'
                    : `${result.scoreDifference} PTS`}
                </span>
              </div>
            </div>

            {/* Targeted Slides & Plan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3 space-y-1.5">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  Diagnosis & Target Slides
                </span>
                <p className="text-zinc-200">
                  <span className="font-semibold text-white">Bottleneck:</span> {result.decisionPlan?.detectedProblem || 'Narrative & Traction Rigor'}
                </p>
                <p className="text-zinc-300">
                  <span className="font-semibold text-white">Targeted Slide(s):</span>{' '}
                  <span className="text-amber-300 font-mono font-bold">
                    Slide {result.changedSlideNumbers.join(', ')}
                  </span>
                </p>
                {result.decisionPlan?.slideSelectionReason && (
                  <p className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/60">
                    {result.decisionPlan.slideSelectionReason}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3 space-y-1.5">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                  Modifications Applied
                </span>
                <ul className="space-y-1 text-zinc-300">
                  {result.whatChanged.slice(0, 3).map((change, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span className="line-clamp-2">{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 animate-pulse">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-amber-300">
                  Active Agent Working: {activeStep.name}
                </h4>
                <p className="text-xs text-zinc-300">
                  {activeStep.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Live Terminal / Execution Stream Logs */}
        <div className="rounded-xl border border-zinc-800 bg-black/80 p-3.5 space-y-2 font-mono text-[11px]">
          <div className="flex items-center justify-between text-zinc-400 pb-1 border-b border-zinc-800/80">
            <span className="flex items-center gap-1.5 text-zinc-300 font-semibold">
              <Terminal className="h-3.5 w-3.5 text-amber-400" />
              Agent Telemetry & Decision Stream
            </span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              LIVE
            </span>
          </div>

          <div className="space-y-1 text-zinc-300 max-h-28 overflow-y-auto pr-1">
            {liveLogs.map((log, index) => (
              <div key={index} className="leading-relaxed flex items-start gap-2">
                <span className="text-zinc-600 select-none">&gt;</span>
                <span className={index === liveLogs.length - 1 ? 'text-amber-300 font-medium' : 'text-zinc-400'}>
                  {log}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800">
          <button
            onClick={onClose}
            disabled={isRunning}
            className="text-xs text-zinc-400 hover:text-white transition-colors disabled:opacity-30 cursor-pointer"
          >
            {isComplete ? 'Dismiss' : 'Minimize Execution'}
          </button>

          <div className="flex flex-wrap items-center gap-2.5">
            {isComplete && (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onOpenBeforeAfter();
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer active:scale-95"
                >
                  <Layers className="h-3.5 w-3.5 text-amber-400" />
                  <span>Compare Before/After</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenExport();
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-3.5 py-2 text-xs font-bold text-emerald-300 transition-colors cursor-pointer active:scale-95"
                >
                  <Download className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Download Revised Deck</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenStudio();
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 px-4 py-2 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
                >
                  <FileText className="h-3.5 w-3.5 text-zinc-950" />
                  <span>Review in Studio</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
