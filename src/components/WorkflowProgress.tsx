import React from 'react';
import {
  FileText,
  Search,
  PieChart,
  LayoutGrid,
  Sparkles,
  ShieldAlert,
  Edit3,
  Trophy,
  Check,
} from 'lucide-react';
import { PitchProject } from '../types/pitch';

interface WorkflowProgressProps {
  currentStepIndex: number;
  onStepClick?: (stepIndex: number) => void;
  project?: PitchProject | null;
}

export const WORKFLOW_STEPS = [
  { label: 'RAW IDEA', shortLabel: 'Raw Idea', icon: FileText, desc: 'Startup Intake & Freeform Context' },
  { label: 'STARTUP ANALYSIS', shortLabel: 'Analysis', icon: Search, desc: 'Gemini Problem & ICP Extraction' },
  { label: 'BUSINESS MODEL & MARKET', shortLabel: 'Market & Moat', icon: PieChart, desc: 'TAM/SAM & Defensibility Assessment' },
  { label: '10-SLIDE STORY STRUCTURE', shortLabel: 'Structure', icon: LayoutGrid, desc: 'Investor Sequencing & Archetypes' },
  { label: 'AI-GENERATED PITCH', shortLabel: '10-Slide Pitch', icon: Sparkles, desc: 'Evidence & Assumption Mapped Slides' },
  { label: 'AI CRITIQUE', shortLabel: '60s Review', icon: ShieldAlert, desc: 'VC Committee 60-Second Stress Test' },
  { label: 'FOUNDER REVISION', shortLabel: 'Revision', icon: Edit3, desc: 'Iterative Refinement & Slide Co-Pilot' },
  { label: 'FINAL PITCH', shortLabel: 'Final Deck', icon: Trophy, desc: 'Investor Ready Score & Presentation' },
];

export const WorkflowProgress: React.FC<WorkflowProgressProps> = ({
  currentStepIndex,
  onStepClick,
  project,
}) => {
  return (
    <div className="w-full border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-sm px-4 py-2.5">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-2 py-1">
          {WORKFLOW_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const isClickable = onStepClick && (isCompleted || isCurrent);

            return (
              <React.Fragment key={step.label}>
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && onStepClick?.(idx)}
                  className={`group flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-all whitespace-nowrap ${
                    isCurrent
                      ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300 font-semibold shadow-sm shadow-amber-500/10'
                      : isCompleted
                      ? 'text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer'
                      : 'text-zinc-500 opacity-60 cursor-not-allowed'
                  }`}
                  title={`${step.label}: ${step.desc}`}
                >
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                      isCurrent
                        ? 'bg-amber-500 text-zinc-950 shadow'
                        : isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}
                  >
                    {isCompleted ? <Check className="h-3 w-3" /> : idx + 1}
                  </div>
                  <span className="font-medium tracking-tight text-[11px] sm:text-xs">
                    {step.shortLabel}
                  </span>
                </button>

                {idx < WORKFLOW_STEPS.length - 1 && (
                  <div
                    className={`hidden sm:block h-[1px] w-4 shrink-0 transition-colors ${
                      idx < currentStepIndex ? 'bg-emerald-500/40' : 'bg-zinc-800'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
