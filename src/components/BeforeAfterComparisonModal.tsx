import React, { useState } from 'react';
import {
  Layers,
  X,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Award,
  ShieldAlert,
  RotateCcw,
  Check,
  TrendingUp,
} from 'lucide-react';
import { PitchProject, PitchVersion, SlideData } from '../types/pitch';

interface BeforeAfterComparisonModalProps {
  project: PitchProject;
  onClose: () => void;
  onRestoreInitial?: () => void;
}

export const BeforeAfterComparisonModal: React.FC<BeforeAfterComparisonModalProps> = ({
  project,
  onClose,
  onRestoreInitial,
}) => {
  const versions = project.versions || [];
  const initialVersion = versions[0];
  const latestVersion = versions[versions.length - 1] || initialVersion;

  const [selectedSlideNum, setSelectedSlideNum] = useState<number>(
    project.lastAgentResult?.changedSlideNumbers[0] || (project.slides[0]?.slideNumber ?? 1)
  );

  const initialSlide =
    initialVersion?.slides?.find((s) => s.slideNumber === selectedSlideNum) ||
    project.slides.find((s) => s.slideNumber === selectedSlideNum) ||
    project.slides[0];

  const currentSlide =
    project.slides.find((s) => s.slideNumber === selectedSlideNum) ||
    project.slides[0];

  const scoreInitial = initialVersion?.score?.overallScore || project.score?.overallScore || 65;
  const scoreLatest = project.score?.overallScore || latestVersion?.score?.overallScore || 78;
  const delta = scoreLatest - scoreInitial;

  const changedSlideNums = project.lastAgentResult?.changedSlideNumbers || [];
  const hasMultipleVersions = versions.length > 1 || Boolean(project.lastAgentResult);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="max-w-5xl w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-7 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Pitch Evolution: Before vs After AI Investor Refinement
              </h2>
              <p className="text-xs text-zinc-400">
                Compare baseline founder draft against closed-loop agentic revisions.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Top 3-Card High-Level Comparison Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Baseline Card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-bold uppercase tracking-wider">Initial Version (V1)</span>
              <span className="text-zinc-500">Baseline</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{scoreInitial}</span>
              <span className="text-xs text-zinc-500 font-bold">/ 100</span>
            </div>
            <p className="text-xs text-zinc-400">
              {initialVersion?.score?.tier || 'Needs Validation'}
            </p>
          </div>

          {/* AI Investor Action */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-amber-400">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" /> AI Investor Engine
              </span>
              <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded font-bold">
                Selective
              </span>
            </div>
            <p className="text-xs text-zinc-200 font-medium">
              Targeted Bottleneck: <strong className="text-amber-300">{project.decision?.weakestScoringDimension || 'Traction & Moat'}</strong>
            </p>
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[11px] text-zinc-400">Modified:</span>
              {changedSlideNums.map((num) => (
                <span
                  key={num}
                  className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-extrabold text-amber-300 border border-amber-500/40"
                >
                  Slide {num}
                </span>
              ))}
            </div>
          </div>

          {/* Refined Score Card */}
          <div
            className={`rounded-xl border p-4 space-y-2 ${
              delta > 0
                ? 'border-emerald-500/30 bg-emerald-500/10'
                : delta === 0
                ? 'border-zinc-700 bg-zinc-900/60'
                : 'border-rose-500/30 bg-rose-500/10'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className={`font-bold uppercase tracking-wider ${delta > 0 ? 'text-emerald-400' : delta === 0 ? 'text-zinc-300' : 'text-rose-400'}`}>
                Refined Version (V{project.currentVersion})
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-extrabold border ${
                  delta > 0
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : delta === 0
                    ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}
              >
                {delta > 0 ? `+${delta} PTS` : delta === 0 ? '0 PTS (UNCHANGED)' : `${delta} PTS`}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-black ${delta > 0 ? 'text-emerald-400' : delta === 0 ? 'text-white' : 'text-rose-400'}`}>
                {scoreLatest}
              </span>
              <span className="text-xs text-zinc-400 font-bold">/ 100</span>
            </div>
            <p className={`text-xs font-semibold ${delta > 0 ? 'text-emerald-300' : delta === 0 ? 'text-zinc-300' : 'text-rose-300'}`}>
              {project.score?.tier || 'Seed Ready'}
            </p>
          </div>
        </div>

        {/* What Changed Bullets */}
        {project.lastAgentResult?.whatChanged && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> High-Impact Modifications Applied
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300">
              {project.lastAgentResult.whatChanged.map((c, i) => (
                <div key={i} className="flex items-start gap-2 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Slide Selector Tabs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Slide-By-Slide Diff Inspector
            </span>
            <span className="text-xs text-zinc-500">
              Select a slide to compare initial vs refined copy
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
            {project.slides.map((s) => {
              const isTargeted = changedSlideNums.includes(s.slideNumber);
              const isSelected = s.slideNumber === selectedSlideNum;

              return (
                <button
                  key={s.slideNumber}
                  onClick={() => setSelectedSlideNum(s.slideNumber)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all shrink-0 ${
                    isSelected
                      ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                      : isTargeted
                      ? 'bg-amber-500/10 border border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <span>Slide {s.slideNumber}</span>
                  {isTargeted && (
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Side-by-Side Slide Comparison */}
        {initialSlide && currentSlide && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Initial Slide */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Initial Version — Slide {initialSlide.slideNumber}: {initialSlide.title}
                </span>
                <span className="text-[10px] text-zinc-500 uppercase font-semibold">
                  {initialSlide.category}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                  1-Second Headline
                </span>
                <p className="text-xs sm:text-sm font-semibold text-zinc-300 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                  {initialSlide.headline}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                  Key Points
                </span>
                <ul className="space-y-1 text-xs text-zinc-400 list-disc list-inside">
                  {initialSlide.bullets.map((b, i) => (
                    <li key={i} className="line-clamp-2">{b}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: Refined Slide */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> Refined Version — Slide {currentSlide.slideNumber}: {currentSlide.title}
                </span>
                <span className="text-[10px] text-amber-400 uppercase font-semibold">
                  {currentSlide.category}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  Upgraded Takeaway Headline
                </span>
                <p className="text-xs sm:text-sm font-bold text-white bg-zinc-950 p-3 rounded-lg border border-amber-500/30 shadow-sm">
                  {currentSlide.headline}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Strengthened Points & Evidence
                </span>
                <ul className="space-y-1 text-xs text-zinc-200 list-disc list-inside">
                  {currentSlide.bullets.map((b, i) => (
                    <li key={i} className="line-clamp-2">{b}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="rounded-xl bg-zinc-800 hover:bg-zinc-700 px-5 py-2 text-xs font-bold text-white transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
