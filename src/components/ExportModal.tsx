import React, { useState } from 'react';
import {
  Download,
  X,
  FileText,
  Check,
  Award,
  Layers,
  Sparkles,
  CheckCircle2,
  FileSpreadsheet,
  Settings2,
  Eye,
  Info,
  FileDown,
  Globe,
  Loader2,
  Building2,
  TrendingUp,
  Target,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { PitchProject } from '../types/pitch';
import {
  downloadPitchDeckPdf,
  downloadStandaloneHtmlPresentation,
  downloadOnePagerPdf,
  downloadOnePagerHtml,
} from '../services/pdfExportService';

interface ExportModalProps {
  project: PitchProject;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ project, onClose }) => {
  const [activeTab, setActiveTab] = useState<'deck' | 'onepager'>('deck');
  const [includeSpeakerNotes, setIncludeSpeakerNotes] = useState(true);
  const [includeScorecard, setIncludeScorecard] = useState(true);
  const [includeVisualGuidance, setIncludeVisualGuidance] = useState(true);

  // Loading & Success states for Deck
  const [isGeneratingDeckPdf, setIsGeneratingDeckPdf] = useState(false);
  const [deckPdfSuccess, setDeckPdfSuccess] = useState(false);

  // Loading & Success states for Memo
  const [isGeneratingMemoPdf, setIsGeneratingMemoPdf] = useState(false);
  const [memoPdfSuccess, setMemoPdfSuccess] = useState(false);

  const [exportError, setExportError] = useState<string | null>(null);

  // 10-Slide Deck PDF Download
  const handleDownloadDeckPdf = async () => {
    setIsGeneratingDeckPdf(true);
    setExportError(null);
    try {
      await downloadPitchDeckPdf(project, {
        includeSpeakerNotes,
        includeScorecard,
        includeVisualGuidance,
      });
      setDeckPdfSuccess(true);
      setTimeout(() => setDeckPdfSuccess(false), 3000);
    } catch (err: any) {
      console.error('Deck PDF Generation error:', err);
      setExportError(err.message || 'Failed to generate slide deck PDF.');
    } finally {
      setIsGeneratingDeckPdf(false);
    }
  };

  // 10-Slide Deck Standalone HTML Presentation Download
  const handleDownloadDeckHtml = () => {
    try {
      downloadStandaloneHtmlPresentation(project);
    } catch (err: any) {
      console.error('Deck HTML Export error:', err);
      setExportError(err.message || 'Failed to export HTML presentation.');
    }
  };

  // 1-Page Memo PDF Download
  const handleDownloadMemoPdf = async () => {
    setIsGeneratingMemoPdf(true);
    setExportError(null);
    try {
      await downloadOnePagerPdf(project);
      setMemoPdfSuccess(true);
      setTimeout(() => setMemoPdfSuccess(false), 3000);
    } catch (err: any) {
      console.error('Memo PDF Generation error:', err);
      setExportError(err.message || 'Failed to generate 1-Page Executive Memo PDF.');
    } finally {
      setIsGeneratingMemoPdf(false);
    }
  };

  // 1-Page Memo Standalone HTML Download
  const handleDownloadMemoHtml = () => {
    try {
      downloadOnePagerHtml(project);
    } catch (err: any) {
      console.error('Memo HTML Export error:', err);
      setExportError(err.message || 'Failed to export 1-Page Memo HTML.');
    }
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const probSlide = project.slides.find((s) => s.category === 'problem');
  const solSlide = project.slides.find((s) => s.category === 'solution');
  const marketSlide = project.slides.find((s) => s.category === 'market');
  const bizSlide = project.slides.find((s) => s.category === 'business_model');
  const tracSlide = project.slides.find((s) => s.category === 'traction');
  const compSlide = project.slides.find((s) => s.category === 'competition');
  const askSlide = project.slides.find((s) => s.category === 'team_ask');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 print:p-0 print:bg-white print:static">
      <div className="max-w-4xl w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 print:max-w-none print:w-full print:border-none print:shadow-none print:p-0 print:bg-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 no-print">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Download className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Export Investor Materials</h2>
              <p className="text-xs text-zinc-400">
                Download high-fidelity 10-slide deck or 1-page executive deal memo as vector PDF and offline HTML.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 no-print">
          <button
            onClick={() => setActiveTab('deck')}
            className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'deck'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <FileDown className="h-4 w-4 text-amber-400" />
            <span>10-Slide Investor Deck</span>
            <span className="rounded-md bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
              {project.slides.length} Slides
            </span>
          </button>

          <button
            onClick={() => setActiveTab('onepager')}
            className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'onepager'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <FileText className="h-4 w-4 text-emerald-400" />
            <span>1-Page Executive Memo</span>
            <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-400 font-bold">
              Deal Sheet
            </span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="max-h-[70vh] overflow-y-auto pr-1">
          {/* ======================================================== */}
          {/* TAB 1: 10-SLIDE INVESTOR DECK                            */}
          {/* ======================================================== */}
          {activeTab === 'deck' && (
            <div className="space-y-6">
              {/* Action Banner */}
              <div className="rounded-xl bg-zinc-900/90 border border-zinc-800 p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <FileDown className="h-4 w-4 text-amber-400" />
                      10-Slide Investor Pitch Deck
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Direct vector 16:9 PDF file or standalone interactive offline HTML presentation.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Direct PDF Download */}
                    <button
                      onClick={handleDownloadDeckPdf}
                      disabled={isGeneratingDeckPdf}
                      className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-extrabold px-5 py-2.5 text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingDeckPdf ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
                          <span>Generating PDF...</span>
                        </>
                      ) : deckPdfSuccess ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-zinc-950" />
                          <span>PDF Downloaded!</span>
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          <span>Download as PDF</span>
                        </>
                      )}
                    </button>

                    {/* Standalone HTML Download */}
                    <button
                      onClick={handleDownloadDeckHtml}
                      title="Download offline HTML presentation package"
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-4 py-2.5 text-xs font-semibold active:scale-95 transition-all cursor-pointer"
                    >
                      <Globe className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Download as HTML</span>
                    </button>
                  </div>
                </div>

                {/* PDF Configuration Options */}
                <div className="pt-3 border-t border-zinc-800 flex flex-wrap items-center gap-4 text-xs">
                  <span className="text-zinc-400 font-medium text-[11px] flex items-center gap-1">
                    <Settings2 className="h-3.5 w-3.5 text-amber-400" />
                    Deck Options:
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={includeSpeakerNotes}
                      onChange={(e) => setIncludeSpeakerNotes(e.target.checked)}
                      className="rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-amber-500/30"
                    />
                    <span>Include Founder Speaker Scripts</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={includeScorecard}
                      onChange={(e) => setIncludeScorecard(e.target.checked)}
                      className="rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-amber-500/30"
                    />
                    <span>Include VC Scorecard & Review</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={includeVisualGuidance}
                      onChange={(e) => setIncludeVisualGuidance(e.target.checked)}
                      className="rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-amber-500/30"
                    />
                    <span>Include Layout Guidance</span>
                  </label>
                </div>
              </div>

              {exportError && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                  {exportError}
                </div>
              )}

              {/* Printable / Viewable Deck Document Preview */}
              <div className="space-y-8">
                {/* 1. COVER PAGE PREVIEW */}
                <div className="rounded-2xl border-2 border-zinc-800 bg-zinc-950 p-8 space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 mb-3">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Institutional Investor Presentation</span>
                      </div>
                      <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                        {project.intake.startupName}
                      </h1>
                      <p className="text-base text-zinc-300 font-medium mt-1.5 max-w-2xl leading-relaxed">
                        {project.intake.tagline || project.intake.rawIdea}
                      </p>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        Date & Version
                      </div>
                      <div className="text-sm font-semibold text-white">
                        {formattedDate} • v{project.currentVersion}
                      </div>
                      {project.score && (
                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400 mt-1">
                          <Award className="h-3.5 w-3.5" />
                          <span>VC Readiness: {project.score.overallScore}/100</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metadata Chips Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-xl bg-zinc-900/80 p-3.5 border border-zinc-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                        Funding Stage
                      </span>
                      <span className="text-sm font-bold text-white mt-0.5 block">
                        {project.intake.stage}
                      </span>
                    </div>

                    <div className="rounded-xl bg-zinc-900/80 p-3.5 border border-zinc-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                        Business Model
                      </span>
                      <span className="text-sm font-bold text-white mt-0.5 block truncate">
                        {project.intake.businessModel}
                      </span>
                    </div>

                    <div className="rounded-xl bg-zinc-900/80 p-3.5 border border-zinc-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                        Target Market
                      </span>
                      <span className="text-sm font-bold text-white mt-0.5 block truncate">
                        {project.intake.geography || 'Global'}
                      </span>
                    </div>

                    <div className="rounded-xl bg-zinc-900/80 p-3.5 border border-zinc-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                        Deck Structure
                      </span>
                      <span className="text-sm font-bold text-white mt-0.5 block">
                        10-Slide Standard Flow
                      </span>
                    </div>
                  </div>

                  {/* High Level Thesis Summary */}
                  {project.analysis && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                      <div className="rounded-xl bg-zinc-900/40 p-4 border border-zinc-800/80 space-y-1.5">
                        <span className="text-[10px] font-extrabold uppercase text-rose-400 tracking-wider">
                          Core Problem Solved
                        </span>
                        <p className="text-zinc-300 leading-relaxed font-medium">
                          {project.analysis.coreProblem}
                        </p>
                      </div>

                      <div className="rounded-xl bg-zinc-900/40 p-4 border border-zinc-800/80 space-y-1.5">
                        <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider">
                          Value Proposition & Moat
                        </span>
                        <p className="text-zinc-300 leading-relaxed font-medium">
                          {project.analysis.valueProposition}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. THE 10 SLIDES */}
                <div className="space-y-6">
                  {project.slides.map((slide, index) => (
                    <div
                      key={slide.id || index}
                      className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-5 shadow-md relative overflow-hidden"
                    >
                      {/* Slide Header Strip */}
                      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500 text-zinc-950 text-xs font-black">
                            {slide.slideNumber}
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                            {slide.category.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-zinc-400">
                          Slide {slide.slideNumber} of {project.slides.length}
                        </span>
                      </div>

                      {/* Slide Title & 1-Second Takeaway */}
                      <div className="space-y-1">
                        <h3 className="text-xl font-black text-white tracking-tight">
                          {slide.title}
                        </h3>
                        <p className="text-xs font-semibold text-amber-400 italic">
                          "{slide.headline}"
                        </p>
                      </div>

                      {/* 2-Column Content Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                        {/* Left Column: Narrative Arguments */}
                        <div className="md:col-span-7 space-y-2.5 rounded-xl bg-zinc-900/60 p-4 border border-zinc-800/80">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block">
                            Key Arguments & Evidence
                          </span>
                          <ul className="space-y-2 text-xs">
                            {slide.bullets.map((bullet, bIdx) => (
                              <li key={bIdx} className="flex items-start gap-2 text-zinc-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                <span className="leading-relaxed">{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Right Column: Metrics & Layout Guidance */}
                        <div className="md:col-span-5 space-y-3">
                          {slide.keyDataPoints.length > 0 && (
                            <div className="space-y-2 rounded-xl bg-zinc-900/60 p-3.5 border border-zinc-800/80">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block">
                                Metrics & Validation
                              </span>
                              <div className="grid grid-cols-2 gap-2">
                                {slide.keyDataPoints.map((dp, dpIdx) => (
                                  <div
                                    key={dpIdx}
                                    className="rounded-lg bg-zinc-950 p-2 border border-zinc-800"
                                  >
                                    <span className="text-[9px] text-zinc-400 block truncate">
                                      {dp.label}
                                    </span>
                                    <span className="text-xs font-bold text-white block truncate">
                                      {dp.value}
                                    </span>
                                    <span
                                      className={`text-[8px] font-extrabold uppercase mt-0.5 inline-block ${
                                        dp.status === 'validated'
                                          ? 'text-emerald-400'
                                          : dp.status === 'assumption'
                                          ? 'text-amber-400'
                                          : 'text-indigo-400'
                                      }`}
                                    >
                                      {dp.status}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {includeVisualGuidance && (
                            <div className="rounded-xl bg-indigo-950/20 p-3 border border-indigo-500/20 space-y-1">
                              <span className="text-[9px] font-extrabold uppercase tracking-wider text-indigo-400 block">
                                Visual Guidance
                              </span>
                              <p className="text-[11px] text-zinc-300 leading-relaxed">
                                {slide.visualRecommendation.description}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Founder Speaker Script */}
                      {includeSpeakerNotes && (
                        <div className="rounded-xl bg-zinc-900/40 p-3.5 border border-zinc-800/80 space-y-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 block">
                            Founder Speaker Script (60-90s)
                          </span>
                          <p className="text-xs text-zinc-300 italic leading-relaxed">
                            "{slide.speakerNotes}"
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: 1-PAGE EXECUTIVE MEMO (DEAL SHEET)                */}
          {/* ======================================================== */}
          {activeTab === 'onepager' && (
            <div className="space-y-6">
              {/* Action Banner */}
              <div className="rounded-xl bg-zinc-900/90 border border-zinc-800 p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <FileText className="h-4 w-4 text-emerald-400" />
                      1-Page Executive Deal Memo
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Single-page executive deal sheet for partners, angel syndicates, and investor intros.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Memo PDF Download */}
                    <button
                      onClick={handleDownloadMemoPdf}
                      disabled={isGeneratingMemoPdf}
                      className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-extrabold px-5 py-2.5 text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingMemoPdf ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
                          <span>Generating PDF...</span>
                        </>
                      ) : memoPdfSuccess ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-zinc-950" />
                          <span>Memo Downloaded!</span>
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          <span>Download 1-Page Memo (.PDF)</span>
                        </>
                      )}
                    </button>

                    {/* Memo HTML Download */}
                    <button
                      onClick={handleDownloadMemoHtml}
                      title="Download offline HTML 1-Page Memo"
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-4 py-2.5 text-xs font-semibold active:scale-95 transition-all cursor-pointer"
                    >
                      <Globe className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Download as HTML</span>
                    </button>
                  </div>
                </div>
              </div>

              {exportError && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                  {exportError}
                </div>
              )}

              {/* 1-Page Memo Visual Preview */}
              <div className="rounded-2xl border-2 border-zinc-800 bg-zinc-950 p-6 space-y-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500" />

                {/* Memo Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                  <div>
                    <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      Executive Deal Memo
                    </span>
                    <h2 className="text-2xl font-black text-white mt-1.5">
                      {project.intake.startupName}
                    </h2>
                    <p className="text-xs text-zinc-300 italic mt-0.5">
                      {project.intake.tagline || project.intake.rawIdea}
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="text-xs font-medium text-zinc-400 block">
                      {project.intake.stage} • {project.intake.geography || 'Global'}
                    </span>
                    {project.score && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-xs font-bold text-amber-400">
                        <Award className="h-3 w-3" />
                        Score: {project.score.overallScore}/100 ({project.score.tier})
                      </span>
                    )}
                  </div>
                </div>

                {/* Key Metadata Quick Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl bg-zinc-900/80 p-3 border border-zinc-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                      Business Model
                    </span>
                    <span className="text-xs font-bold text-white block mt-0.5">
                      {project.intake.businessModel}
                    </span>
                  </div>

                  <div className="rounded-xl bg-zinc-900/80 p-3 border border-zinc-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                      Target Market
                    </span>
                    <span className="text-xs font-bold text-white block mt-0.5 truncate">
                      {project.analysis?.marketOpportunity?.tamEstimate
                        ? `TAM: ${project.analysis.marketOpportunity.tamEstimate}`
                        : project.intake.targetCustomer}
                    </span>
                  </div>

                  <div className="rounded-xl bg-zinc-900/80 p-3 border border-zinc-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                      Evaluation Date
                    </span>
                    <span className="text-xs font-bold text-white block mt-0.5">
                      {formattedDate}
                    </span>
                  </div>
                </div>

                {/* Core 2x3 Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Problem */}
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                    <strong className="text-rose-400 font-bold uppercase tracking-wider block text-[11px]">
                      1. Problem & Customer Pain Points
                    </strong>
                    <p className="text-zinc-300 leading-relaxed">
                      {project.analysis?.coreProblem || project.intake.problem}
                    </p>
                    {probSlide && probSlide.bullets.length > 0 && (
                      <ul className="space-y-1 text-zinc-400 pt-1 border-t border-zinc-800/80">
                        {probSlide.bullets.slice(0, 2).map((b, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-rose-400">•</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Solution */}
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                    <strong className="text-emerald-400 font-bold uppercase tracking-wider block text-[11px]">
                      2. Solution & Value Proposition
                    </strong>
                    <p className="text-zinc-300 leading-relaxed">
                      {project.analysis?.valueProposition || project.intake.solution}
                    </p>
                    {solSlide && solSlide.bullets.length > 0 && (
                      <ul className="space-y-1 text-zinc-400 pt-1 border-t border-zinc-800/80">
                        {solSlide.bullets.slice(0, 2).map((b, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-400">•</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Market Size */}
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                    <strong className="text-indigo-400 font-bold uppercase tracking-wider block text-[11px]">
                      3. Market Opportunity & Sizing
                    </strong>
                    <p className="text-zinc-300 leading-relaxed">
                      {project.analysis?.marketOpportunity?.tamEstimate
                        ? `TAM: ${project.analysis.marketOpportunity.tamEstimate} | SAM: ${project.analysis.marketOpportunity.samEstimate || 'N/A'} | SOM: ${project.analysis.marketOpportunity.somEstimate || 'N/A'}`
                        : project.intake.targetCustomer}
                    </p>
                    {marketSlide && marketSlide.bullets.length > 0 && (
                      <ul className="space-y-1 text-zinc-400 pt-1 border-t border-zinc-800/80">
                        {marketSlide.bullets.slice(0, 2).map((b, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-indigo-400">•</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Business Model */}
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                    <strong className="text-sky-400 font-bold uppercase tracking-wider block text-[11px]">
                      4. Business Model & Monetization
                    </strong>
                    <p className="text-zinc-300 leading-relaxed">
                      {project.analysis?.businessModel || project.intake.businessModel}
                    </p>
                    {bizSlide && bizSlide.bullets.length > 0 && (
                      <ul className="space-y-1 text-zinc-400 pt-1 border-t border-zinc-800/80">
                        {bizSlide.bullets.slice(0, 2).map((b, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-sky-400">•</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Traction */}
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                    <strong className="text-purple-400 font-bold uppercase tracking-wider block text-[11px]">
                      5. Traction & Key Milestones
                    </strong>
                    <p className="text-zinc-300 leading-relaxed">
                      {project.intake.existingTraction || 'Early adoption and engagement milestones.'}
                    </p>
                    {tracSlide && tracSlide.bullets.length > 0 && (
                      <ul className="space-y-1 text-zinc-400 pt-1 border-t border-zinc-800/80">
                        {tracSlide.bullets.slice(0, 2).map((b, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-purple-400">•</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Competitive Advantage */}
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                    <strong className="text-pink-400 font-bold uppercase tracking-wider block text-[11px]">
                      6. Competitive Advantage & Moat
                    </strong>
                    <p className="text-zinc-300 leading-relaxed">
                      {project.analysis?.differentiation || project.intake.competitiveAdvantage || 'Defensible product architecture.'}
                    </p>
                    {compSlide && compSlide.bullets.length > 0 && (
                      <ul className="space-y-1 text-zinc-400 pt-1 border-t border-zinc-800/80">
                        {compSlide.bullets.slice(0, 2).map((b, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-pink-400">•</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Bottom Panel: Team & VC Review */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2 border-t border-zinc-800">
                  <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
                    <strong className="text-yellow-400 font-bold uppercase tracking-wider block text-[11px]">
                      7. Team & Capital Requirements
                    </strong>
                    <p className="text-zinc-300">
                      {project.intake.teamInfo || 'Founding team with deep domain experience.'}
                    </p>
                    <p className="text-zinc-400 font-medium">
                      {askSlide ? askSlide.headline : '18-month roadmap to achieve scale milestones.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
                    <strong className="text-amber-400 font-bold uppercase tracking-wider block text-[11px]">
                      8. VC Investment Verdict
                    </strong>
                    <p className="text-zinc-200 font-semibold italic">
                      "{project.critique?.sixtySecondVerdict || 'Strong institutional narrative readiness.'}"
                    </p>
                    {project.critique && (
                      <p className="text-zinc-400 text-[10px]">
                        <strong>Strongest Asset:</strong> {project.critique.strongestPart}
                      </p>
                    )}
                  </div>
                </div>

                {/* Memo Footer */}
                <div className="flex items-center justify-between text-[10px] text-zinc-500 border-t border-zinc-800/80 pt-3">
                  <span>PitchForge AI • Executive Deal Memo</span>
                  <span>Strictly Confidential</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
