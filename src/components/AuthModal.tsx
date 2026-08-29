import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  Database,
  Layers,
  History,
  ArrowRight,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logoImg from '../assets/images/pitchforge_logo_1788025673462.jpg';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  subtitle?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Sign in to create your pitch',
  subtitle = 'Connect your Google account to automatically store and sync your pitch deck, AI critique, and revisions to Firestore.',
}) => {
  const { signInWithGoogle } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    try {
      const res = await signInWithGoogle();
      if (res.success) {
        onSuccess();
        onClose();
      } else if (!res.cancelled && res.error) {
        setError(res.error);
      }
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        setError(err.message || 'Failed to sign in with Google. Please try again.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleContinueAsGuest = () => {
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="max-w-md w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl space-y-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Brand Icon Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl shadow-amber-500/10 overflow-hidden">
            <img
              src={logoImg}
              alt="PitchForge AI Logo"
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {title}
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed px-2">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Value Props Grid */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-4 space-y-2.5 text-xs">
          <div className="flex items-start gap-2.5 text-zinc-300">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400 mt-0.5">
              <Database className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="font-semibold text-white">Firestore Cloud Persistence:</span>
              <p className="text-[11px] text-zinc-400">All 10 slides, metrics, and analyses saved to your private database.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-zinc-300">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-400 mt-0.5">
              <History className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="font-semibold text-white">Unlimited Version Snapshots:</span>
              <p className="text-[11px] text-zinc-400">Iterate with AI VC critiques and restore any previous draft anytime.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-zinc-300">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-400 mt-0.5">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="font-semibold text-white">Secure Google Account Sync:</span>
              <p className="text-[11px] text-zinc-400">Isolated access control protected by Firebase Security Rules.</p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300 text-center">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-1">
          <button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="w-full flex items-center justify-center gap-3 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-bold px-4 py-3 text-sm shadow-lg shadow-white/10 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSigningIn ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-zinc-950 border-t-transparent animate-spin" />
                Signing in with Google...
              </span>
            ) : (
              <>
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
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <button
            onClick={handleContinueAsGuest}
            className="w-full text-center text-xs text-zinc-400 hover:text-zinc-200 py-1.5 transition-colors cursor-pointer"
          >
            Continue as Guest (temporary local storage)
          </button>
        </div>
      </div>
    </div>
  );
};
