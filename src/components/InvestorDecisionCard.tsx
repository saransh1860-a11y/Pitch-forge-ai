import React from 'react';
import {
  ShieldAlert,
  Award,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  HelpCircle,
  Layers,
  Zap,
} from 'lucide-react';
import { InvestorDecision, PitchScore } from '../types/pitch';

interface InvestorDecisionCardProps {
  decision: InvestorDecision;
  score?: PitchScore;
  onRunAutonomousImprove?: () => void;
  onOpenChallenge?: () => void;
  isLoadingAgent?: boolean;
}

export const InvestorDecisionCard: React.FC<InvestorDecisionCardProps> = ({
  decision,
  score,
  onRunAutonomousImprove,
  onOpenChallenge,
  isLoadingAgent = false,
}) => {
  const getDecisionBadge = () => {
    switch (decision.decision) {
      case 'INVEST':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          glow: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
          icon: CheckCircle2,
          label: 'INVEST (High Conviction)',
          desc: 'Investment committee recommends issuing term sheet / allocating capital.',
        };
      case 'WATCHLIST':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          glow: 'from-amber-500/20 via-amber-500/5 to-transparent',
          icon: Clock,
          label: 'WATCHLIST (Conditional Interest)',
          desc: 'Compelling foundation, but requires validation proof or sharper defensibility.',
        };
      case 'PASS':
      default:
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          glow: 'from-rose-500/20 via-rose-500/5 to-transparent',
          icon: XCircle,
          label: 'PASS (Early / Unproven)',
          desc: 'Critical narrative gaps, unclear monetization, or early unverified assumptions.',
        };
    }
  };

  const badge = getDecisionBadge();
  const Icon = badge.icon;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-7 shadow-2xl transition-all">
      {/* Subtle Top Gradient Accent */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${decision.decision === 'INVEST' ? 'from-emerald-500 via-teal-400 to-emerald-600' : decision.decision === 'WATCHLIST' ? 'from-yellow-400 via-amber-400 to-yellow-600' : 'from-blue-900 via-slate-800 to-slate-900'}`} />

      <div className="space-y-6">
        {/* Header Row: Decision Badge & Conviction Meter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${badge.bg}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
                  Institutional Committee Verdict
                </span>
                <span className="flex h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {badge.label}
              </h3>
            </div>
          </div>

          {/* Conviction Gauge */}
          <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-2.5">
            <div className="text-right">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                VC Conviction
              </span>
              <span className="text-lg font-black text-white">
                {decision.confidenceLevel}%
              </span>
            </div>
            <div className="h-9 w-9 relative flex items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-zinc-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={decision.decision === 'INVEST' ? 'text-emerald-400' : decision.decision === 'WATCHLIST' ? 'text-amber-400' : 'text-rose-400'}
                  strokeDasharray={`${decision.confidenceLevel}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* 2-Column Core Investor Signals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strongest Signal */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Strongest Investment Signal</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">
              {decision.strongestSignal}
            </p>
          </div>

          {/* Biggest Risk */}
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 uppercase tracking-wider">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Primary Downside Risk</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">
              {decision.biggestRisk}
            </p>
          </div>
        </div>

        {/* Bottleneck & Responsible Slide Mapping */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Identified Bottleneck: {decision.weakestScoringDimension}
              </span>
            </div>
            {decision.responsibleSlideNumbers && decision.responsibleSlideNumbers.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-medium text-zinc-400">Target Slides:</span>
                {decision.responsibleSlideNumbers.map((num) => (
                  <span
                    key={num}
                    className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-[11px] font-extrabold text-amber-300"
                  >
                    Slide {num}
                  </span>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {decision.singleMostImportantWeakness}
          </p>

          {decision.slideSelectionReason && (
            <div className="rounded-lg bg-zinc-950/70 border border-zinc-800/80 p-3 text-xs text-zinc-300 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                Slide Targeting Rationale
              </span>
              <p className="text-zinc-300 leading-relaxed">
                {decision.slideSelectionReason}
              </p>
            </div>
          )}

          {(decision.evidenceGap || decision.expectedImprovementTarget) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              {decision.evidenceGap && (
                <div className="rounded-lg bg-zinc-950/50 border border-zinc-800/60 p-2.5 space-y-0.5">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                    Evidence Gap
                  </span>
                  <p className="text-zinc-300 line-clamp-2">{decision.evidenceGap}</p>
                </div>
              )}
              {decision.expectedImprovementTarget && (
                <div className="rounded-lg bg-zinc-950/50 border border-zinc-800/60 p-2.5 space-y-0.5">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    Target Outcome
                  </span>
                  <p className="text-zinc-300 line-clamp-2">{decision.expectedImprovementTarget}</p>
                </div>
              )}
            </div>
          )}

          <div className="pt-2 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="text-zinc-400">
              <strong className="text-zinc-200">Evidence Needed:</strong> {decision.evidenceOrChangeNeeded}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <p className="text-xs text-zinc-400 italic">
            Next move: {decision.recommendedNextAction}
          </p>

          <div className="flex items-center gap-2.5">
            {onOpenChallenge && (
              <button
                onClick={onOpenChallenge}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 hover:text-white px-3.5 py-2 text-xs font-semibold text-zinc-200 transition-all active:scale-95"
              >
                <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
                <span>Investor Challenge</span>
              </button>
            )}

            {onRunAutonomousImprove && (
              <button
                onClick={onRunAutonomousImprove}
                disabled={isLoadingAgent}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-zinc-950 px-4 py-2 text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingAgent ? (
                  <>
                    <Zap className="h-4 w-4 animate-spin text-zinc-950" />
                    <span>Running Agent Decision Loop...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-zinc-950" />
                    <span>Run AI Investor Improvement Loop</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
