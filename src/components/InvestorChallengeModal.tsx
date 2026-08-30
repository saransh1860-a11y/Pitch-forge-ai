import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  Sparkles,
  Send,
  Zap,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Award,
  FileCheck,
} from 'lucide-react';
import {
  PitchProject,
  InvestorChallenge,
  ChallengeResolutionResult,
} from '../types/pitch';
import {
  generateInvestorChallengeApi,
  resolveInvestorChallengeApi,
} from '../services/apiClient';

interface InvestorChallengeModalProps {
  project: PitchProject;
  onApplyResolution: (result: ChallengeResolutionResult) => void;
  onClose: () => void;
}

export const InvestorChallengeModal: React.FC<InvestorChallengeModalProps> = ({
  project,
  onApplyResolution,
  onClose,
}) => {
  const [challenge, setChallenge] = useState<InvestorChallenge | null>(
    project.lastChallenge || null
  );
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(!project.lastChallenge);
  const [founderAnswer, setFounderAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resolutionResult, setResolutionResult] = useState<ChallengeResolutionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-fetch challenge question if not already loaded
  React.useEffect(() => {
    if (!challenge) {
      fetchChallenge();
    }
  }, []);

  const fetchChallenge = async () => {
    setIsLoadingChallenge(true);
    setErrorMessage(null);
    try {
      const q = await generateInvestorChallengeApi(
        project.intake,
        project.slides,
        project.score,
        project.critique,
        project.decision
      );
      setChallenge(q);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate investor challenge.');
    } finally {
      setIsLoadingChallenge(false);
    }
  };

  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge || !founderAnswer.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const result = await resolveInvestorChallengeApi(
        project.intake,
        project.slides,
        project.score || {
          overallScore: 70,
          tier: 'Needs Validation',
          categories: {} as any,
          strengths: [],
          weaknesses: [],
          topImprovements: [],
        },
        challenge,
        founderAnswer,
        project.analysis
      );
      setResolutionResult(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit evidence to investor agent.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyAndClose = () => {
    if (resolutionResult) {
      onApplyResolution(resolutionResult);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="max-w-3xl w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-7 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Investor Challenge Mode
                </h2>
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-extrabold text-amber-300 border border-amber-500/40">
                  HUMAN-IN-THE-LOOP
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Answer the institutional investment committee's hardest unanswered question with real evidence.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Loading Challenge State */}
        {isLoadingChallenge && (
          <div className="py-12 text-center space-y-3">
            <Zap className="h-8 w-8 animate-spin text-amber-400 mx-auto" />
            <p className="text-xs text-zinc-400">
              Formulating targeted venture committee challenge question...
            </p>
          </div>
        )}

        {/* Active Challenge View */}
        {!isLoadingChallenge && challenge && !resolutionResult && (
          <div className="space-y-5">
            {/* The VC Question Box */}
            <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-950 p-5 sm:p-6 space-y-3 shadow-xl">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4" /> Hardest Investor Question
                </span>
                <span className="rounded bg-zinc-800 border border-zinc-700 px-2 py-0.5 text-[10px] font-bold text-zinc-300">
                  Category: {challenge.category}
                </span>
              </div>

              <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
                "{challenge.question}"
              </p>

              <p className="text-xs text-zinc-300 italic pt-1">
                Context: {challenge.context}
              </p>

              {/* Recommended Evidence Badges */}
              {challenge.suggestedEvidenceTypes && (
                <div className="pt-3 border-t border-zinc-800 space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block">
                    High-Value Evidence Types to Provide:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {challenge.suggestedEvidenceTypes.map((ev, i) => (
                      <span
                        key={i}
                        className="rounded-lg bg-zinc-900 border border-zinc-700/80 px-2.5 py-1 text-[11px] text-zinc-200"
                      >
                        ✓ {ev}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Founder Answer Form */}
            <form onSubmit={handleSubmitEvidence} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Provide Your Concrete Evidence & Validation Data
                </label>
                <textarea
                  rows={4}
                  value={founderAnswer}
                  onChange={(e) => setFounderAnswer(e.target.value)}
                  placeholder="e.g., In our pilot with 25 beta users, 88% completed the workflow in under 2 minutes. We signed 3 LOIs representing $45k ARR at a target price of $1,250/mo with zero paid marketing..."
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={fetchChallenge}
                  className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Regenerate Question
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !founderAnswer.trim()}
                  className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-5 py-2.5 text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Zap className="h-4 w-4 animate-spin text-zinc-950" />
                      <span>Evaluating & Updating Pitch Deck...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Proof to AI Investor</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Resolution Outcome State */}
        {resolutionResult && (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Emerald/Green Card for Successful Verification */}
            {(!resolutionResult.hasOwnProperty('isPassed') || resolutionResult.isPassed) ? (
              <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/20 via-zinc-900 to-zinc-950 p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Founder Knowledge Verified
                  </span>
                  <span className="rounded bg-emerald-500/20 text-emerald-300 font-black px-3 py-1 text-sm border border-emerald-500/30">
                    SCORE: {resolutionResult.founderKnowledgeScore !== undefined ? resolutionResult.founderKnowledgeScore : 85}/100 ({resolutionResult.evaluationGrade || 'Good'})
                  </span>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-white leading-relaxed">
                    {resolutionResult.evaluation}
                  </p>

                  <div className="rounded-xl bg-zinc-900/60 p-3.5 border border-zinc-800 space-y-1.5">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">
                      Investor Feedback
                    </span>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {resolutionResult.evaluationFeedback || 'Your answer successfully addresses the core meaning of the investment criteria.'}
                    </p>
                  </div>

                  {resolutionResult.idealAnswerDiligence && (
                    <div className="rounded-xl bg-zinc-900/40 p-3.5 border border-zinc-800/80 space-y-1.5">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                        Diligence Standard (Answer in Mind)
                      </span>
                      <p className="text-xs text-zinc-400 italic leading-relaxed">
                        {resolutionResult.idealAnswerDiligence}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>
                    Pitch Deck Quality: <strong className="text-zinc-300">{resolutionResult.previousScore.overallScore}/100</strong> (unchanged)
                  </span>
                  <span>
                    Status: <strong className="text-emerald-400">PASSED</strong>
                  </span>
                </div>
              </div>
            ) : (
              /* Rose/Red Card for Failed Verification (gibberish/ABCD) */
              <div className="rounded-2xl border border-rose-500/40 bg-gradient-to-br from-rose-950/20 via-zinc-900 to-zinc-950 p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4" /> Knowledge Verification Failed
                  </span>
                  <span className="rounded bg-rose-500/20 text-rose-300 font-black px-3 py-1 text-sm border border-rose-500/30">
                    SCORE: {resolutionResult.founderKnowledgeScore || 0}/100 ({resolutionResult.evaluationGrade || 'Invalid'})
                  </span>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-white leading-relaxed">
                    {resolutionResult.evaluation}
                  </p>

                  <div className="rounded-xl bg-zinc-900/60 p-3.5 border border-zinc-800 space-y-1.5">
                    <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest block">
                      Investor Rejection Feedback
                    </span>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {resolutionResult.evaluationFeedback}
                    </p>
                  </div>

                  {resolutionResult.idealAnswerDiligence && (
                    <div className="rounded-xl bg-zinc-900/40 p-3.5 border border-zinc-800/80 space-y-1.5">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                        Diligence Standard (Answer in Mind)
                      </span>
                      <p className="text-xs text-zinc-400 italic leading-relaxed">
                        {resolutionResult.idealAnswerDiligence}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>
                    Pitch Deck Quality: <strong className="text-zinc-300">{resolutionResult.previousScore.overallScore}/100</strong> (unchanged)
                  </span>
                  <span>
                    Status: <strong className="text-rose-400">FAILED</strong>
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                className="rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-300 transition-colors"
              >
                Discard & Close
              </button>
              {(!resolutionResult.hasOwnProperty('isPassed') || resolutionResult.isPassed) && (
                <button
                  onClick={handleApplyAndClose}
                  className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-5 py-2 text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all"
                >
                  <FileCheck className="h-4 w-4" />
                  <span>Record Verified Diligence</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
