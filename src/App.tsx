/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import {
  StartupIntake,
  SlideData,
  PitchProject,
  PitchVersion,
  ChallengeResolutionResult,
  AutonomousImprovementResult,
} from './types/pitch';
import {
  getStoredProjects,
  saveProject as saveLocalProject,
  deleteProject as deleteLocalProject,
} from './services/storage';
import {
  analyzeStartupApi,
  generatePitchApi,
  scorePitchApi,
  critiquePitchApi,
  improvePitchApi,
  evaluateInvestorDecisionApi,
  autonomousImprovePitchApi,
  generateInvestorChallengeApi,
  resolveInvestorChallengeApi,
} from './services/apiClient';
import {
  subscribeUserProjects,
  saveProjectToFirestore,
  deleteProjectFromFirestore,
} from './services/firestoreService';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import { Navbar } from './components/Navbar';
import { WorkflowProgress } from './components/WorkflowProgress';
import { DashboardView } from './components/DashboardView';
import { IntakeFormView } from './components/IntakeFormView';
import { AnalysisCardView } from './components/AnalysisCardView';
import { PitchDeckStudio } from './components/PitchDeckStudio';
import { QualityScoreView } from './components/QualityScoreView';
import { InvestorCritiqueView } from './components/InvestorCritiqueView';
import { PresentationMode } from './components/PresentationMode';
import { VersionHistoryModal } from './components/VersionHistoryModal';
import { ExportModal } from './components/ExportModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { InvestorChallengeModal } from './components/InvestorChallengeModal';
import { BeforeAfterComparisonModal } from './components/BeforeAfterComparisonModal';
import { AgentRevisionModal } from './components/AgentRevisionModal';
import { Footer } from './components/Footer';

function AppContent() {
  const { user, isAnonymous, setSyncStatus } = useAuth();
  const [projects, setProjects] = useState<PitchProject[]>([]);
  const [activeProject, setActiveProject] = useState<PitchProject | null>(null);

  const [currentView, setCurrentView] = useState<
    'dashboard' | 'intake' | 'analysis' | 'studio' | 'score' | 'critique'
  >('dashboard');

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals & Agentic Flow State
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showPresentation, setShowPresentation] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showAgentRevisionModal, setShowAgentRevisionModal] = useState(false);
  const [agentRevisionResult, setAgentRevisionResult] = useState<AutonomousImprovementResult | null>(null);
  const [isAgentImproving, setIsAgentImproving] = useState(false);

  // Synchronize projects strictly for the authenticated user from Firestore with instant local fallback
  useEffect(() => {
    if (user && !isAnonymous) {
      setSyncStatus('syncing');

      // Seamlessly migrate guest projects to authenticated user on sign-in
      const guestProjects = getStoredProjects(null);
      if (guestProjects.length > 0) {
        console.log(`Migrating ${guestProjects.length} guest projects to authenticated user ${user.uid}`);
        for (const gp of guestProjects) {
          const migratedProject: PitchProject = {
            ...gp,
            updatedAt: new Date().toISOString()
          };
          saveLocalProject(migratedProject, user.uid);
          saveProjectToFirestore(migratedProject, user.uid, user.email).catch((err) => {
            console.error('Error migrating guest project to Firestore:', err);
          });
        }
        localStorage.removeItem('pitchforge_guest_projects');
      }

      // Instantly load locally cached projects so the user doesn't experience waiting delays
      const cached = getStoredProjects(user.uid);
      if (cached.length > 0) {
        setProjects(cached);
        setActiveProject((prev) => prev || cached[0]);
      }

      const unsubscribe = subscribeUserProjects(
        user.uid,
        (firestoreProjects) => {
          setSyncStatus('synced');
          // Only show pitches generated and owned by this specific authenticated account
          if (firestoreProjects.length > 0) {
            setProjects(firestoreProjects);
            setActiveProject((prev) => {
              if (!prev) return firestoreProjects[0];
              const updated = firestoreProjects.find((p) => p.id === prev.id);
              return updated || firestoreProjects[0];
            });
          } else if (cached.length > 0) {
            setProjects(cached);
          } else {
            setProjects([]);
            setActiveProject(null);
          }
        },
        (error) => {
          console.warn('Firestore subscription operating in resilient local mode:', error?.message || error);
          setSyncStatus('offline');
          const localFallback = getStoredProjects(user.uid);
          if (localFallback.length > 0) {
            setProjects(localFallback);
            setActiveProject((prev) => prev || localFallback[0]);
          }
        }
      );
      return () => unsubscribe();
    } else {
      // Guest mode: load guest projects from local storage
      const guestProjects = getStoredProjects(null);
      setProjects(guestProjects);
      if (guestProjects.length > 0) {
        setActiveProject((prev) => prev || guestProjects[0]);
      } else {
        setActiveProject(null);
      }
      setSyncStatus('idle');
    }
  }, [user, isAnonymous]);

  // Unified save handler (Firestore for user + local fallback)
  const persistProject = async (project: PitchProject) => {
    if (user && !isAnonymous) {
      saveLocalProject(project, user.uid);
      try {
        setSyncStatus('syncing');
        await saveProjectToFirestore(project, user.uid, user.email);
        setSyncStatus('synced');
      } catch (err: any) {
        console.warn('Firestore sync will complete once connection is restored:', err?.message || err);
        setSyncStatus('offline');
      }
    } else {
      saveLocalProject(project, null);
    }
  };

  // Helper to calculate workflow step index (0 to 7)
  const getWorkflowStepIndex = (): number => {
    if (currentView === 'intake') return 0;
    if (currentView === 'analysis') return 1;
    if (currentView === 'studio') return 4;
    if (currentView === 'score') return 7;
    if (currentView === 'critique') return 5;
    if (activeProject) {
      if (activeProject.status === 'refined') return 7;
      if (activeProject.status === 'critiqued') return 6;
      if (activeProject.status === 'generated') return 4;
      if (activeProject.status === 'analyzed') return 1;
    }
    return 0;
  };

  const handleStepClick = (stepIndex: number) => {
    if (!activeProject) return;
    if (stepIndex === 0) setCurrentView('intake');
    else if (stepIndex === 1 || stepIndex === 2) {
      if (activeProject.analysis) setCurrentView('analysis');
      else setCurrentView('intake');
    } else if (stepIndex === 3 || stepIndex === 4) {
      if (activeProject.slides.length > 0) setCurrentView('studio');
      else setCurrentView('analysis');
    } else if (stepIndex === 5) {
      if (activeProject.critique) setCurrentView('critique');
      else if (activeProject.slides.length > 0) handleCritiquePitch();
    } else if (stepIndex === 6 || stepIndex === 7) {
      if (activeProject.score) setCurrentView('score');
      else if (activeProject.slides.length > 0) handleScorePitch();
    }
  };

  // 1. Start Analysis
  const handleAnalyzeIntake = async (intake: StartupIntake) => {
    setIsLoading(true);
    setLoadingStep('Analyzing problem, ICP & business model with PitchForge AI...');
    setErrorMessage(null);

    try {
      const analysis = await analyzeStartupApi(intake);

      const projectId = activeProject?.id || `proj-${Date.now()}`;
      const updatedProject: PitchProject = {
        id: projectId,
        createdAt: activeProject?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        intake,
        analysis,
        slides: activeProject?.slides || [],
        currentVersion: activeProject?.currentVersion || 1,
        versions: activeProject?.versions || [],
        score: activeProject?.score,
        critique: activeProject?.critique,
        status: 'analyzed',
      };

      await persistProject(updatedProject);
      setActiveProject(updatedProject);
      setCurrentView('analysis');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to analyze startup idea.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // 2. Generate 10-Slide Pitch Deck
  const handleGeneratePitch = async () => {
    if (!activeProject) return;
    setIsLoading(true);
    setLoadingStep('Constructing 10-slide investor narrative with PitchForge AI...');
    setErrorMessage(null);

    try {
      const slides = await generatePitchApi(
        activeProject.intake,
        activeProject.analysis
      );

      // Score the initial generation
      setLoadingStep('Evaluating pitch against VC investment committee rubric...');
      const score = await scorePitchApi(activeProject.intake, slides, activeProject.analysis);

      // Evaluate Investor Verdict & Decision
      setLoadingStep('Simulating Lead VC Partner Investment Committee decision...');
      let decision = undefined;
      try {
        decision = await evaluateInvestorDecisionApi(activeProject.intake, slides, score, activeProject.analysis);
      } catch (e) {
        console.warn('Investor decision eval fallback:', e);
      }

      // Create snapshot version 1
      const version1: PitchVersion = {
        versionId: `v1-${Date.now()}`,
        versionNumber: 1,
        createdAt: new Date().toISOString(),
        note: 'Initial 10-Slide Generation from PitchForge AI',
        slides,
        score,
        analysis: activeProject.analysis,
      };

      const updatedProject: PitchProject = {
        ...activeProject,
        slides,
        score,
        decision,
        currentVersion: 1,
        versions: [version1],
        status: 'generated',
        updatedAt: new Date().toISOString(),
      };

      await persistProject(updatedProject);
      setActiveProject(updatedProject);
      setCurrentView('studio');

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate 10-slide pitch.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // 3. Score Pitch Deck
  const handleScorePitch = async () => {
    if (!activeProject || activeProject.slides.length === 0) return;
    setIsLoading(true);
    setLoadingStep('Scoring pitch deck across 8 investment categories...');
    setErrorMessage(null);

    try {
      const score = await scorePitchApi(
        activeProject.intake,
        activeProject.slides,
        activeProject.analysis
      );

      // Evaluate Investor Verdict & Decision
      let decision = activeProject.decision;
      try {
        decision = await evaluateInvestorDecisionApi(
          activeProject.intake,
          activeProject.slides,
          score,
          activeProject.analysis
        );
      } catch (e) {
        console.warn('Investor decision eval fallback:', e);
      }

      const updatedProject: PitchProject = {
        ...activeProject,
        score,
        decision,
        updatedAt: new Date().toISOString(),
      };

      await persistProject(updatedProject);
      setActiveProject(updatedProject);
      setCurrentView('score');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to score pitch deck.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // 4. Run AI Investor Critique
  const handleCritiquePitch = async () => {
    if (!activeProject || activeProject.slides.length === 0) return;
    setIsLoading(true);
    setLoadingStep('Simulating 60-second VC partner pitch evaluation...');
    setErrorMessage(null);

    try {
      const critique = await critiquePitchApi(activeProject.intake, activeProject.slides);

      const updatedProject: PitchProject = {
        ...activeProject,
        critique,
        status: 'critiqued',
        updatedAt: new Date().toISOString(),
      };

      await persistProject(updatedProject);
      setActiveProject(updatedProject);
      setCurrentView('critique');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to run investor critique.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // 5. Autonomous Agentic Loop: Evaluate -> Decide -> Targeted Improve -> Re-evaluate
  const handleAutonomousImprove = async () => {
    if (!activeProject || activeProject.slides.length === 0) return;
    setIsAgentImproving(true);
    setShowAgentRevisionModal(true);
    setAgentRevisionResult(null);
    setErrorMessage(null);

    try {
      const currentScore = activeProject.score || (await scorePitchApi(activeProject.intake, activeProject.slides, activeProject.analysis));
      const currentCritique = activeProject.critique || (await critiquePitchApi(activeProject.intake, activeProject.slides));
      const currentDecision = activeProject.decision;

      const agentResult = await autonomousImprovePitchApi(
        activeProject.intake,
        activeProject.slides,
        currentScore,
        currentCritique,
        currentDecision,
        activeProject.analysis
      );

      const nextVersionNum = activeProject.currentVersion + 1;
      const bottleneckLabel = agentResult.decisionPlan?.detectedProblem || 'Investor Rubric Optimization';
      const deltaVal = agentResult.scoreDifference || 0;
      const formattedDelta = deltaVal > 0 ? `+${deltaVal} pts` : deltaVal === 0 ? '0 pts (unchanged)' : `${deltaVal} pts`;

      const newVersion: PitchVersion = {
        versionId: `v${nextVersionNum}-${Date.now()}`,
        versionNumber: nextVersionNum,
        createdAt: new Date().toISOString(),
        note: `Autonomous Agent Revision: ${bottleneckLabel} (${formattedDelta})`,
        slides: agentResult.improvedSlides,
        score: agentResult.newScore,
        decision: agentResult.newDecision,
        changedSlideNumbers: agentResult.changedSlideNumbers,
        whatChanged: agentResult.whatChanged,
        analysis: activeProject.analysis,
      };

      const updatedProject: PitchProject = {
        ...activeProject,
        slides: agentResult.improvedSlides,
        score: agentResult.newScore,
        decision: agentResult.newDecision,
        currentVersion: nextVersionNum,
        versions: [...activeProject.versions, newVersion],
        status: 'refined',
        lastAgentResult: agentResult,
        updatedAt: new Date().toISOString(),
      };

      await persistProject(updatedProject);
      setActiveProject(updatedProject);
      setAgentRevisionResult(agentResult);

      if (agentResult.revisionAccepted) {
        confetti({
          particleCount: 140,
          spread: 100,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to run autonomous improvement loop.');
    } finally {
      setIsAgentImproving(false);
    }
  };

  // 6. Investor Challenge: Open
  const handleOpenChallenge = () => {
    if (!activeProject || activeProject.slides.length === 0) return;
    setShowChallengeModal(true);
  };

  // 7. Apply Investor Challenge Resolution
  const handleApplyChallengeResolution = async (result: ChallengeResolutionResult) => {
    if (!activeProject) return;
    const nextVersionNum = activeProject.currentVersion + 1;
    const challengeTitle = activeProject.lastChallenge?.title || activeProject.lastChallenge?.category || 'Investor Challenge Resolved';
    const gradeString = result.evaluationGrade ? ` (${result.evaluationGrade})` : '';
    const scoreString = result.founderKnowledgeScore !== undefined ? ` [Knowledge Score: ${result.founderKnowledgeScore}/100]` : '';

    const newVersion: PitchVersion = {
      versionId: `v${nextVersionNum}-${Date.now()}`,
      versionNumber: nextVersionNum,
      createdAt: new Date().toISOString(),
      note: `Challenge Verified: ${challengeTitle}${scoreString}${gradeString}`,
      slides: result.updatedSlides,
      score: result.newScore,
      decision: result.newDecision,
      changedSlideNumbers: result.changedSlideNumbers,
      whatChanged: [result.evaluation, result.explanation, result.evaluationFeedback || ''].filter(Boolean),
      analysis: activeProject.analysis,
    };

    const resolvedChallenge = {
      ...(activeProject.lastChallenge || {
        questionId: 'resolved-challenge',
        question: 'Investor Due Diligence Inquiry',
        context: 'Evidence provided by founder',
        category: 'Market & Traction',
      }),
      status: 'resolved' as const,
      resolutionSummary: result.explanation,
      founderResponse: result.founderAnswer,
      founderKnowledgeScore: result.founderKnowledgeScore,
      evaluationGrade: result.evaluationGrade,
      evaluationFeedback: result.evaluationFeedback,
    };

    const updatedProject: PitchProject = {
      ...activeProject,
      slides: result.updatedSlides,
      score: result.newScore,
      decision: result.newDecision || activeProject.decision,
      currentVersion: nextVersionNum,
      versions: [...activeProject.versions, newVersion],
      lastChallenge: resolvedChallenge,
      updatedAt: new Date().toISOString(),
    };

    await persistProject(updatedProject);
    setActiveProject(updatedProject);
    setShowChallengeModal(false);

    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
    });
  };

  // 8. Open Comparison Modal (Before & After)
  const handleOpenBeforeAfter = () => {
    if (!activeProject || activeProject.slides.length === 0) return;
    setShowComparisonModal(true);
  };

  // 9. Restore Initial Version (V1)
  const handleRestoreInitialVersion = async () => {
    if (!activeProject || activeProject.versions.length === 0) return;
    const v1 = activeProject.versions[0];
    const updatedProject: PitchProject = {
      ...activeProject,
      slides: v1.slides,
      score: v1.score,
      decision: v1.decision,
      updatedAt: new Date().toISOString(),
    };
    await persistProject(updatedProject);
    setActiveProject(updatedProject);
    setShowComparisonModal(false);
  };

  // 6. Update Slides from Studio
  const handleUpdateSlides = async (updatedSlides: SlideData[], versionNote?: string) => {
    if (!activeProject) return;

    let versions = activeProject.versions;
    let versionNum = activeProject.currentVersion;

    if (versionNote) {
      versionNum += 1;
      const newVersion: PitchVersion = {
        versionId: `v${versionNum}-${Date.now()}`,
        versionNumber: versionNum,
        createdAt: new Date().toISOString(),
        note: versionNote,
        slides: updatedSlides,
        score: activeProject.score,
        analysis: activeProject.analysis,
      };
      versions = [...versions, newVersion];
    }

    const updatedProject: PitchProject = {
      ...activeProject,
      slides: updatedSlides,
      currentVersion: versionNum,
      versions,
      updatedAt: new Date().toISOString(),
    };

    await persistProject(updatedProject);
    setActiveProject(updatedProject);
  };

  // 7. Restore Version
  const handleRestoreVersion = async (version: PitchVersion) => {
    if (!activeProject) return;

    const nextVer = activeProject.currentVersion + 1;
    const restoredVersion: PitchVersion = {
      versionId: `v${nextVer}-${Date.now()}`,
      versionNumber: nextVer,
      createdAt: new Date().toISOString(),
      note: `Restored from Version ${version.versionNumber}`,
      slides: version.slides,
      score: version.score || activeProject.score,
      critique: version.critique || activeProject.critique,
      analysis: version.analysis || activeProject.analysis,
    };

    const updatedProject: PitchProject = {
      ...activeProject,
      slides: version.slides,
      score: version.score || activeProject.score,
      currentVersion: nextVer,
      versions: [...activeProject.versions, restoredVersion],
      updatedAt: new Date().toISOString(),
    };

    await persistProject(updatedProject);
    setActiveProject(updatedProject);
    setCurrentView('studio');
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (user && !isAnonymous) {
      deleteLocalProject(id, user.uid);
      try {
        await deleteProjectFromFirestore(id);
      } catch (err) {
        console.error('Failed to delete from Firestore:', err);
      }
    } else {
      deleteLocalProject(id, null);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (activeProject?.id === id) {
        setActiveProject(null);
      }
    }
  };

  // Intercept New Pitch requests with Google Sign-in prompt
  const handleRequestNewPitch = () => {
    if (user && !isAnonymous) {
      setActiveProject(null);
      setCurrentView('intake');
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-zinc-100 flex flex-col font-sans antialiased selection:bg-amber-500 selection:text-zinc-950">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        activeProject={activeProject}
        onNewPitch={handleRequestNewPitch}
        onOpenSettings={() => setShowSettings(true)}
        onOpenPresentation={() => setShowPresentation(true)}
      />

      {/* Workflow Progress Indicator */}
      {currentView !== 'dashboard' && (
        <WorkflowProgress
          currentStepIndex={getWorkflowStepIndex()}
          onStepClick={handleStepClick}
          project={activeProject}
        />
      )}

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
          <div className="flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
            <span>⚠️ {errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-white font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main View Router */}
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <DashboardView
                projects={projects}
                onNewPitch={handleRequestNewPitch}
                onOpenProject={(proj) => {
                  setActiveProject(proj);
                  if (proj.slides.length > 0) setCurrentView('studio');
                  else if (proj.analysis) setCurrentView('analysis');
                  else setCurrentView('intake');
                }}
                onDeleteProject={handleDeleteProject}
              />
            </motion.div>
          )}

          {currentView === 'intake' && (
            <motion.div
              key="intake"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <IntakeFormView
                initialIntake={activeProject?.intake}
                onAnalyze={handleAnalyzeIntake}
                isLoading={isLoading}
                loadingStep={loadingStep}
              />
            </motion.div>
          )}

          {currentView === 'analysis' && activeProject?.analysis && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <AnalysisCardView
                analysis={activeProject.analysis}
                intake={activeProject.intake}
                onGeneratePitch={handleGeneratePitch}
                onReanalyze={() => handleAnalyzeIntake(activeProject.intake)}
                isLoading={isLoading}
                loadingStep={loadingStep}
              />
            </motion.div>
          )}

          {currentView === 'studio' && activeProject && (
            <motion.div
              key="studio"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <PitchDeckStudio
                project={activeProject}
                onUpdateSlides={handleUpdateSlides}
                onScorePitch={handleScorePitch}
                onOpenCritique={handleCritiquePitch}
                onOpenHistory={() => setShowHistory(true)}
                onOpenExport={() => setShowExport(true)}
                onOpenPresentation={() => setShowPresentation(true)}
                onOpenChallenge={handleOpenChallenge}
                onOpenBeforeAfter={handleOpenBeforeAfter}
                onRunAutonomousImprove={handleAutonomousImprove}
                isImprovingDeck={isAgentImproving || (isLoading && loadingStep.includes('Autonomous'))}
                isLoadingScore={isLoading && loadingStep.includes('Scoring')}
                isLoadingCritique={isLoading && loadingStep.includes('VC')}
              />
            </motion.div>
          )}

          {currentView === 'score' && activeProject?.score && (
            <motion.div
              key="score"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <QualityScoreView
                score={activeProject.score}
                project={activeProject}
                onOpenCritique={handleCritiquePitch}
                onOpenStudio={() => setCurrentView('studio')}
                onOpenHistory={() => setShowHistory(true)}
                onOpenExport={() => setShowExport(true)}
                onRunAutonomousImprove={handleAutonomousImprove}
                onOpenChallenge={handleOpenChallenge}
                onOpenBeforeAfter={handleOpenBeforeAfter}
                isLoadingAgent={isAgentImproving}
              />
            </motion.div>
          )}

          {currentView === 'critique' && activeProject?.critique && (
            <motion.div
              key="critique"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <InvestorCritiqueView
                critique={activeProject.critique}
                project={activeProject}
                onImprovePitch={handleAutonomousImprove}
                onOpenStudio={() => setCurrentView('studio')}
                onOpenScore={() => setCurrentView('score')}
                onOpenExport={() => setShowExport(true)}
                onOpenChallenge={handleOpenChallenge}
                onOpenBeforeAfter={handleOpenBeforeAfter}
                isImproving={isAgentImproving || (isLoading && loadingStep.includes('Revising')) || (isLoading && loadingStep.includes('Autonomous'))}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {!showPresentation && (
        <Footer
          onNavigate={(view) => setCurrentView(view)}
          onNewPitch={handleRequestNewPitch}
          onOpenSettings={() => setShowSettings(true)}
          hasActiveProject={Boolean(activeProject)}
        />
      )}

      {/* Modals */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
        />
      )}

      {showHistory && activeProject && (
        <VersionHistoryModal
          project={activeProject}
          onRestoreVersion={handleRestoreVersion}
          onClose={() => setShowHistory(false)}
        />
      )}

      {showExport && activeProject && (
        <ExportModal
          project={activeProject}
          onClose={() => setShowExport(false)}
        />
      )}

      {showPresentation && activeProject && (
        <PresentationMode
          project={activeProject}
          onClose={() => setShowPresentation(false)}
        />
      )}

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setActiveProject(null);
            setCurrentView('intake');
          }}
        />
      )}

      {/* Investor Challenge Due Diligence Modal */}
      {showChallengeModal && activeProject && (
        <InvestorChallengeModal
          project={activeProject}
          onApplyResolution={handleApplyChallengeResolution}
          onClose={() => setShowChallengeModal(false)}
        />
      )}

      {/* Before / After Slide Diff Comparison Modal */}
      {showComparisonModal && activeProject && (
        <BeforeAfterComparisonModal
          project={activeProject}
          onClose={() => setShowComparisonModal(false)}
          onRestoreInitial={handleRestoreInitialVersion}
        />
      )}

      {/* Autonomous Multi-Agent Revision Real-Time Execution Modal */}
      {showAgentRevisionModal && activeProject && (
        <AgentRevisionModal
          isOpen={showAgentRevisionModal}
          onClose={() => setShowAgentRevisionModal(false)}
          isRunning={isAgentImproving}
          result={agentRevisionResult}
          project={activeProject}
          onOpenBeforeAfter={handleOpenBeforeAfter}
          onOpenStudio={() => setCurrentView('studio')}
          onOpenScore={() => setCurrentView('score')}
          onOpenExport={() => setShowExport(true)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
