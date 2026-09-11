import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu,
  ShieldCheck,
  Zap,
  Target,
  FileText,
  Download,
} from 'lucide-react';
import { AutonomousImprovementResult, AgentTraceStep } from '../types/pitch';

interface InvestorAgentTraceProps {
  result?: AutonomousImprovementResult;
  isLoading?: boolean;
  onOpenBeforeAfter?: () => void;
  onOpenStudio?: () => void;
  onOpenExport?: () => void;
}

export const InvestorAgentTrace: React.FC<InvestorAgentTraceProps> = ({
  result,
  isLoading = false,
  onOpenBeforeAfter,
  onOpenStudio,
  onOpenExport,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!result && !isLoading) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-zinc-950 via-zinc-900/90 to-zinc-950 p-5 sm:p-6 shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Investor Agent Execution Trace</h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                CLOSED-LOOP
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Autonomous loop: INGEST → EVALUATE → DECIDE → REVISE → RE-EVALUATE
            </p>
          </div>
        </div>

        {/* Score Impact Pill & Actions */}
        <div className="flex items-center gap-3">
          {result && (
            <div className="flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-1.5">
              <span className="text-xs text-zinc-400 font-medium">Outcome:</span>
              <span className="text-xs font-black text-zinc-300">
                {result.previousScore.overallScore}
              </span>
              <ArrowRight className="h-3 w-3 text-zinc-500" />
              <span className={`text-xs font-black ${result.scoreDifference >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {result.newScore.overallScore}
              </span>
              <span
                className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                  result.revisionAccepted
                    ? result.scoreDifference > 0
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-zinc-700/50 text-zinc-300'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {result.revisionAccepted
                  ? result.scoreDifference > 0
                    ? `+${result.scoreDifference} PTS (ACCEPTED)`
                    : 'UNCHANGED'
                  : 'REVISION REJECTED'}
              </span>
            </div>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
              <Zap className="h-5 w-5 animate-spin text-amber-400" />
              <div className="text-xs">
                <span className="font-bold block">Autonomous Agent Running</span>
                <span className="text-zinc-400">
                  Evaluating bottleneck, selecting target slides, planning selective revisions, and re-scoring...
                </span>
              </div>
            </div>
          )}

          {/* Trace Steps Timeline */}
          {result?.traceSteps && (
            <div className="space-y-2.5">
              {result.traceSteps.map((step, idx) => {
                const isCompleted = step.status === 'completed';
                const isRejected = step.status === 'rejected';
                const isInProgress = step.status === 'in_progress';

                return (
                  <div
                    key={step.id || idx}
                    className={`flex items-start gap-3 rounded-xl border p-3.5 text-xs transition-all ${
                      isCompleted
                        ? 'border-zinc-800/80 bg-zinc-900/60 text-zinc-200'
                        : isRejected
                        ? 'border-rose-500/30 bg-rose-500/5 text-rose-200'
                        : isInProgress
                        ? 'border-amber-500/40 bg-amber-500/10 text-amber-200 animate-pulse'
                        : 'border-zinc-800/40 bg-zinc-900/20 text-zinc-500'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : isRejected ? (
                        <AlertCircle className="h-4 w-4 text-rose-400" />
                      ) : isInProgress ? (
                        <Zap className="h-4 w-4 text-amber-400 animate-spin" />
                      ) : (
                        <Clock className="h-4 w-4 text-zinc-600" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white">{step.title}</span>
                          {step.toolName && (
                            <span className="rounded bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300">
                              TOOL: {step.toolName}
                            </span>
                          )}
                          {step.agentRole && (
                            <span className="rounded bg-zinc-800 border border-zinc-700 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                              {step.agentRole}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {step.badge && (
                            <span className="rounded bg-zinc-800 border border-zinc-700 px-2 py-0.5 text-[10px] font-extrabold text-amber-300">
                              {step.badge}
                            </span>
                          )}
                          {step.durationMs !== undefined && (
                            <span className="text-[10px] font-mono text-zinc-500">
                              {step.durationMs}ms
                            </span>
                          )}
                          <span className="text-[10px] text-zinc-500">{step.timestamp}</span>
                        </div>
                      </div>

                      <p className="text-zinc-300 leading-relaxed">{step.detail}</p>

                      {(step.inputSummary || step.outputSummary) && (
                        <div className="mt-1.5 pt-1.5 border-t border-zinc-800/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono bg-zinc-950/40 p-2 rounded-lg">
                          {step.inputSummary && (
                            <div className="text-zinc-400 truncate">
                              <span className="text-amber-400/80 font-bold">IN:</span> {step.inputSummary}
                            </div>
                          )}
                          {step.outputSummary && (
                            <div className="text-zinc-300 truncate">
                              <span className="text-emerald-400/80 font-bold">OUT:</span> {step.outputSummary}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tool Activity & Registry Summary Panel */}
          {result && (
            <div className="rounded-xl border border-amber-500/30 bg-zinc-900/80 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-amber-400" /> Tool Registry & Interaction Summary
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">
                  Real Backend Tool Execution
                </span>
              </div>

              {/* Tool Execution Checklist */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  'inspect_deck',
                  'score_deck',
                  'inspect_evidence',
                  'revise_slide',
                  'compare_decks',
                  'verify_revision',
                  'rollback_revision',
                ].map((toolName) => {
                  const usedCount = result.toolsUsedSummary?.[toolName] || 0;
                  const isUsed = usedCount > 0;
                  return (
                    <div
                      key={toolName}
                      className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 font-mono text-[11px] ${
                        isUsed
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                          : 'border-zinc-800/60 bg-zinc-950/30 text-zinc-600'
                      }`}
                    >
                      <span className="truncate">{toolName}</span>
                      <span className="font-extrabold ml-1">
                        {isUsed ? `✓ (${usedCount})` : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Execution Metrics Bar */}
              {result.toolActivityStats && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-center font-mono">
                  <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-2">
                    <span className="block text-[10px] text-zinc-500 uppercase">Decisions</span>
                    <span className="text-xs font-black text-amber-400">{result.toolActivityStats.totalDecisions}</span>
                  </div>
                  <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-2">
                    <span className="block text-[10px] text-zinc-500 uppercase">Tool Calls</span>
                    <span className="text-xs font-black text-amber-400">{result.toolActivityStats.toolCallsCount}</span>
                  </div>
                  <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-2">
                    <span className="block text-[10px] text-zinc-500 uppercase">Slides Modified</span>
                    <span className="text-xs font-black text-amber-400">{result.toolActivityStats.slidesModifiedCount}</span>
                  </div>
                  <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-2">
                    <span className="block text-[10px] text-zinc-500 uppercase">Verifications</span>
                    <span className="text-xs font-black text-emerald-400">{result.toolActivityStats.verificationsCount}</span>
                  </div>
                  <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-2">
                    <span className="block text-[10px] text-zinc-500 uppercase">Rollbacks</span>
                    <span className={`text-xs font-black ${result.toolActivityStats.rollbacksCount > 0 ? 'text-rose-400' : 'text-zinc-500'}`}>
                      {result.toolActivityStats.rollbacksCount}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* What Changed Summary Card */}
          {result && result.whatChanged && result.whatChanged.length > 0 && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> Selective Slide Modifications Made
                </span>
                <span className="text-[11px] text-zinc-400">
                  Targeted Slide(s): {result.changedSlideNumbers.join(', ')}
                </span>
              </div>

              <ul className="space-y-1 text-xs text-zinc-300">
                {result.whatChanged.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action CTAs */}
          {result && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <p className="text-xs text-zinc-400 italic">
                {result.outcomeReason}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {onOpenBeforeAfter && (
                  <button
                    onClick={onOpenBeforeAfter}
                    className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-3.5 py-1.5 text-xs font-semibold text-zinc-200 transition-colors"
                  >
                    <Layers className="h-3.5 w-3.5 text-amber-400" />
                    <span>Compare Before vs After</span>
                  </button>
                )}

                {onOpenExport && (
                  <button
                    onClick={onOpenExport}
                    className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-3.5 py-1.5 text-xs font-bold text-emerald-400 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Revised Deck</span>
                  </button>
                )}

                {onOpenStudio && (
                  <button
                    onClick={onOpenStudio}
                    className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 px-4 py-1.5 text-xs font-bold transition-all shadow-md shadow-amber-500/20"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Review in Studio</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
