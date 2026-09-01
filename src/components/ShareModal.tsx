import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Globe,
  Lock,
  ExternalLink,
  Share2,
} from 'lucide-react';
import { PitchProject } from '../types/pitch';

interface ShareModalProps {
  project: PitchProject;
  onToggleShare: (isShared: boolean) => Promise<void>;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  project,
  onToggleShare,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const isShared = project.isShared || false;
  
  // Construct the secure, shareable public URL
  const shareUrl = `${window.location.origin}${window.location.pathname}?share=${project.id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      await onToggleShare(!isShared);
    } catch (err) {
      console.error('Error toggling share state:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="max-w-md w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Share2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-sans">Share Pitch Deck</h2>
              <p className="text-xs text-zinc-400">
                Generate a secure, read-only link for mentors and partners.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Visibility Status Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-4">
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg ${isShared ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
              {isShared ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">
                  {isShared ? 'Shared publicly (read-only)' : 'Private Link'}
                </span>
                <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium border ${
                  isShared 
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}>
                  {isShared ? 'Accessible' : 'Restricted'}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {isShared 
                  ? 'Anyone with this secure link can view your pitch slides, venture heuristics, and performance scorecard.' 
                  : 'Only you can view and edit this pitch deck. Generation actions are protected.'}
              </p>
            </div>
          </div>

          {/* Toggle Button */}
          <button
            onClick={handleToggle}
            disabled={isUpdating}
            className={`w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-150 active:scale-[0.98] ${
              isShared 
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700' 
                : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black'
            }`}
          >
            {isUpdating ? (
              <span className="animate-pulse">Updating...</span>
            ) : isShared ? (
              <>
                <Lock className="h-3.5 w-3.5" />
                <span>Revoke Link (Make Private)</span>
              </>
            ) : (
              <>
                <Globe className="h-3.5 w-3.5" />
                <span>Activate Public Share Link</span>
              </>
            )}
          </button>
        </div>

        {/* Copyable Link Input (Only active if shared) */}
        {isShared && (
          <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
              Mentor Share Link
            </label>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-zinc-300 select-all overflow-x-auto whitespace-nowrap scrollbar-none font-mono">
                {shareUrl}
              </div>
              <button
                onClick={handleCopy}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
                title="Copy share link"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors"
                title="Open preview"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            <p className="text-[10px] text-zinc-500 italic">
              Pro tip: Mentors can review your score and test your deck in real-time.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
