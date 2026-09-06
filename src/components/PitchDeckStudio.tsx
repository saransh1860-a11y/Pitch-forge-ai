import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Award,
  ShieldAlert,
  History,
  Download,
  Presentation,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Edit3,
  Plus,
  Trash2,
  ArrowRight,
  Eye,
  Check,
  X,
  Layers,
  Target,
  Zap,
  PieChart,
  Grid,
  Users,
  Compass,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Bot,
  RefreshCw,
  Share2,
} from 'lucide-react';
import { SlideData, PitchProject } from '../types/pitch';
import { improveSlideApi } from '../services/apiClient';
import { ShareModal } from './ShareModal';
import { useTheme } from '../contexts/ThemeContext';

interface PitchDeckStudioProps {
  project: PitchProject;
  onUpdateSlides: (slides: SlideData[], newVersionNote?: string) => void;
  onScorePitch: () => void;
  onOpenCritique: () => void;
  onOpenHistory: () => void;
  onOpenExport: () => void;
  onOpenPresentation: () => void;
  onToggleShare: (isShared: boolean) => Promise<void>;
  onOpenChallenge?: () => void;
  onOpenBeforeAfter?: () => void;
  onRunAutonomousImprove?: () => void;
  isImprovingDeck?: boolean;
  isLoadingScore: boolean;
  isLoadingCritique: boolean;
}

export const PitchDeckStudio: React.FC<PitchDeckStudioProps> = ({
  project,
  onUpdateSlides,
  onScorePitch,
  onOpenCritique,
  onOpenHistory,
  onOpenExport,
  onOpenPresentation,
  onToggleShare,
  onOpenChallenge,
  onOpenBeforeAfter,
  onRunAutonomousImprove,
  isImprovingDeck = false,
  isLoadingScore,
  isLoadingCritique,
}) => {
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [customAiPrompt, setCustomAiPrompt] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const { theme } = useTheme();
  
  // Pending AI Diff State for approval
  const [pendingDiff, setPendingDiff] = useState<{
    improvedSlide: SlideData;
    explanation: string;
    changesSummary: string[];
  } | null>(null);

  const currentSlide = project.slides[selectedSlideIndex] || project.slides[0];

  // Helper to update current slide
  const handleCurrentSlideChange = (field: keyof SlideData, value: any) => {
    const updated = [...project.slides];
    updated[selectedSlideIndex] = {
      ...updated[selectedSlideIndex],
      [field]: value,
      isEdited: true,
    };
    onUpdateSlides(updated);
  };

  const handleBulletChange = (idx: number, val: string) => {
    const updatedBullets = [...currentSlide.bullets];
    updatedBullets[idx] = val;
    handleCurrentSlideChange('bullets', updatedBullets);
  };

  const handleAddBullet = () => {
    const updatedBullets = [...currentSlide.bullets, 'New compelling investor takeaway point'];
    handleCurrentSlideChange('bullets', updatedBullets);
  };

  const handleDeleteBullet = (idx: number) => {
    const updatedBullets = currentSlide.bullets.filter((_, i) => i !== idx);
    handleCurrentSlideChange('bullets', updatedBullets);
  };

  const handleDataPointChange = (idx: number, field: string, val: string) => {
    const updatedPoints = [...currentSlide.keyDataPoints];
    updatedPoints[idx] = {
      ...updatedPoints[idx],
      [field]: val,
    };
    handleCurrentSlideChange('keyDataPoints', updatedPoints);
  };

  // AI Slide Co-pilot Action Handler
  const handleAiAction = async (instruction: 'improve' | 'concise' | 'strengthen_investor_arg' | 'find_unsupported' | 'suggest_layout' | 'explain_why_matters' | 'custom') => {
    setIsAiLoading(true);
    try {
      const result = await improveSlideApi(
        currentSlide,
        instruction,
        instruction === 'custom' ? customAiPrompt : undefined,
        `Startup: ${project.intake.startupName}. Stage: ${project.intake.stage}. Problem: ${project.intake.problem}`
      );
      setPendingDiff(result);
    } catch (err: any) {
      alert(err.message || 'Failed to refine slide with AI.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const acceptAiChanges = () => {
    if (!pendingDiff) return;
    const updated = [...project.slides];
    updated[selectedSlideIndex] = pendingDiff.improvedSlide;
    onUpdateSlides(updated, `AI Refinement on Slide ${currentSlide.slideNumber}`);
    setPendingDiff(null);
  };

  const discardAiChanges = () => {
    setPendingDiff(null);
  };

  // Category Icon helper
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

  if (theme === 'light') {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6 text-slate-900 bg-slate-50 min-h-screen">
        {/* Studio Top Control Bar - LIGHT MODE */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900">
                  {project.intake.startupName || 'Pitch Studio'}
                </h1>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200">
                  10-Slide Deck • v{project.currentVersion}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Interactive Pitch Editor & AI Co-Pilot
              </p>
            </div>
          </div>

          {/* Action Buttons - LIGHT MODE */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 60-Second Investor Test */}
            <button
              onClick={onOpenCritique}
              disabled={isLoadingCritique}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-3.5 py-2 text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Simulate 60-second VC Partner review"
            >
              {isLoadingCritique ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-white" />
              ) : (
                <ShieldAlert className="h-3.5 w-3.5 text-white" />
              )}
              <span>60-Second Test</span>
            </button>

            {/* AI Score Button */}
            <button
              onClick={onScorePitch}
              disabled={isLoadingScore}
              className="flex items-center gap-1.5 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 transition-all active:scale-95 cursor-pointer"
            >
              {isLoadingScore ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-600" />
              ) : (
                <Award className="h-3.5 w-3.5 text-indigo-600" />
              )}
              <span>
                {project.score ? `Score: ${project.score.overallScore}/100` : 'Scorecard'}
              </span>
            </button>

            {/* Investor Challenge */}
            {onOpenChallenge && (
              <button
                onClick={onOpenChallenge}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition-all active:scale-95 cursor-pointer"
                title="Test against hard VC due-diligence questions"
              >
                <HelpCircle className="h-3.5 w-3.5 text-amber-500" />
                <span className="hidden sm:inline">Challenge</span>
              </button>
            )}

            {/* Before vs After Comparison */}
            {onOpenBeforeAfter && (
              <button
                onClick={onOpenBeforeAfter}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition-all active:scale-95 cursor-pointer"
                title="Compare initial founder draft against AI revisions"
              >
                <Layers className="h-3.5 w-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Before/After</span>
              </button>
            )}

            {/* Revise with AI Investor */}
            {onRunAutonomousImprove && (
              <button
                onClick={onRunAutonomousImprove}
                disabled={isImprovingDeck}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                title="Let AI Investor agent identify weak slides"
              >
                {isImprovingDeck ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-white" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                )}
                <span>{isImprovingDeck ? 'Revising...' : 'Revise Deck (AI)'}</span>
              </button>
            )}

            {/* Present Button */}
            <button
              onClick={onOpenPresentation}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition-all active:scale-95 cursor-pointer"
            >
              <Presentation className="h-3.5 w-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Present</span>
            </button>

            {/* Share Button */}
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition-all active:scale-95 cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5 text-indigo-600" />
              <span>Share</span>
            </button>

            {/* Export */}
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 rounded-xl bg-white hover:bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-emerald-600" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Main Studio Grid: Left Navigator (25%), Center Editor (45%), Right AI Assistant (30%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 1. LEFT SIDEBAR: 10 Slides Navigator */}
          <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                10-Slide Outline
              </span>
              <span className="text-[10px] text-indigo-600 font-bold">Standard Flow</span>
            </div>

            <div className="space-y-1.5 max-h-[680px] overflow-y-auto pr-1">
              {project.slides.map((slide, idx) => {
                const Icon = getCategoryIcon(slide.category);
                const isSelected = idx === selectedSlideIndex;

                return (
                  <button
                    key={slide.id || idx}
                    onClick={() => setSelectedSlideIndex(idx)}
                    className={`w-full text-left flex items-start gap-3 rounded-xl p-2.5 transition-all ${
                      isSelected
                        ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 shadow-sm'
                        : 'hover:bg-slate-50 text-slate-600 border border-transparent'
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-bold truncate ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                          {slide.title}
                        </span>
                        <Icon className={`h-3 w-3 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                      </div>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5 font-medium">
                        {slide.headline}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. CENTER CANVAS: Slide Preview & Inline Editor */}
          <div className="lg:col-span-6 space-y-6">
            {/* Main Slide Card Container */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedSlideIndex}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6"
              >
                {/* Slide Header */}
                <div className="space-y-2 border-b border-slate-100 pb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      Slide {currentSlide.slideNumber} • {currentSlide.category.replace('_', ' ').toUpperCase()}
                    </span>
                    {currentSlide.isEdited && (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                        Edited Draft
                      </span>
                    )}
                  </div>

                  <input
                    type="text"
                    value={currentSlide.title}
                    onChange={(e) => handleCurrentSlideChange('title', e.target.value)}
                    className="w-full bg-transparent text-xl font-bold text-slate-900 border-b border-transparent hover:border-slate-200 focus:border-indigo-500 focus:outline-none transition-colors"
                    placeholder="Slide Title"
                  />

                  <input
                    type="text"
                    value={currentSlide.headline}
                    onChange={(e) => handleCurrentSlideChange('headline', e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-slate-600 border-b border-transparent hover:border-slate-200 focus:border-indigo-500 focus:outline-none transition-colors"
                    placeholder="1-Second Takeaway Headline"
                  />
                </div>

                {/* Bullets List Section */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Takeaway Arguments & Supporting Points
                  </label>

                  <div className="space-y-2.5">
                    {currentSlide.bullets.map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-2 group">
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                        <textarea
                          rows={2}
                          value={bullet}
                          onChange={(e) => handleBulletChange(bIdx, e.target.value)}
                          className="flex-1 bg-transparent text-xs text-slate-700 leading-relaxed border-b border-transparent hover:border-slate-200 focus:border-indigo-500 focus:outline-none resize-none transition-colors py-1"
                          placeholder="Supporting argument point..."
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteBullet(bIdx)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddBullet}
                    className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors pt-2 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" /> Add Takeaway Bullet
                  </button>
                </div>

                {/* Key Data Points Card Section */}
                {currentSlide.keyDataPoints && currentSlide.keyDataPoints.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Quantitative Evidence & Milestones
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentSlide.keyDataPoints.map((point, pIdx) => (
                        <div
                          key={pIdx}
                          className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-1 hover:border-slate-300 transition-colors"
                        >
                          <input
                            type="text"
                            value={point.value}
                            onChange={(e) => handleDataPointChange(pIdx, 'value', e.target.value)}
                            className="w-full bg-transparent text-base font-extrabold text-slate-900 border-b border-transparent hover:border-slate-200 focus:border-indigo-500 focus:outline-none transition-colors"
                            placeholder="e.g. 150k"
                          />
                          <input
                            type="text"
                            value={point.label}
                            onChange={(e) => handleDataPointChange(pIdx, 'label', e.target.value)}
                            className="w-full bg-transparent text-[11px] text-slate-500 border-b border-transparent hover:border-slate-200 focus:border-indigo-500 focus:outline-none transition-colors"
                            placeholder="e.g. MoM Growth"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 3. RIGHT SIDEBAR: AI Presentation Co-Pilot */}
          <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-5 space-y-5 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Bot className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">AI Slide Co-Pilot</h2>
            </div>

            {/* Quick Actions Panel */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick Re-Write Prompts
              </span>

              <div className="grid grid-cols-1 gap-1.5">
                <button
                  onClick={() => handleAiAction('improve')}
                  disabled={isAiLoading}
                  className="w-full text-left text-xs font-semibold py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all border border-slate-200 cursor-pointer"
                >
                  🚀 Optimize for VC Readability
                </button>
                <button
                  onClick={() => handleAiAction('concise')}
                  disabled={isAiLoading}
                  className="w-full text-left text-xs font-semibold py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all border border-slate-200 cursor-pointer"
                >
                  🎯 Make Highly Concise
                </button>
                <button
                  onClick={() => handleAiAction('strengthen_investor_arg')}
                  disabled={isAiLoading}
                  className="w-full text-left text-xs font-semibold py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all border border-slate-200 cursor-pointer"
                >
                  💪 Strengthen Thesis Statement
                </button>
                <button
                  onClick={() => handleAiAction('find_unsupported')}
                  disabled={isAiLoading}
                  className="w-full text-left text-xs font-semibold py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all border border-slate-200 cursor-pointer"
                >
                  🔍 Scan for Weak Hypotheses
                </button>
              </div>
            </div>

            {/* Custom Interactive Command input */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Custom Co-Pilot Directives
              </label>

              <textarea
                rows={3}
                value={customAiPrompt}
                onChange={(e) => setCustomAiPrompt(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                placeholder="e.g. 'Rewrite this with a focus on enterprise SaaS unit economics...'"
              />

              <button
                type="button"
                onClick={() => handleAiAction('custom')}
                disabled={isAiLoading || !customAiPrompt.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 text-xs shadow-sm shadow-indigo-100 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isAiLoading ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                <span>Refine Slide</span>
              </button>
            </div>
          </div>
        </div>

        {/* AI Proposal Comparison Overlay Modal - LIGHT MODE */}
        {pendingDiff && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Review Proposed AI Optimizations</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Verify the revised narrative claims</p>
                </div>
              </div>

              {/* Explanation note */}
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-150 text-xs text-slate-600 leading-relaxed font-medium">
                {pendingDiff.explanation}
              </div>

              {/* Diff view Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Original */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Original Founder Slide
                  </span>
                  <p className="text-xs font-bold text-slate-800">{currentSlide.headline}</p>
                  <ul className="text-xs text-slate-600 space-y-1 font-medium">
                    {currentSlide.bullets.map((b, i) => (
                      <li key={i}>• {b}</li>
                    ))}
                  </ul>
                </div>

                {/* Proposed */}
                <div className="rounded-xl border border-indigo-150 bg-indigo-50/20 p-4 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                    AI Proposed Slide
                  </span>
                  <p className="text-xs font-bold text-slate-900">{pendingDiff.improvedSlide.headline}</p>
                  <ul className="text-xs text-slate-800 space-y-1 font-semibold">
                    {pendingDiff.improvedSlide.bullets.map((b, i) => (
                      <li key={i}>• {b}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Decision Bar */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={discardAiChanges}
                  className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Discard Changes
                </button>
                <button
                  type="button"
                  onClick={acceptAiChanges}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 text-xs shadow-sm cursor-pointer"
                >
                  <Check className="h-4 w-4 stroke-[3]" />
                  Accept AI Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share Link Settings Dialog */}
        {showShareModal && (
          <ShareModal
            project={project}
            onToggleShare={onToggleShare}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Studio Top Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white">
                {project.intake.startupName || 'Pitch Studio'}
              </h1>
              <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-400 border border-zinc-700">
                10-Slide Deck • v{project.currentVersion}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Interactive Pitch Editor & AI Co-Pilot
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 60-Second Investor Test */}
          <button
            onClick={onOpenCritique}
            disabled={isLoadingCritique}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-700 to-amber-500 hover:from-blue-600 hover:to-amber-400 text-white px-3.5 py-2 text-xs font-bold shadow-md shadow-blue-900/30 transition-all active:scale-95 disabled:opacity-50"
            title="Simulate 60-second VC Partner review and partner comments"
          >
            {isLoadingCritique ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-white" />
            ) : (
              <ShieldAlert className="h-3.5 w-3.5 text-white" />
            )}
            <span>60-Second Test</span>
          </button>

          {/* AI Score Button */}
          <button
            onClick={onScorePitch}
            disabled={isLoadingScore}
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-2 text-xs font-semibold text-amber-300 transition-all active:scale-95"
          >
            {isLoadingScore ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-400" />
            ) : (
              <Award className="h-3.5 w-3.5 text-amber-400" />
            )}
            <span>
              {project.score ? `Score: ${project.score.overallScore}/100` : 'Scorecard'}
            </span>
          </button>

          {/* Investor Challenge */}
          {onOpenChallenge && (
            <button
              onClick={onOpenChallenge}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-200 transition-all active:scale-95"
              title="Test against hard VC due-diligence questions"
            >
              <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Challenge</span>
            </button>
          )}

          {/* Before vs After Comparison */}
          {onOpenBeforeAfter && (
            <button
              onClick={onOpenBeforeAfter}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-200 transition-all active:scale-95"
              title="Compare initial founder draft against AI revisions"
            >
              <Layers className="h-3.5 w-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Before/After</span>
            </button>
          )}

          {/* Revise with AI Investor */}
          {onRunAutonomousImprove && (
            <button
              onClick={onRunAutonomousImprove}
              disabled={isImprovingDeck}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-400 text-zinc-950 px-3.5 py-2 text-xs font-black shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
              title="Let AI Investor agent identify weak slides, rewrite narrative, and improve quality score"
            >
              {isImprovingDeck ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-zinc-950" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 text-zinc-950" />
              )}
              <span>{isImprovingDeck ? 'Revising...' : 'Revise Deck (AI)'}</span>
            </button>
          )}

          {/* Present Button */}
          <button
            onClick={onOpenPresentation}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-200 transition-all active:scale-95"
          >
            <Presentation className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Present</span>
          </button>

          {/* Share Button */}
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-200 transition-all active:scale-95"
            title="Generate a public read-only link for mentors & partners"
          >
            <Share2 className="h-3.5 w-3.5 text-indigo-400" />
            <span>Share</span>
          </button>

          {/* Export */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 px-3 py-2 text-xs font-medium text-white border border-zinc-700 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-emerald-400" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Left Navigator (25%), Center Editor (45%), Right AI Assistant (30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 1. LEFT SIDEBAR: 10 Slides Navigator */}
        <div className="lg:col-span-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              10-Slide Outline
            </span>
            <span className="text-[10px] text-amber-400 font-medium">Standard Flow</span>
          </div>

          <div className="space-y-1.5 max-h-[680px] overflow-y-auto pr-1">
            {project.slides.map((slide, idx) => {
              const Icon = getCategoryIcon(slide.category);
              const isSelected = idx === selectedSlideIndex;

              return (
                <button
                  key={slide.id || idx}
                  onClick={() => setSelectedSlideIndex(idx)}
                  className={`w-full text-left flex items-start gap-3 rounded-xl p-2.5 transition-all ${
                    isSelected
                      ? 'bg-amber-500/15 border border-amber-500/40 text-white shadow-md'
                      : 'hover:bg-zinc-800/80 text-zinc-400 border border-transparent'
                  }`}
                >
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      isSelected
                        ? 'bg-amber-500 text-zinc-950 shadow'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}
                  >
                    {idx + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-xs font-bold truncate ${isSelected ? 'text-amber-300' : 'text-zinc-200'}`}>
                        {slide.title}
                      </span>
                      <Icon className={`h-3 w-3 shrink-0 ${isSelected ? 'text-amber-400' : 'text-zinc-500'}`} />
                    </div>
                    <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                      {slide.headline}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. CENTER CANVAS: Slide Preview & Inline Editor */}
        <div className="lg:col-span-6 space-y-6">
          {/* Main Slide Card Container */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedSlideIndex}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-6 shadow-xl space-y-6"
            >
              {/* Slide Header */}
              <div className="flex items-start justify-between gap-4 border-b border-zinc-800/80 pb-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                      SLIDE {currentSlide.slideNumber} OF 10
                    </span>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                      {currentSlide.category.replace('_', ' ')}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={currentSlide.title}
                    onChange={e => handleCurrentSlideChange('title', e.target.value)}
                    className="w-full text-xl font-extrabold text-white bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-amber-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* 1-Second Investor Headline */}
              <div className="space-y-1.5 bg-amber-500/5 p-3.5 rounded-xl border border-amber-500/20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  1-Second Investor Takeaway (Headline)
                </span>
                <textarea
                  rows={2}
                  value={currentSlide.headline}
                  onChange={e => handleCurrentSlideChange('headline', e.target.value)}
                  placeholder="The single most memorable thesis on this slide..."
                  className="w-full text-sm font-semibold text-amber-100 bg-transparent focus:outline-none resize-none leading-snug"
                />
              </div>

              {/* Bullet Points */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Key Slide Content
                  </span>
                  <button
                    type="button"
                    onClick={handleAddBullet}
                    className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300"
                  >
                    <Plus className="h-3 w-3" /> Add Point
                  </button>
                </div>

                <div className="space-y-2">
                  {currentSlide.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="group flex items-start gap-2 rounded-lg bg-zinc-900/50 p-2 border border-zinc-800 hover:border-zinc-700">
                      <span className="text-amber-500 font-bold text-xs mt-1">•</span>
                      <textarea
                        rows={2}
                        value={bullet}
                        onChange={e => handleBulletChange(bIdx, e.target.value)}
                        className="w-full text-xs text-zinc-200 bg-transparent focus:outline-none resize-none leading-relaxed"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteBullet(bIdx)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 transition-opacity"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual Recommendation Mockup */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                    <Grid className="h-3 w-3" /> Recommended Visual Layout: {currentSlide.visualRecommendation.layoutType}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {currentSlide.visualRecommendation.description}
                </p>
                {currentSlide.visualRecommendation.mockupVisualPrompt && (
                  <div className="rounded bg-zinc-900/80 p-2 text-[11px] text-zinc-400 border border-zinc-800 font-mono">
                    🎨 {currentSlide.visualRecommendation.mockupVisualPrompt}
                  </div>
                )}
              </div>

              {/* Key Data Points with Validation Status */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Key Metrics & Assumption Audit
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentSlide.keyDataPoints.map((dp, dpIdx) => (
                    <div
                      key={dpIdx}
                      className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <input
                          type="text"
                          value={dp.label}
                          onChange={e => handleDataPointChange(dpIdx, 'label', e.target.value)}
                          className="text-xs font-bold text-white bg-transparent focus:outline-none w-full"
                        />
                        <select
                          value={dp.status}
                          onChange={e => handleDataPointChange(dpIdx, 'status', e.target.value)}
                          className={`text-[9px] font-bold uppercase rounded px-1.5 py-0.5 border focus:outline-none ${
                            dp.status === 'validated'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : dp.status === 'assumption'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                          }`}
                        >
                          <option value="validated">VALIDATED</option>
                          <option value="assumption">ASSUMPTION</option>
                          <option value="missing">MISSING</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        value={dp.value}
                        onChange={e => handleDataPointChange(dpIdx, 'value', e.target.value)}
                        className="text-xs text-zinc-300 bg-transparent focus:outline-none w-full font-mono"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Founder Speaker Notes */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-zinc-400" /> Founder Speaker Script / Notes
                </span>
                <textarea
                  rows={3}
                  value={currentSlide.speakerNotes}
                  onChange={e => handleCurrentSlideChange('speakerNotes', e.target.value)}
                  placeholder="Spoken words to say during presentation..."
                  className="w-full text-xs text-zinc-300 bg-zinc-950/60 p-3 rounded-lg border border-zinc-800 focus:border-amber-500 focus:outline-none leading-relaxed"
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 3. RIGHT PANEL: AI Pitch Co-pilot Assistant */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Bot className="h-4 w-4" /> AI Pitch Co-Pilot
            </div>
            <p className="text-xs text-zinc-400">
              Refine Slide {currentSlide.slideNumber} with VC-level persuasion and executive precision.
            </p>

            {/* Quick Actions */}
            <div className="space-y-2">
              <button
                type="button"
                disabled={isAiLoading}
                onClick={() => handleAiAction('improve')}
                className="w-full flex items-center justify-between rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 px-3.5 py-2.5 text-xs font-semibold text-zinc-200 transition-all active:scale-98"
              >
                <span>⚡ Improve This Slide</span>
                <ArrowRight className="h-3.5 w-3.5 text-amber-400" />
              </button>

              <button
                type="button"
                disabled={isAiLoading}
                onClick={() => handleAiAction('strengthen_investor_arg')}
                className="w-full flex items-center justify-between rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 px-3.5 py-2.5 text-xs font-semibold text-zinc-200 transition-all active:scale-98"
              >
                <span>💼 Strengthen Investor Argument</span>
                <ArrowRight className="h-3.5 w-3.5 text-amber-400" />
              </button>

              <button
                type="button"
                disabled={isAiLoading}
                onClick={() => handleAiAction('find_unsupported')}
                className="w-full flex items-center justify-between rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 px-3.5 py-2.5 text-xs font-semibold text-zinc-200 transition-all active:scale-98"
              >
                <span>🔍 Find Unsupported Claims</span>
                <ArrowRight className="h-3.5 w-3.5 text-amber-400" />
              </button>

              <button
                type="button"
                disabled={isAiLoading}
                onClick={() => handleAiAction('suggest_layout')}
                className="w-full flex items-center justify-between rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 px-3.5 py-2.5 text-xs font-semibold text-zinc-200 transition-all active:scale-98"
              >
                <span>📐 Suggest Better Structure</span>
                <ArrowRight className="h-3.5 w-3.5 text-amber-400" />
              </button>

              <button
                type="button"
                disabled={isAiLoading}
                onClick={() => handleAiAction('explain_why_matters')}
                className="w-full flex items-center justify-between rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 px-3.5 py-2.5 text-xs font-semibold text-zinc-200 transition-all active:scale-98"
              >
                <span>💡 Why This Slide Matters</span>
                <ArrowRight className="h-3.5 w-3.5 text-amber-400" />
              </button>
            </div>

            {/* Custom Prompt Box */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <label className="block text-[11px] font-semibold text-zinc-300">
                Custom Instruction for PitchForge AI
              </label>
              <textarea
                rows={2}
                value={customAiPrompt}
                onChange={e => setCustomAiPrompt(e.target.value)}
                placeholder="e.g. Highlight B2B unit economics instead of consumer fees..."
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-2 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
              />
              <button
                type="button"
                disabled={isAiLoading || !customAiPrompt.trim()}
                onClick={() => handleAiAction('custom')}
                className="w-full rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 font-bold py-2 text-xs transition-colors"
              >
                {isAiLoading ? 'PitchForge AI is thinking...' : 'Execute Custom Prompt'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PENDING AI DIFF MODAL (Approval Workflow) */}
      {pendingDiff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-3xl w-full rounded-2xl border border-amber-500/40 bg-zinc-950 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white">
                  Review AI Improvements for Slide {currentSlide.slideNumber}
                </h2>
              </div>
              <button
                onClick={discardAiChanges}
                className="rounded-lg p-1 text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Strategic Rationale */}
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4 text-xs text-indigo-200 space-y-1">
              <span className="font-bold text-indigo-300">Strategic Rationale:</span>
              <p>{pendingDiff.explanation}</p>
            </div>

            {/* Changes Summary */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Summary of Refinements
              </span>
              <ul className="space-y-1 text-xs text-zinc-300">
                {pendingDiff.changesSummary.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Before vs After Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-72 overflow-y-auto p-1">
              {/* Current */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Current Slide
                </span>
                <p className="text-xs font-bold text-zinc-300">{currentSlide.headline}</p>
                <ul className="text-xs text-zinc-400 space-y-1">
                  {currentSlide.bullets.map((b, i) => (
                    <li key={i}>• {b}</li>
                  ))}
                </ul>
              </div>

              {/* Proposed */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  AI Proposed Slide
                </span>
                <p className="text-xs font-bold text-white">{pendingDiff.improvedSlide.headline}</p>
                <ul className="text-xs text-zinc-200 space-y-1">
                  {pendingDiff.improvedSlide.bullets.map((b, i) => (
                    <li key={i}>• {b}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Decision Bar */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={discardAiChanges}
                className="rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-4 py-2.5 text-xs font-semibold text-zinc-300"
              >
                Discard Changes
              </button>
              <button
                type="button"
                onClick={acceptAiChanges}
                className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-5 py-2.5 text-xs shadow-lg shadow-amber-500/20 active:scale-95"
              >
                <Check className="h-4 w-4 stroke-[3]" />
                Accept AI Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Link Settings Dialog */}
      {showShareModal && (
        <ShareModal
          project={project}
          onToggleShare={onToggleShare}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};
