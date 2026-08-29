import React, { useState } from 'react';
import {
  History,
  X,
  RotateCcw,
  CheckCircle2,
  Award,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { PitchProject, PitchVersion } from '../types/pitch';

interface VersionHistoryModalProps {
  project: PitchProject;
  onRestoreVersion: (version: PitchVersion) => void;
  onClose: () => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  project,
  onRestoreVersion,
  onClose,
}) => {
  const [selectedVersionId, setSelectedVersionId] = useState<string>(
    project.versions[project.versions.length - 1]?.versionId || ''
  );

  const selectedVersion = project.versions.find(v => v.versionId === selectedVersionId) || project.versions[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="max-w-4xl w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <History className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Deck Version History & Score Evolution</h2>
              <p className="text-xs text-zinc-400">
                Track how iterative AI critiques and founder edits improved your pitch quality.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Versions Timeline */}
          <div className="md:col-span-5 space-y-3 max-h-96 overflow-y-auto pr-1">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
              Saved Snapshots ({project.versions.length})
            </span>

            {project.versions.map((ver) => {
              const isSelected = ver.versionId === selectedVersionId;
              const isCurrent = ver.versionNumber === project.currentVersion;

              return (
                <div
                  key={ver.versionId}
                  onClick={() => setSelectedVersionId(ver.versionId)}
                  className={`rounded-xl border p-4 cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? 'border-amber-500/50 bg-amber-500/10 text-white shadow-md'
                      : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">Version {ver.versionNumber}</span>
                      {isCurrent && (
                        <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-400 border border-emerald-500/40">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    {ver.score && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400">
                        <Award className="h-3 w-3" />
                        {ver.score.overallScore}/100
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-300 line-clamp-1">{ver.note}</p>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-800/60">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(ver.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>{ver.slides.length} slides</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Selected Version Details */}
          <div className="md:col-span-7 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4 flex flex-col justify-between">
            {selectedVersion ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Version {selectedVersion.versionNumber} Snapshot
                    </h3>
                    <p className="text-xs text-zinc-400">{selectedVersion.note}</p>
                  </div>

                  {selectedVersion.score && (
                    <div className="text-right">
                      <span className="text-lg font-black text-amber-400">
                        {selectedVersion.score.overallScore}/100
                      </span>
                      <span className="block text-[10px] font-semibold text-zinc-400">
                        {selectedVersion.score.tier}
                      </span>
                    </div>
                  )}
                </div>

                {/* Slides Overview */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                    Slide Headlines
                  </span>
                  {selectedVersion.slides.map((s) => (
                    <div
                      key={s.slideNumber}
                      className="rounded-lg bg-zinc-950/70 p-2 text-xs border border-zinc-800 space-y-0.5"
                    >
                      <span className="font-bold text-amber-400 text-[11px]">
                        Slide {s.slideNumber}: {s.title}
                      </span>
                      <p className="text-zinc-300 text-[11px] truncate">{s.headline}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-500 text-xs">
                Select a version to inspect details.
              </div>
            )}

            {/* Restore Action */}
            {selectedVersion && (
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-xs text-zinc-400">
                  {selectedVersion.versionNumber === project.currentVersion
                    ? 'This is the currently loaded version.'
                    : 'Restore this version to replace current active slides.'}
                </span>

                {selectedVersion.versionNumber !== project.currentVersion && (
                  <button
                    onClick={() => {
                      onRestoreVersion(selectedVersion);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-4 py-2 text-xs transition-colors shadow"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Restore Version {selectedVersion.versionNumber}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
