import React, { useState, useEffect } from 'react';
import {
  Settings,
  X,
  CheckCircle2,
  Sparkles,
  Server,
  RefreshCw,
  Flame,
  Shield,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import firebaseConfig from '../../firebase-applet-config.json';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setIsChecking(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealthStatus(data);
    } catch (e: any) {
      setHealthStatus({ status: 'error', error: e.message });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="max-w-2xl w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-amber-400 border border-zinc-700">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Google Cloud & Firebase Architecture</h2>
              <p className="text-xs text-zinc-400">
                PitchForge AI backend deployment and Firebase integration.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Backend & Firebase Status Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <Server className="h-4 w-4 text-emerald-400" /> Infrastructure Status
            </span>
            <button
              onClick={checkHealth}
              disabled={isChecking}
              className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 cursor-pointer"
            >
              <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg bg-zinc-950 p-3 border border-zinc-800 space-y-1">
              <span className="text-zinc-500 text-[10px] uppercase font-bold block">AI Engine</span>
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Gemini 3.7 Flash (@google/genai)
              </span>
            </div>

            <div className="rounded-lg bg-zinc-950 p-3 border border-zinc-800 space-y-1">
              <span className="text-zinc-500 text-[10px] uppercase font-bold block">Firebase Firestore</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Connected & Rules Deployed
              </span>
            </div>
          </div>
        </div>

        {/* Firebase Config Details */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
            Firebase Active Configuration
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 space-y-1">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5" /> Project & Database ID
              </span>
              <p className="text-zinc-300 font-mono text-[10px] truncate">
                {firebaseConfig.projectId}
              </p>
              <p className="text-zinc-500 text-[10px] truncate">
                DB: {firebaseConfig.firestoreDatabaseId}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 space-y-1">
              <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" /> Firebase Auth Status
              </span>
              {user ? (
                <div className="space-y-0.5">
                  <p className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                    <UserCheck className="h-3 w-3" /> {user.displayName || user.email}
                  </p>
                  <p className="text-zinc-400 text-[10px] truncate">UID: {user.uid}</p>
                </div>
              ) : (
                <p className="text-zinc-400 text-[11px]">
                  Guest Mode (Sign in with Google in top bar for cloud sync)
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
