import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  FileText,
  Layers,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { StartupIntake } from '../types/pitch';

interface IntakeFormViewProps {
  initialIntake?: StartupIntake;
  onAnalyze: (intake: StartupIntake) => void;
  isLoading: boolean;
  loadingStep: string;
}

export const IntakeFormView: React.FC<IntakeFormViewProps> = ({
  initialIntake,
  onAnalyze,
  isLoading,
  loadingStep,
}) => {
  const [mode, setMode] = useState<'structured' | 'freeform'>('structured');
  const [formData, setFormData] = useState<StartupIntake>(() => {
    return initialIntake || {
      startupName: '',
      tagline: '',
      rawIdea: '',
      problem: '',
      targetCustomer: '',
      solution: '',
      businessModel: '',
      stage: 'Idea',
      geography: 'United States / Global',
      existingTraction: '',
      competitors: '',
      competitiveAdvantage: '',
      revenueModel: '',
      teamInfo: '',
      additionalContext: '',
    };
  });

  const handleFieldChange = (field: keyof StartupIntake, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startupName && !formData.rawIdea) {
      alert('Please provide at least a Startup Name or Raw Idea overview.');
      return;
    }
    onAnalyze(formData);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8">
      {/* Header & Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
              1
            </span>
            <h1 className="text-2xl font-extrabold text-white">Startup Intake & Strategic Input</h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Provide your raw startup thinking. PitchForge AI will analyze the assumptions, market, and business model.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Quick Examples */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-zinc-400 font-medium hidden md:inline">Try Demo:</span>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  startupName: 'HyperCourier',
                  tagline: 'Autonomous 15-Minute Urban Cold-Chain Medical Delivery',
                  rawIdea: 'HyperCourier provides autonomous drone-and-rover cold-chain micro-fulfillment for urgent medical samples and temperature-sensitive biologicals.',
                  problem: 'Urgent pathology labs and clinics lose up to 18% of temperature-sensitive samples due to urban traffic bottlenecks and manual courier delays.',
                  targetCustomer: 'Regional Hospital Networks, Independent Pathology Labs, and Decentralized Clinical Trials.',
                  solution: 'An autonomous point-to-point cold-chain container system with real-time temperature telemetry and 15-minute SLA.',
                  businessModel: 'B2B subscription ($2,500/mo base + $18 per guaranteed 15-minute dispatch).',
                  stage: 'MVP / Beta',
                  geography: 'Tier-1 Metros (US / EU)',
                  existingTraction: '3 Hospital network LOIs signed, 450 test runs completed with 99.8% on-time integrity.',
                  competitors: 'Legacy manual bike/van couriers (Zipline in rural, none for dense intra-hospital networks).',
                  competitiveAdvantage: 'Proprietary FAA Part 135 waiver pipeline + sub-zero solid-state cooling patent.',
                  revenueModel: 'SaaS Platform Fee + Per-Delivery Take Rate',
                  teamInfo: 'Ex-Zipline Lead Robotics Engineer + Former Head of Clinical Ops at Quest Diagnostics',
                  additionalContext: 'Seeking $2.5M Seed to deploy 40 automated hubs across Boston and Bay Area.',
                });
              }}
              className="rounded-lg bg-zinc-800/80 hover:bg-zinc-750 text-amber-300 border border-amber-500/20 px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer"
            >
              ⚡ MedTech Drone
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  startupName: 'DataPulse AI',
                  tagline: 'Autonomous Compliance & FinCrime Graph Intelligence',
                  rawIdea: 'DataPulse AI analyzes cross-border banking transactions in real time using knowledge graphs and generative reasoning to eliminate 95% of false-positive AML alerts.',
                  problem: 'Tier-1 banks spend $30B+ annually manually investigating Anti-Money Laundering alerts where 98% turn out to be harmless false alarms.',
                  targetCustomer: 'Chief Compliance Officers, Head of FinCrime at Mid-market Banks and Fintechs.',
                  solution: 'Graph AI copilot that auto-generates SAR (Suspicious Activity Reports) narratives and resolves benign flags in under 4 seconds.',
                  businessModel: '$120k/yr annual license per institution + volume tiers above 1M transactions.',
                  stage: 'Early Revenue',
                  geography: 'North America & UK',
                  existingTraction: '$340k ARR, 2 pilot contracts in production, 94.2% analyst time reduction verified.',
                  competitors: 'Legacy Actimize, Unit21, manual compliance analyst teams.',
                  competitiveAdvantage: 'Proprietary graph attention network architecture with auditable explanation trails.',
                  revenueModel: 'Annual Enterprise SaaS License',
                  teamInfo: 'Ex-Palantir FinCrime Architect & Ex-JPMorgan Compliance Director',
                  additionalContext: 'Raising $3.5M Seed round to expand US commercial banking sales team.',
                });
              }}
              className="rounded-lg bg-zinc-800/80 hover:bg-zinc-750 text-emerald-300 border border-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer"
            >
              ⚡ FinTech AI
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex rounded-lg bg-zinc-900 p-1 border border-zinc-800">
            <button
              type="button"
              onClick={() => setMode('structured')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
                mode === 'structured'
                  ? 'bg-zinc-800 text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Structured Form
            </button>
            <button
              type="button"
              onClick={() => setMode('freeform')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
                mode === 'freeform'
                  ? 'bg-zinc-800 text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Free-form Idea
            </button>
          </div>
        </div>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {mode === 'freeform' ? (
          /* Freeform Mode */
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-white">
                Startup Name <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={formData.startupName}
                onChange={e => handleFieldChange('startupName', e.target.value)}
                placeholder="e.g. Acme Health"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-white">
                  Paste or Describe Your Startup Idea in Detail <span className="text-amber-400">*</span>
                </label>
                <span className="text-[11px] text-zinc-400">
                  Unstructured notes, customer feedback, problem, and solution
                </span>
              </div>
              <textarea
                rows={10}
                value={formData.rawIdea}
                onChange={e => handleFieldChange('rawIdea', e.target.value)}
                placeholder="Describe what you are building, who it is for, why existing alternatives fall short, how you make money, and any traction or early customer signals..."
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Current Stage
                </label>
                <select
                  value={formData.stage}
                  onChange={e => handleFieldChange('stage', e.target.value as any)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="Idea">Idea (Pre-product)</option>
                  <option value="Prototype">Prototype / Mockup</option>
                  <option value="MVP / Beta">MVP / Private Beta</option>
                  <option value="Early Revenue">Early Revenue</option>
                  <option value="Growth">Growth / Scaling</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Target Geography / Market
                </label>
                <input
                  type="text"
                  value={formData.geography}
                  onChange={e => handleFieldChange('geography', e.target.value)}
                  placeholder="e.g. US Urban Centers / Global B2B"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        ) : (
          /* Structured Mode */
          <div className="space-y-6">
            {/* Section 1: Identity & Problem */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
              <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4 w-4" /> 1. Startup Identity & Problem
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Startup Name <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.startupName}
                    onChange={e => handleFieldChange('startupName', e.target.value)}
                    placeholder="e.g. Acme Health"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    One-Liner / Tagline
                  </label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={e => handleFieldChange('tagline', e.target.value)}
                    placeholder="e.g. The automated compliance engine for modern fintechs"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  The Problem (Why does this matter now?) <span className="text-amber-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.problem}
                  onChange={e => handleFieldChange('problem', e.target.value)}
                  placeholder="What is the acute pain, friction, or cost experienced by users today? Why are current options broken?"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-xs text-white focus:border-amber-500 focus:outline-none leading-relaxed"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Target Customer Profile (ICP) <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.targetCustomer}
                  onChange={e => handleFieldChange('targetCustomer', e.target.value)}
                  placeholder="e.g. University students ordering celebration gifts; Series A CTOs managing AWS bills"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Section 2: Solution & Business Engine */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
              <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <Lightbulb className="h-4 w-4" /> 2. Solution & Business Model
              </h2>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Your Solution (How does it work?) <span className="text-amber-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.solution}
                  onChange={e => handleFieldChange('solution', e.target.value)}
                  placeholder="Explain your product workflow. What makes it 10x better or faster than the status quo?"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-xs text-white focus:border-amber-500 focus:outline-none leading-relaxed"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Business & Revenue Model <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.businessModel}
                    onChange={e => handleFieldChange('businessModel', e.target.value)}
                    placeholder="e.g. 15% marketplace take rate; $99/mo B2B SaaS seat pricing"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Stage & Maturity
                  </label>
                  <select
                    value={formData.stage}
                    onChange={e => handleFieldChange('stage', e.target.value as any)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Idea">Idea (Pre-product)</option>
                    <option value="Prototype">Prototype / Mockup</option>
                    <option value="MVP / Beta">MVP / Private Beta</option>
                    <option value="Early Revenue">Early Revenue</option>
                    <option value="Growth">Growth / Scaling</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Competition, Moat & Traction */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
              <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Layers className="h-4 w-4" /> 3. Competition, Moat & Real Traction
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Existing Competitors & Alternatives
                  </label>
                  <textarea
                    rows={3}
                    value={formData.competitors}
                    onChange={e => handleFieldChange('competitors', e.target.value)}
                    placeholder="Who are the direct and indirect competitors? Legacy manual options?"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Defensibility & Unfair Advantage
                  </label>
                  <textarea
                    rows={3}
                    value={formData.competitiveAdvantage}
                    onChange={e => handleFieldChange('competitiveAdvantage', e.target.value)}
                    placeholder="Why will you win? Network effects, proprietary distribution wedge, high switching costs?"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Validated Traction (Leave empty if unverified)
                </label>
                <textarea
                  rows={2}
                  value={formData.existingTraction}
                  onChange={e => handleFieldChange('existingTraction', e.target.value)}
                  placeholder="Real customer test data, waitlist, pilot GMV. (Leave blank or state 'Pre-launch' if unvalidated)"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Team & Founder Background
                </label>
                <input
                  type="text"
                  value={formData.teamInfo}
                  onChange={e => handleFieldChange('teamInfo', e.target.value)}
                  placeholder="e.g. Co-Founders: CS Senior (Campus Logistics) + Culinary Arts Alum"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Non-Fabrication Notice */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-200/90">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <p>
            <span className="font-semibold text-amber-300">PitchForge AI Non-Fabrication Rule:</span> PitchForge AI will never invent fake revenue, customer numbers, or traction. Any unverified metrics will be explicitly tagged as <span className="font-mono text-amber-400 font-semibold">[ASSUMPTION - NEEDS VALIDATION]</span> so your deck remains honest and credible to institutional VCs.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-bold px-8 py-3.5 text-sm transition-all shadow-xl shadow-amber-500/25 active:scale-95 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
                <span>{loadingStep || 'Analyzing startup with PitchForge AI...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 stroke-[2.5]" />
                <span>Analyze Idea with PitchForge AI</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
