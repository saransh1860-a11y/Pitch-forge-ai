import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  TrendingUp,
  Target,
  Layers,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  PieChart,
  Repeat,
} from 'lucide-react';
import { StartupAnalysis, StartupIntake } from '../types/pitch';

interface AnalysisCardViewProps {
  analysis: StartupAnalysis;
  intake: StartupIntake;
  onGeneratePitch: () => void;
  onReanalyze: () => void;
  isLoading: boolean;
  loadingStep: string;
}

export const AnalysisCardView: React.FC<AnalysisCardViewProps> = ({
  analysis,
  intake,
  onGeneratePitch,
  onReanalyze,
  isLoading,
  loadingStep,
}) => {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
              2
            </span>
            <h1 className="text-2xl font-extrabold text-white">
              AI Strategic Analysis & Assumption Audit
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            PitchForge AI evaluated <span className="font-semibold text-white">{intake.startupName}</span> against institutional venture investment standards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onReanalyze}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-3.5 py-2 text-xs font-medium text-zinc-300 transition-colors"
          >
            <Repeat className="h-3.5 w-3.5" />
            Re-Analyze
          </button>

          <button
            type="button"
            onClick={onGeneratePitch}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-bold px-5 py-2.5 text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/25 active:scale-95"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
                <span>{loadingStep || 'Generating 10 Slides...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 stroke-[2.5]" />
                <span>Generate 10-Slide Pitch</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid of Key Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Problem */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <Target className="h-4 w-4" /> Core Problem & Pain Point
          </div>
          <p className="text-sm text-zinc-200 leading-relaxed font-medium">
            {analysis.coreProblem}
          </p>
        </div>

        {/* Ideal Customer Profile */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Target className="h-4 w-4" /> Target Customer & Segment (ICP)
          </div>
          <p className="text-sm text-zinc-200 leading-relaxed font-medium">
            {analysis.targetCustomer}
          </p>
        </div>

        {/* Value Proposition */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-4 w-4" /> Unique Value Proposition
          </div>
          <p className="text-sm text-zinc-200 leading-relaxed font-medium">
            {analysis.valueProposition}
          </p>
        </div>

        {/* Business Model Engine */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Layers className="h-4 w-4" /> Business Model & Unit Economics
          </div>
          <p className="text-sm text-zinc-200 leading-relaxed font-medium">
            {analysis.businessModel}
          </p>
        </div>
      </div>

      {/* Market Sizing & Dynamics (TAM / SAM / SOM) */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <PieChart className="h-4 w-4" /> Market Opportunity & Dynamics
          </div>
          {analysis.marketOpportunity.isAssumption && (
            <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
              [ASSUMPTION - MODELED ESTIMATE]
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-zinc-950/80 p-4 border border-zinc-800/80">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">TAM (Total Addressable)</span>
            <div className="text-base font-extrabold text-white mt-1">
              {analysis.marketOpportunity.tamEstimate || 'Top-down estimated'}
            </div>
          </div>
          <div className="rounded-xl bg-zinc-950/80 p-4 border border-zinc-800/80">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">SAM (Serviceable Addressable)</span>
            <div className="text-base font-extrabold text-white mt-1">
              {analysis.marketOpportunity.samEstimate || 'Target segments'}
            </div>
          </div>
          <div className="rounded-xl bg-zinc-950/80 p-4 border border-zinc-800/80">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">SOM (Serviceable Obtainable)</span>
            <div className="text-base font-extrabold text-white mt-1">
              {analysis.marketOpportunity.somEstimate || 'Initial launch cohort'}
            </div>
          </div>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed pt-1">
          {analysis.marketOpportunity.marketDynamics}
        </p>
      </div>

      {/* Differentiation & Moat */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-3">
        <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider">
          <TrendingUp className="h-4 w-4" /> Competitive Differentiation & Defensibility
        </div>
        <p className="text-sm text-zinc-200 leading-relaxed font-medium">
          {analysis.differentiation}
        </p>
        <div className="pt-2 text-xs text-zinc-400 border-t border-zinc-800">
          <span className="font-semibold text-zinc-300">Competitive Landscape Context: </span>
          {analysis.competitionSummary}
        </div>
      </div>

      {/* The 3 Crucial Auditor Columns: Risks, Missing Info, Unverified Assumptions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Critical Risks */}
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5 space-y-3">
          <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="h-4 w-4" /> Critical Investment Risks
          </div>
          <ul className="space-y-2 text-xs text-zinc-300">
            {analysis.criticalRisks.map((risk, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-rose-400 font-bold mt-0.5">•</span>
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Missing Information */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-3">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="h-4 w-4" /> Missing Information
          </div>
          <ul className="space-y-2 text-xs text-zinc-300">
            {analysis.missingInformation.map((info, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-400 font-bold mt-0.5">•</span>
                <span>{info}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Assumptions to Validate */}
        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5 space-y-3">
          <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="h-4 w-4" /> Assumptions Requiring Validation
          </div>
          <ul className="space-y-2 text-xs text-zinc-300">
            {analysis.assumptionsRequiringValidation.map((assump, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold mt-0.5">•</span>
                <span>{assump}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Strategic Advice */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <Lightbulb className="h-4 w-4" /> VC Strategic Recommendations
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {analysis.strategicAdvice.map((advice, idx) => (
            <div key={idx} className="flex items-start gap-2.5 rounded-lg bg-zinc-900/60 p-3 border border-zinc-800 text-xs text-zinc-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{advice}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-800">
        <span className="text-xs text-zinc-400">
          Ready to construct the structured 10-slide narrative arc?
        </span>

        <button
          type="button"
          onClick={onGeneratePitch}
          disabled={isLoading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-8 py-3.5 text-sm transition-all shadow-xl shadow-amber-500/25 active:scale-95 cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
              <span>{loadingStep || 'Generating 10 Slides...'}</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 stroke-[2.5]" />
              <span>Generate 10-Slide Pitch Deck</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
