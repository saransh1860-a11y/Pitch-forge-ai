import React, { useState } from 'react';
import {
  Flame,
  LayoutDashboard,
  Layers,
  Settings,
  Presentation,
  LogOut,
  User as UserIcon,
  Cloud,
  CheckCircle2,
  Database,
  CloudCheck,
} from 'lucide-react';
import { PitchProject } from '../types/pitch';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  currentView: 'dashboard' | 'intake' | 'analysis' | 'studio' | 'score' | 'critique';
  setCurrentView: (view: 'dashboard' | 'intake' | 'analysis' | 'studio' | 'score' | 'critique') => void;
  activeProject: PitchProject | null;
  onNewPitch: () => void;
  onOpenSettings: () => void;
  onOpenPresentation: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  activeProject,
  onNewPitch,
  onOpenSettings,
  onOpenPresentation,
}) => {
  const { user, loading, isAnonymous, syncStatus, signInWithGoogle, signOutUser } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setAuthError(null);
    try {
      const res = await signInWithGoogle();
      if (!res.success && !res.cancelled && res.error) {
        setAuthError(res.error);
      }
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        setAuthError(err.message || 'Failed to sign in with Google');
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="group flex items-center gap-3 text-left focus:outline-none cursor-pointer"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 via-orange-600 to-rose-600 shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform duration-200">
              <Flame className="h-5 w-5 text-white" />
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 border-2 border-zinc-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  PitchForge<span className="text-amber-500">AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-emerald-950/60 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-800/60">
                  <Database className="h-2.5 w-2.5" />
                  Firestore Synced
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                Investor pitch builder with cloud persistence
              </p>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {user && !isAnonymous && (
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all cursor-pointer ${
                  currentView === 'dashboard'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </button>
            )}

            {activeProject && (
              <button
                onClick={() => setCurrentView('studio')}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all cursor-pointer ${
                  currentView === 'studio' || currentView === 'analysis' || currentView === 'score' || currentView === 'critique'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`}
              >
                <Layers className="h-4 w-4" />
                <span className="truncate max-w-[140px]">{activeProject.intake.startupName || 'Active Pitch'}</span>
              </button>
            )}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {activeProject && activeProject.slides.length > 0 && (
            <button
              onClick={onOpenPresentation}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 hover:text-white transition-all active:scale-95 cursor-pointer"
            >
              <Presentation className="h-3.5 w-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Present</span>
            </button>
          )}

          {/* New Pitch CTA */}
          <button
            onClick={onNewPitch}
            className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold px-3.5 py-1.5 text-xs transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            + New Pitch
          </button>

          {/* Firebase Auth Controls */}
          {!loading && (
            <div className="relative">
              {user && !isAnonymous ? (
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 rounded-lg bg-zinc-900 border border-zinc-700/80 px-2.5 py-1 text-xs hover:border-amber-500/40 transition-all cursor-pointer"
                  title={user.email || 'User Profile'}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="h-6 w-6 rounded-full border border-amber-500/50 object-cover"
                    />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-zinc-950 font-bold text-[10px]">
                      {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <span className="hidden lg:inline text-zinc-300 max-w-[110px] truncate text-[11px] font-medium">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  <span className="h-2 w-2 rounded-full bg-emerald-400" title="Firestore Connected" />
                </button>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 px-3 py-1.5 text-xs font-medium transition-all cursor-pointer"
                  title="Sign in with Google to sync pitches across devices"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
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
                  <span className="hidden sm:inline">Google Sync</span>
                </button>
              )}

              {/* User Dropdown */}
              {showUserMenu && user && !isAnonymous && (
                <div className="absolute right-0 mt-2 w-60 rounded-xl border border-zinc-800 bg-zinc-900 p-2 shadow-2xl z-50">
                  <div className="px-3 py-2 border-b border-zinc-800">
                    <p className="text-xs font-semibold text-white truncate">
                      {user.displayName || 'Founder'}
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
                    <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" /> All Pitches Synced to Firestore
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      signOutUser();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-rose-300 hover:bg-rose-500/10 transition-colors mt-1 cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            title="Google Cloud & Firestore Architecture"
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {authError && (
        <div className="bg-rose-500/20 text-rose-300 px-4 py-1.5 text-xs text-center border-b border-rose-500/30 flex items-center justify-between">
          <span>Auth notice: {authError}</span>
          <button onClick={() => setAuthError(null)} className="font-bold cursor-pointer">✕</button>
        </div>
      )}
    </header>
  );
};
