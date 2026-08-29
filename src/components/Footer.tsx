import React from 'react';
import {
  Flame,
  Sparkles,
  ShieldCheck,
  Zap,
  Layers,
  Award,
  ArrowUp,
  FileSpreadsheet,
  Cpu,
  Database,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface FooterProps {
  onNavigate: (view: 'dashboard' | 'intake' | 'analysis' | 'studio' | 'score' | 'critique') => void;
  onNewPitch: () => void;
  onOpenSettings: () => void;
  hasActiveProject: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onNewPitch,
  onOpenSettings,
  hasActiveProject,
}) => {
  const { user, isAnonymous, signInWithGoogle, signOutUser } = useAuth();
  const isSignedIn = Boolean(user && !isAnonymous);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950/90 backdrop-blur text-zinc-400 mt-20">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-zinc-800/60">
          
          {/* Brand Info (2 columns wide on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 via-orange-600 to-rose-600 shadow-md shadow-orange-500/20">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                  PitchForge <span className="text-amber-400 font-extrabold">AI</span>
                </span>
                <span className="text-[10px] text-zinc-400 font-medium tracking-wide uppercase">
                  Evidence-First Pitch Engine
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Transform unstructured founder ideas into evidence-backed, 10-slide investor pitch decks evaluated against rigorous institutional venture capital rubrics.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 px-2.5 py-1 text-[11px] font-medium text-amber-300">
                <Zap className="h-3 w-3 text-amber-400" />
                <span>Gemini 3.7 Flash</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                <Database className="h-3 w-3 text-emerald-400" />
                <span>Firestore Cloud DB</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-2.5 py-1 text-[11px] font-medium text-indigo-300">
                <Lock className="h-3 w-3 text-indigo-400" />
                <span>Per-Account Isolation</span>
              </div>
            </div>
          </div>

          {/* Column 2: Studio Workflow */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
              Studio Workflow
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  {isSignedIn ? 'Founder Dashboard' : 'Overview & Features'}
                </button>
              </li>
              <li>
                <button
                  onClick={onNewPitch}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Create New Pitch
                </button>
              </li>
              {hasActiveProject && (
                <>
                  <li>
                    <button
                      onClick={() => onNavigate('analysis')}
                      className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                    >
                      Thesis & Assumptions
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onNavigate('studio')}
                      className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                    >
                      10-Slide Deck Studio
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onNavigate('score')}
                      className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                    >
                      VC Quality Score (70-100)
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onNavigate('critique')}
                      className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                    >
                      60-Sec Partner Critique
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Column 3: VC Standards */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
              VC Standards & Rules
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-amber-400"></span>
                <span>1-Second Takeaway Rule</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-amber-400"></span>
                <span>YC & Sequoia Narrative Arc</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-amber-400"></span>
                <span>Evidence vs Assumption Split</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-amber-400"></span>
                <span>Institutional Risk Rubric</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-amber-400"></span>
                <span>Target TAM / SAM / SOM</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Account & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
              Account & Storage
            </h4>
            <div className="space-y-2 text-xs">
              {isSignedIn ? (
                <div className="space-y-2">
                  <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-2.5">
                    <p className="text-[11px] text-zinc-400">Active Account</p>
                    <p className="text-xs font-medium text-white truncate">
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={() => signOutUser()}
                    className="text-xs text-rose-400 hover:underline cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-zinc-400">
                    Connect Google to persist pitches securely across devices.
                  </p>
                  <button
                    onClick={signInWithGoogle}
                    className="flex items-center gap-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 text-xs font-medium border border-zinc-700 transition cursor-pointer"
                  >
                    Sign In with Google
                  </button>
                </div>
              )}
              <div>
                <button
                  onClick={onOpenSettings}
                  className="text-zinc-400 hover:text-zinc-200 text-xs transition cursor-pointer"
                >
                  Workspace Settings
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-zinc-400">
              PitchForge AI Studio • All Systems Operational
            </span>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-zinc-400">
              Built for Founders & Accelerators
            </span>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
              title="Scroll to top"
            >
              <span>Back to top</span>
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
