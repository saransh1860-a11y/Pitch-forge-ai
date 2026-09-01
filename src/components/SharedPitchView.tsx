import React, { useState } from 'react';
import {
  Sparkles,
  Award,
  ShieldAlert,
  Download,
  Presentation,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Target,
  Zap,
  PieChart,
  Grid,
  Users,
  Compass,
  DollarSign,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { SlideData, PitchProject } from '../types/pitch';
import { PresentationMode } from './PresentationMode';

interface SharedPitchViewProps {
  project: PitchProject;
  onClose: () => void;
}

export const SharedPitchView: React.FC<SharedPitchViewProps> = ({ project, onClose }) => {
  const [activeTab, setActiveTab] = useState<'slides' | 'score' | 'critique'>('slides');
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [showPresentation, setShowPresentation] = useState(false);

  const slides = project.slides;
  const currentSlide: SlideData = slides[selectedSlideIndex] || slides[0];

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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'vision': return Sparkles;
      case 'problem': return Target;
      case 'solution': return Zap;
      case 'market': return PieChart;
      case 'product': return Grid;
      case 'business_model': return DollarSign;
      case 'competition': return Compass;
      case 'traction': return TrendingUp;
      case 'gtm': return Layers;
      case 'team_ask': return Users;
      default: return Layers;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
      
      {/* Top Welcome Notification / Info Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-zinc-950 border border-indigo-500/20 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white font-sans">Public Shared Preview (Read-Only)</h1>
            <p className="text-xs text-zinc-300">
              You are currently viewing an investor-grade startup pitch deck. Explore slides and scores below.
            </p>
          </div>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 px-4 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 transition-all border border-indigo-500/20 active:scale-95"
          >
            ← Back to App Dashboard
          </button>
        )}
      </div>

      {/* Main Pitch Details Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {project.intake.startupName} Pitch Deck
            </h2>
            <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-bold text-zinc-300 border border-zinc-700">
              v{project.currentVersion} • Shared
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            {project.intake.problem ? `One-liner: ${project.intake.problem.substring(0, 100)}...` : 'Comprehensive Pitch Deck Analysis.'}
          </p>
        </div>

        {/* Tab Selector buttons */}
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-zinc-900/60 p-1.5 border border-zinc-800">
          <button
            onClick={() => setActiveTab('slides')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'slides'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Pitch Slides</span>
          </button>
          
          <button
            onClick={() => setActiveTab('score')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'score'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>Scorecard</span>
          </button>

          <button
            onClick={() => setActiveTab('critique')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'critique'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>60-Second Critique</span>
          </button>
        </div>
      </div>

      {/* RENDER MAIN ACTIVE TAB */}
      <div className="min-h-[500px]">
        {/* TAB 1: SLIDES PREVIEWER */}
        {activeTab === 'slides' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Outline sidebar */}
            <div className="lg:col-span-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block border-b border-zinc-800 pb-2">
                10-Slide Deck Outline
              </span>
              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                {slides.map((slide, index) => {
                  const Icon = getCategoryIcon(slide.category);
                  return (
                    <button
                      key={slide.id}
                      onClick={() => setSelectedSlideIndex(index)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                        selectedSlideIndex === index
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-zinc-900/40 hover:bg-zinc-800/60 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${selectedSlideIndex === index ? 'text-white' : 'text-zinc-400'}`} />
                        <div>
                          <p className="text-[10px] text-zinc-400 font-bold tracking-tight uppercase">
                            Slide {slide.slideNumber}
                          </p>
                          <p className="text-xs font-bold line-clamp-1">
                            {slide.title}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Present full-screen option */}
              <button
                onClick={() => setShowPresentation(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 mt-4 transition-all active:scale-95"
              >
                <Presentation className="h-4 w-4 text-indigo-400" />
                <span>Present Slide Show</span>
              </button>
            </div>

            {/* Active Slide Center View */}
            <div className="lg:col-span-9 space-y-4">
              <div className="relative aspect-[16/10] w-full rounded-2xl border border-zinc-800 bg-[#070b13] p-8 flex flex-col justify-between overflow-hidden shadow-2xl">
                {/* Visual grid background details */}
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

                {/* Top Badge bar */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400 uppercase tracking-widest border border-indigo-500/20">
                    {currentSlide.category.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase">
                    SLIDE {currentSlide.slideNumber} OF {slides.length}
                  </span>
                </div>

                {/* Title & Headline */}
                <div className="relative z-10 space-y-2 my-auto">
                  <h3 className="text-2xl md:text-3xl font-extrabold text-white leading-tight font-sans tracking-tight">
                    {currentSlide.title}
                  </h3>
                  <p className="text-xs md:text-sm text-indigo-300 italic font-medium">
                    "{currentSlide.headline}"
                  </p>

                  {/* Bullet Takeaways */}
                  <div className="mt-6 space-y-2 md:space-y-3">
                    {currentSlide.bullets.map((bullet, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <span className="mt-1.5 flex h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                        <p className="text-xs md:text-sm text-zinc-200 leading-relaxed font-normal">
                          {bullet}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Key Data Metrics Row */}
                  {currentSlide.keyDataPoints && currentSlide.keyDataPoints.length > 0 && (
                    <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-zinc-800/60 pt-4">
                      {currentSlide.keyDataPoints.map((dp, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/40">
                          <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wide">
                            {dp.label}
                          </p>
                          <p className="text-base font-extrabold text-amber-400 mt-0.5">
                            {dp.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer notes / investor context */}
                <div className="relative z-10 border-t border-zinc-900 pt-3 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                  <span>PitchForge AI • Professional Standard</span>
                  <span>v{project.currentVersion}</span>
                </div>
              </div>

              {/* Navigation Arrows */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/20 border border-zinc-800/40">
                <button
                  disabled={selectedSlideIndex === 0}
                  onClick={() => setSelectedSlideIndex(prev => prev - 1)}
                  className="flex items-center gap-1 py-1.5 px-3 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-40 transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>
                <span className="text-xs text-zinc-400 font-mono">
                  Slide {selectedSlideIndex + 1} of {slides.length}
                </span>
                <button
                  disabled={selectedSlideIndex === slides.length - 1}
                  onClick={() => setSelectedSlideIndex(prev => prev + 1)}
                  className="flex items-center gap-1 py-1.5 px-3 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-40 transition-all"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SCORECARD VIEW (READ ONLY) */}
        {activeTab === 'score' && (
          <div className="space-y-6">
            {!project.score ? (
              <div className="text-center py-16 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 space-y-4">
                <Award className="mx-auto h-12 w-12 text-zinc-500 animate-pulse" />
                <h3 className="text-base font-bold text-white">No Scorecard Generated</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  The founder has not run the Venture Heuristics scoring matrix on this pitch yet.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Score Summary Metrics card */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Overall Metric visual */}
                  <div className="md:col-span-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="relative flex h-32 w-32 items-center justify-center">
                      {/* Animated circular tracking ring */}
                      <svg className="absolute inset-0 h-full w-full -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="54"
                          stroke="#18181b"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="54"
                          stroke="#eab308"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray="339.29"
                          strokeDashoffset={339.29 - (339.29 * project.score.overallScore) / 100}
                        />
                      </svg>
                      <span className="text-3xl font-black text-white">{project.score.overallScore}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-300">Overall Quality Rating</h4>
                      <span className="text-xs text-amber-400 font-mono font-semibold uppercase tracking-wider">
                        {project.score.rating} Stage
                      </span>
                    </div>
                  </div>

                  {/* Summary strengths/weaknesses list */}
                  <div className="md:col-span-8 rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                        VC Scoring Overview & Key Strengths
                      </h4>
                      <p className="text-xs text-zinc-300 leading-relaxed mt-1">
                        Below is an overview of the pitch deck's strong parameters along with some key structural ratings.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {project.score.keyStrengths && project.score.keyStrengths.map((str, i) => (
                        <div key={i} className="flex gap-2.5 p-3 rounded-xl border border-emerald-500/15 bg-emerald-500/5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-zinc-200">{str}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Grid of Heuristics Category Scores */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.score.categoryScores && Object.entries(project.score.categoryScores).map(([key, cat]: [string, any]) => (
                    <div key={key} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white capitalize">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold border ${getScoreColor(cat.score, cat.weight)}`}>
                          {cat.score} / {cat.weight}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          style={{ width: `${(cat.score / cat.weight) * 100}%` }}
                          className={`h-full rounded-full ${getProgressColor(cat.score, cat.weight)}`}
                        />
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-normal">
                        {cat.critique}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CRITIQUE VIEW (READ ONLY) */}
        {activeTab === 'critique' && (
          <div className="space-y-6">
            {!project.critique ? (
              <div className="text-center py-16 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 space-y-4">
                <ShieldAlert className="mx-auto h-12 w-12 text-zinc-500 animate-pulse" />
                <h3 className="text-base font-bold text-white">No Critique Available</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  The founder has not simulated a VC Committee 60-Second critique on this pitch yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Left block - Summary status */}
                <div className="md:col-span-4 space-y-4">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      <ShieldAlert className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-300">VC Committee Review</h4>
                      <span className="rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 text-xs font-black uppercase mt-2 inline-block tracking-wider">
                        {project.critique.overallReview || 'Ready for Review'}
                      </span>
                    </div>
                  </div>

                  {/* Red flags count card */}
                  {project.critique.criticalRisks && (
                    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 space-y-2">
                      <div className="flex items-center gap-2 text-rose-400">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Diligence Red Flags</span>
                      </div>
                      <p className="text-xs text-rose-200">
                        {project.critique.criticalRisks.length} main structural risks identified by the venture review panel.
                      </p>
                    </div>
                  )}
                </div>

                {/* Right block - Detailed list of strengths/weaknesses */}
                <div className="md:col-span-8 space-y-6">
                  {/* Partner comments */}
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-3">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">
                      Lead Partner Discussion Notes
                    </h4>
                    <p className="text-xs md:text-sm text-zinc-200 leading-relaxed italic">
                      "{project.critique.partnerComments}"
                    </p>
                  </div>

                  {/* Strengths & Weaknesses Detailed lists */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Strengths */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-3">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide block border-b border-zinc-800 pb-1.5">
                        High-Investability Indicators
                      </span>
                      <div className="space-y-2">
                        {project.critique.investabilityStrengths && project.critique.investabilityStrengths.map((str, idx) => (
                          <div key={idx} className="flex gap-2">
                            <span className="text-emerald-400 shrink-0 mt-0.5">•</span>
                            <p className="text-xs text-zinc-300">{str}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Risks */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-3">
                      <span className="text-xs font-bold text-rose-400 uppercase tracking-wide block border-b border-zinc-800 pb-1.5">
                        Core Vulnerabilities
                      </span>
                      <div className="space-y-2">
                        {project.critique.criticalRisks && project.critique.criticalRisks.map((risk, idx) => (
                          <div key={idx} className="flex gap-2">
                            <span className="text-rose-400 shrink-0 mt-0.5">•</span>
                            <p className="text-xs text-zinc-300">{risk}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Full screen Presentation Mode override overlay */}
      {showPresentation && (
        <PresentationMode
          project={project}
          onClose={() => setShowPresentation(false)}
        />
      )}
    </div>
  );
};
