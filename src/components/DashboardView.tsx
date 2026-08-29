import React from 'react';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  Clock,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  ShieldCheck,
  Database,
  Flame,
  Zap,
  Target,
  FileSpreadsheet,
} from 'lucide-react';
import { PitchProject } from '../types/pitch';
import { useAuth } from '../contexts/AuthContext';

interface DashboardViewProps {
  projects: PitchProject[];
  onNewPitch: () => void;
  onOpenProject: (project: PitchProject) => void;
  onDeleteProject: (id: string, e: React.MouseEvent) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  onNewPitch,
  onOpenProject,
  onDeleteProject,
}) => {
  const { user, isAnonymous, signInWithGoogle } = useAuth();
  const isSignedIn = Boolean(user && !isAnonymous);

  // Compute Dashboard Statistics (only for signed-in users)
  const totalPitches = projects.length;
  const pitchesGenerated = projects.filter((p) => p.slides && p.slides.length > 0).length;

  const scoredProjects = projects.filter((p) => p.score?.overallScore);
  const avgScore =
    scoredProjects.length > 0
      ? Math.round(
          scoredProjects.reduce((acc, p) => acc + (p.score?.overallScore || 0), 0) /
            scoredProjects.length
        )
      : 0;

  const lastEditedProject =
    projects.length > 0
      ? projects
          .slice()
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]
      : null;

  // --------------------------------------------------------------------------
  // 1. SIGNED-IN STATE: Full Personalized Dashboard & Recent Pitch Projects
  // --------------------------------------------------------------------------
  if (isSignedIn) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-10">
        {/* User Hero Header */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 via-zinc-900/40 to-zinc-950 p-6 sm:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 h-96 w-96 rounded-full bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-12 h-64 w-64 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Signed in as {user?.displayName || user?.email || 'Founder'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                {user?.displayName ? user.displayName.split(' ')[0] : 'Founder'}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">
              Manage your investor decks, track VC evaluation scores, and generate new pitches backed by
              Gemini 3.7 Flash and Firestore real-time persistence.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onNewPitch}
                className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-5 py-3 text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                Create New Pitch
              </button>
            </div>
          </div>
        </div>

        {/* Real Statistics Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-sm hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
              <span>Total Pitches</span>
              <Layers className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-white">{totalPitches}</span>
              <span className="text-xs text-zinc-400">projects</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-sm hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
              <span>Pitches Generated</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-white">{pitchesGenerated}</span>
              <span className="text-xs text-zinc-400">10-slide decks</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-sm hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
              <span>Avg Investor Score</span>
              <Award className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-amber-400">
                {avgScore > 0 ? `${avgScore}/100` : '—'}
              </span>
              <span className="text-xs text-zinc-400">
                {avgScore >= 80 ? 'Seed Ready' : avgScore >= 65 ? 'Pre-Seed Ready' : 'Evaluated'}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-sm hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
              <span>Last Edited</span>
              <Clock className="h-4 w-4 text-rose-400" />
            </div>
            <div className="mt-3 truncate">
              <span className="text-sm font-semibold text-white truncate block">
                {lastEditedProject
                  ? lastEditedProject.intake.startupName || 'Untitled Pitch'
                  : 'No projects yet'}
              </span>
              <span className="text-xs text-zinc-400">
                {lastEditedProject
                  ? new Date(lastEditedProject.updatedAt).toLocaleDateString()
                  : 'Ready to build'}
              </span>
            </div>
          </div>
        </div>

        {/* My Pitch Projects Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">My Pitch Projects</h2>
              <p className="text-xs text-zinc-400">
                Manage, edit, and iterate on your saved investor decks
              </p>
            </div>
            {projects.length > 0 && (
              <button
                onClick={onNewPitch}
                className="flex items-center gap-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold px-3 py-1.5 border border-zinc-700 transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                New Pitch
              </button>
            )}
          </div>

          {projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 p-10 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800/80 text-amber-400 border border-zinc-700">
                <FileText className="h-7 w-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-semibold text-white">No pitch projects yet</h3>
                <p className="text-xs text-zinc-400">
                  Create a new pitch to begin analyzing your market, structuring your 10-slide narrative,
                  and generating slide decks.
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={onNewPitch}
                  className="rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-4 py-2 text-xs shadow cursor-pointer"
                >
                  + Create First Pitch
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((project) => {
                const hasScore = project.score?.overallScore !== undefined;
                const hasSlides = project.slides && project.slides.length > 0;
                const score = project.score?.overallScore || 0;

                return (
                  <div
                    key={project.id}
                    onClick={() => onOpenProject(project)}
                    className="group relative flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900/90 hover:border-zinc-700 p-5 shadow-sm hover:shadow-xl transition-all cursor-pointer"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                            {project.intake.startupName || 'Untitled Pitch'}
                          </h3>
                          <p className="text-xs text-zinc-400 line-clamp-1">
                            {project.intake.tagline ||
                              project.intake.rawIdea?.slice(0, 70) ||
                              'Early-stage startup'}
                          </p>
                        </div>

                        {hasScore ? (
                          <div
                            className={`shrink-0 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold border ${
                              score >= 80
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : score >= 65
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            <Award className="h-3 w-3" />
                            <span>{score}/100</span>
                          </div>
                        ) : (
                          <span className="shrink-0 rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400 border border-zinc-700">
                            {project.status.toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-400">
                        <span className="rounded bg-zinc-800/80 px-2 py-0.5 border border-zinc-700/60">
                          {project.intake.stage || 'Idea'}
                        </span>
                        {hasSlides && (
                          <span className="rounded bg-indigo-500/10 text-indigo-300 px-2 py-0.5 border border-indigo-500/20">
                            10 Slides Ready
                          </span>
                        )}
                        <span className="text-zinc-500">• v{project.currentVersion}</span>
                      </div>

                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {project.analysis?.valueProposition ||
                          project.intake.problem ||
                          project.intake.rawIdea ||
                          'No description provided.'}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-zinc-500">
                        Edited {new Date(project.updatedAt).toLocaleDateString()}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => onDeleteProject(project.id, e)}
                          title="Delete project"
                          className="rounded p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <span className="flex items-center gap-1 font-semibold text-amber-400 group-hover:translate-x-0.5 transition-transform">
                          Open Studio <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 2. UNSIGNED STATE: Clean Landing View (No Dashboard & No Recent Pitches)
  // --------------------------------------------------------------------------
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 space-y-16">
      {/* Hero Presentation */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 via-zinc-900/50 to-zinc-950 p-8 sm:p-14 shadow-2xl text-center space-y-8">
        <div className="absolute top-0 right-1/4 -mt-16 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-16 h-80 w-80 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-600 to-rose-600 shadow-xl shadow-orange-500/20 mb-2">
          <Flame className="h-8 w-8 text-white" />
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-xs font-semibold text-amber-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>AI Pitch Strategist for Founders</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Build a pitch{' '}
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
              investors understand.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl mx-auto">
            Transform messy, unstructured startup thoughts into an evidence-oriented 10-slide pitch deck
            with Gemini 3.7 Flash, quantitative data points, and investor evaluation rubrics.
          </p>
        </div>

        {/* Primary Call to Action */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 max-w-md mx-auto">
          <button
            onClick={onNewPitch}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-6 py-3.5 text-sm shadow-xl shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Create Your Pitch</span>
          </button>

          <button
            onClick={signInWithGoogle}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-6 py-3.5 text-sm border border-zinc-700 shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Sign In with Google</span>
          </button>
        </div>
      </div>

      {/* 4 Feature Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Zap className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-white">Intake & Thesis Analysis</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Distill raw, messy startup ideas into clear customer pain points, value propositions, and unfair advantages.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Target className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-white">Assumptions vs Evidence</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Automatically detect unverified market claims and map structured evidence needed before meeting investors.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Layers className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-white">10-Slide Deck Studio</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Structured narrative slides with 1-second takeaway headlines, quantitative data cards, and founder scripts.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-white">60-Second VC Review</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Rigorous 7-dimension scoring rubric with partner-level verdict, existential risks, and improvement suggestions.
          </p>
        </div>
      </div>

      {/* Cloud Persistence Banner */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Sync & Save Your Pitches to Firestore</h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              Sign in with your Google account to access your personal dashboard, pitch deck revisions, and PDF exports.
            </p>
          </div>
        </div>

        <button
          onClick={signInWithGoogle}
          className="shrink-0 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-bold px-5 py-2.5 text-xs shadow transition-all cursor-pointer"
        >
          Connect Google Account
        </button>
      </div>
    </div>
  );
};
