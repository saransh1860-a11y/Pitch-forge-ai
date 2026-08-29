import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Grid,
} from 'lucide-react';
import { SlideData, PitchProject } from '../types/pitch';

interface PresentationModeProps {
  project: PitchProject;
  onClose: () => void;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({ project, onClose }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const slides = project.slides;
  const currentSlide: SlideData = slides[currentSlideIndex] || slides[0];

  // Pitch timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setCurrentSlideIndex(prev => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentSlideIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'n' || e.key === 'N') {
        setShowNotes(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950 text-white select-none">
      {/* Top Floating Control Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="font-bold text-amber-400 text-sm">
            {project.intake.startupName || 'PitchForge AI'}
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-xs text-zinc-400">
            Slide {currentSlideIndex + 1} of {slides.length}
          </span>
        </div>

        {/* Center: Timer */}
        <div className="flex items-center gap-2 rounded-full bg-zinc-800/80 border border-zinc-700/80 px-3 py-1 text-xs font-mono text-amber-300">
          <Clock className="h-3.5 w-3.5" />
          <span>{formatTime(elapsedSeconds)}</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNotes(prev => !prev)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
              showNotes
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Speaker Notes (N)</span>
          </button>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            title="Exit Fullscreen (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Slide Presentation Stage (16:9 aspect container) */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 overflow-hidden relative">
        <div className="w-full max-w-5xl aspect-[16/9] rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 p-8 sm:p-12 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          {/* Slide Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-400">
                0{currentSlide.slideNumber} • {currentSlide.category.toUpperCase().replace('_', ' ')}
              </span>
              <span className="text-xs font-semibold text-zinc-500">
                {project.intake.startupName}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {currentSlide.title}
            </h1>

            <p className="text-base sm:text-xl font-semibold text-amber-300/90 leading-snug">
              {currentSlide.headline}
            </p>
          </div>

          {/* Slide Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-auto pt-4">
            {/* Left: Bullets */}
            <div className="space-y-4">
              {currentSlide.bullets.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold mt-0.5">
                    ✓
                  </div>
                  <p className="text-sm sm:text-base text-zinc-200 leading-relaxed">
                    {bullet}
                  </p>
                </div>
              ))}
            </div>

            {/* Right: Key Metrics / Layout Visual Mockup */}
            <div className="space-y-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-5 flex flex-col justify-center">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Grid className="h-3.5 w-3.5" /> {currentSlide.visualRecommendation.description}
              </div>

              {/* Data points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {currentSlide.keyDataPoints.map((dp, idx) => (
                  <div key={idx} className="rounded-xl bg-zinc-900/80 p-3 border border-zinc-800 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 block truncate">{dp.label}</span>
                    <span className="text-sm font-extrabold text-white block">{dp.value}</span>
                    <span
                      className={`inline-block text-[9px] font-bold uppercase rounded px-1.5 py-0.5 border ${
                        dp.status === 'validated'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : dp.status === 'assumption'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                      }`}
                    >
                      {dp.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Slide Footer */}
          <div className="flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-800/60 pt-4">
            <span>PitchForge AI • Pitch Strategy Studio</span>
            <div className="flex items-center gap-1">
              {slides.map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`h-1.5 rounded-full cursor-pointer transition-all ${
                    idx === currentSlideIndex
                      ? 'w-6 bg-amber-500'
                      : 'w-1.5 bg-zinc-700 hover:bg-zinc-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Floating Speaker Notes Panel */}
        {showNotes && (
          <div className="absolute bottom-6 right-6 max-w-md w-full rounded-2xl border border-indigo-500/40 bg-zinc-950/95 p-5 shadow-2xl backdrop-blur-md space-y-3 animate-in fade-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4" /> Founder Speaker Script
              </span>
              <button
                onClick={() => setShowNotes(false)}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-zinc-200 leading-relaxed font-sans max-h-48 overflow-y-auto">
              {currentSlide.speakerNotes || 'No speaker script set for this slide.'}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Navigation Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800/80 bg-zinc-900/60">
        <button
          onClick={() => setCurrentSlideIndex(prev => Math.max(prev - 1, 0))}
          disabled={currentSlideIndex === 0}
          className="flex items-center gap-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 px-4 py-2 text-xs font-semibold transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous Slide</span>
        </button>

        <div className="text-xs text-zinc-400">
          Use <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300 font-mono text-[10px] border border-zinc-700">←</kbd> / <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300 font-mono text-[10px] border border-zinc-700">→</kbd> or <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300 font-mono text-[10px] border border-zinc-700">Space</kbd>
        </div>

        <button
          onClick={() => setCurrentSlideIndex(prev => Math.min(prev + 1, slides.length - 1))}
          disabled={currentSlideIndex === slides.length - 1}
          className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 font-bold px-5 py-2 text-xs transition-colors"
        >
          <span>Next Slide</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
