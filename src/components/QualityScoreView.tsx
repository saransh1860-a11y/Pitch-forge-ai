import React from 'react';
import {
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Layers,
  History,
  Target,
  ShieldAlert,
  ArrowUpRight,
  Download,
} from 'lucide-react';
import { PitchScore, PitchProject, CategoryScore } from '../types/pitch';
import { InvestorDecisionCard } from './InvestorDecisionCard';
import { InvestorAgentTrace } from './InvestorAgentTrace';

interface QualityScoreViewProps {
  score: PitchScore;
  project: PitchProject;
  onOpenCritique: () => void;
  onOpenStudio: () => void;
  onOpenHistory: () => void;
  onOpenExport?: () => void;
  onRunAutonomousImprove?: () => void;
  onOpenChallenge?: () => void;
  onOpenBeforeAfter?: () => void;
  isLoadingAgent?: boolean;
}

export const QualityScoreView: React.FC<QualityScoreViewProps> = ({
  score,
  project,
  onOpenCritique,
  onOpenStudio,
  onOpenHistory,
  onOpenExport,
  onRunAutonomousImprove,
  onOpenChallenge,
  onOpenBeforeAfter,
  isLoadingAgent = false,
}) => {
  const getScoreColor = (val: number, max: number) => {
    const pct = val / max;
    if (pct >= 0.85) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (pct >= 0.70) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  const getProgressColor = (val: number, max: number) => {
    const pct = val / max;
    if (pct >= 0.85) return 'bg-emerald-500';
    if (pct >= 0.70) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  // Compute version score progression
  const versionScores = project.versions
    .map(v => ({
      version: v.versionNumber,
      score: v.score?.overallScore,
    }))
    .filter(v => v.score !== undefined);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
              Score
            </span>
            <h1 className="text-2xl font-extrabold text-white">
              Pitch Quality Scorecard (VC Committee Evaluation)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Evaluated on 8 institutional pillars of early-stage venture investability.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenStudio}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-3.5 py-2 text-xs font-medium text-zinc-300 transition-colors"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Studio</span>
          </button>

          {onRunAutonomousImprove && (
            <button
              onClick={onRunAutonomousImprove}
              disabled={isLoadingAgent}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 px-3.5 py-2 text-xs font-black shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Run Autonomous Multi-Agent Loop to revise target slides and boost investment quality score"
            >
              <Sparkles className="h-3.5 w-3.5 text-zinc-950" />
              <span>{isLoadingAgent ? 'Revising...' : 'Revise Deck (AI)'}</span>
            </button>
          )}

          {onOpenExport && (
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer"
              title="Download or export pitch deck in PPTX, PDF, or JSON format"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" />
              <span>Download</span>
            </button>
          )}

          <button
            onClick={onOpenCritique}
            className="flex items-center gap-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-bold px-3.5 py-2 text-xs sm:text-sm transition-all active:scale-95 cursor-pointer"
          >
            <ShieldAlert className="h-4 w-4 text-rose-400" />
            <span>60-Sec Test</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Institutional VC Decision Card */}
      {project.decision && (
        <InvestorDecisionCard
          decision={project.decision}
          score={project.score}
          onRunAutonomousImprove={onRunAutonomousImprove}
          onOpenChallenge={onOpenChallenge}
          isLoadingAgent={isLoadingAgent}
        />
      )}

      {/* Agent Trace Execution Step (If run) */}
      {(project.lastAgentResult || isLoadingAgent) && (
        <InvestorAgentTrace
          result={project.lastAgentResult}
          isLoading={isLoadingAgent}
          onOpenBeforeAfter={onOpenBeforeAfter}
          onOpenStudio={onOpenStudio}
          onOpenExport={onOpenExport}
        />
      )}

      {/* Main Score Hero Card */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900/70 to-zinc-950 p-6 sm:p-8 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Circular Score Display */}
          <div className="flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-zinc-800">
            <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500/20 via-orange-500/10 to-transparent border-4 border-amber-500/40 shadow-2xl">
              <div className="text-center">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                  {score.overallScore}
                </span>
                <span className="text-xs font-bold text-zinc-400 block">/ 100</span>
              </div>
            </div>

            <div className="mt-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-1 text-xs font-extrabold text-amber-300">
                <Award className="h-3.5 w-3.5" /> {score.tier}
              </span>
            </div>
          </div>

          {/* Score Summary & Progression */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Executive Readiness Assessment</h2>
              {versionScores.length > 1 && (
                <button
                  onClick={onOpenHistory}
                  className="flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300"
                >
                  <History className="h-3.5 w-3.5" />
                  Score Evolution ({versionScores.map(v => v.score).join(' → ')})
                </button>
              )}
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {score.overallScore >= 85
                ? 'High-conviction deck. The narrative arc, customer problem urgency, and business model mechanics are aligned for seed pitch meetings.'
                : score.overallScore >= 70
                ? 'Strong foundation. Key slides demonstrate clear value, but assumptions around market dynamics and competitive moats should be sharpened.'
                : 'Early conceptual stage. The deck requires clearer problem quantification, ICP definition, and validation test metrics.'}
            </p>

            {/* Top 3 High-Impact Improvements */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Top 3 Highest Leverage Improvements
              </span>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                {score.topImprovements.map((imp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold mt-0.5">{idx + 1}.</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 8-Pillar Category Breakdown */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-5">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Category Scoring Breakdown (8 Pillars)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.entries(score.categories) as [string, CategoryScore][]).map(([key, cat]) => {
            const pct = Math.round((cat.score / cat.maxScore) * 100);

            return (
              <div
                key={key}
                className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-200">{cat.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white">
                      {cat.score} / {cat.maxScore}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getScoreColor(cat.score, cat.maxScore)}`}>
                      {pct}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getProgressColor(cat.score, cat.maxScore)}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <p className="text-[11px] text-zinc-400 leading-relaxed pt-1">
                  {cat.feedback}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strengths and Weaknesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="h-4 w-4" /> Core Strengths
          </div>
          <ul className="space-y-2 text-xs text-zinc-300">
            {score.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="h-4 w-4" /> Areas for Refinement
          </div>
          <ul className="space-y-2 text-xs text-zinc-300">
            {score.weaknesses.map((weak, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">•</span>
                <span>{weak}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-zinc-800">
        <button
          onClick={onOpenStudio}
          className="text-xs text-zinc-400 hover:text-white"
        >
          ← Return to Slide Editor
        </button>

        <div className="flex flex-wrap items-center gap-3">
          {onRunAutonomousImprove && (
            <button
              onClick={onRunAutonomousImprove}
              disabled={isLoadingAgent}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black px-5 py-3 text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-zinc-950" />
              <span>{isLoadingAgent ? 'Revising...' : 'Revise Deck (AI)'}</span>
            </button>
          )}

          {onOpenExport && (
            <button
              onClick={onOpenExport}
              className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold px-5 py-3 text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Download className="h-4 w-4 text-emerald-400" />
              <span>Download Deck</span>
            </button>
          )}

          <button
            onClick={onOpenCritique}
            className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-6 py-3 text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            <span>Run 60-Second Investor Test</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
