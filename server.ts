import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  analyzeStartup,
  generatePitchSlides,
  scorePitch,
  critiquePitch,
  improveSlide,
  improvePitch,
  evaluateInvestorDecision,
  runAutonomousImprovementLoop,
  generateInvestorChallenge,
  resolveInvestorChallenge,
} from './server/geminiService.ts';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Health Check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'PitchForge AI Backend',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // 1. Analyze Startup Intake
  app.post('/api/analyze-startup', async (req: Request, res: Response) => {
    try {
      const { intake } = req.body;
      if (!intake) {
        return res.status(400).json({ error: 'Startup intake data is required.' });
      }
      const analysis = await analyzeStartup(intake);
      res.json(analysis);
    } catch (error: any) {
      console.error('Error in /api/analyze-startup:', error);
      res.status(500).json({ error: error.message || 'Failed to analyze startup idea.' });
    }
  });

  // 2. Generate 10-Slide Pitch
  app.post('/api/generate-pitch', async (req: Request, res: Response) => {
    try {
      const { intake, analysis, referencePatterns } = req.body;
      if (!intake) {
        return res.status(400).json({ error: 'Startup intake data is required.' });
      }
      const slides = await generatePitchSlides(intake, analysis, referencePatterns);
      res.json({ slides });
    } catch (error: any) {
      console.error('Error in /api/generate-pitch:', error);
      res.status(500).json({ error: error.message || 'Failed to generate pitch slides.' });
    }
  });

  // 3. Score Pitch
  app.post('/api/score-pitch', async (req: Request, res: Response) => {
    try {
      const { intake, slides, analysis } = req.body;
      if (!intake || !slides) {
        return res.status(400).json({ error: 'Intake and slides are required.' });
      }
      const score = await scorePitch(intake, slides, analysis);
      res.json(score);
    } catch (error: any) {
      console.error('Error in /api/score-pitch:', error);
      res.status(500).json({ error: error.message || 'Failed to score pitch.' });
    }
  });

  // 4. Critique Pitch (The 60-Second Investor Test)
  app.post('/api/critique-pitch', async (req: Request, res: Response) => {
    try {
      const { intake, slides } = req.body;
      if (!intake || !slides) {
        return res.status(400).json({ error: 'Intake and slides are required.' });
      }
      const critique = await critiquePitch(intake, slides);
      res.json(critique);
    } catch (error: any) {
      console.error('Error in /api/critique-pitch:', error);
      res.status(500).json({ error: error.message || 'Failed to critique pitch.' });
    }
  });

  // 5. Improve Single Slide
  app.post('/api/improve-slide', async (req: Request, res: Response) => {
    try {
      const { slide, instruction, customPrompt, startupContext } = req.body;
      if (!slide) {
        return res.status(400).json({ error: 'Slide data is required.' });
      }
      const result = await improveSlide(slide, instruction, customPrompt, startupContext);
      res.json(result);
    } catch (error: any) {
      console.error('Error in /api/improve-slide:', error);
      res.status(500).json({ error: error.message || 'Failed to improve slide.' });
    }
  });

  // 6. Improve Full Pitch
  app.post('/api/improve-pitch', async (req: Request, res: Response) => {
    try {
      const { intake, slides, critique } = req.body;
      if (!intake || !slides || !critique) {
        return res.status(400).json({ error: 'Intake, slides, and critique are required.' });
      }
      const result = await improvePitch(intake, slides, critique);
      res.json(result);
    } catch (error: any) {
      console.error('Error in /api/improve-pitch:', error);
      res.status(500).json({ error: error.message || 'Failed to refine pitch.' });
    }
  });

  // 7. Evaluate Investor Decision
  app.post('/api/investor-decision', async (req: Request, res: Response) => {
    try {
      const { intake, slides, score, analysis } = req.body;
      if (!intake || !slides || !score) {
        return res.status(400).json({ error: 'Intake, slides, and score are required.' });
      }
      const decision = await evaluateInvestorDecision(intake, slides, score, analysis);
      res.json(decision);
    } catch (error: any) {
      console.error('Error in /api/investor-decision:', error);
      res.status(500).json({ error: error.message || 'Failed to evaluate investor decision.' });
    }
  });

  // 8. Closed-Loop Autonomous Investor Improvement Agent
  app.post('/api/autonomous-improve', async (req: Request, res: Response) => {
    try {
      const { intake, slides, currentScore, critique, decision, analysis } = req.body;
      if (!intake || !slides || !currentScore || !critique) {
        return res.status(400).json({ error: 'Intake, slides, currentScore, and critique are required.' });
      }
      const result = await runAutonomousImprovementLoop(intake, slides, currentScore, critique, decision, analysis);
      res.json(result);
    } catch (error: any) {
      console.error('Error in /api/autonomous-improve:', error);
      res.status(500).json({ error: error.message || 'Failed to run autonomous improvement loop.' });
    }
  });

  // 9. Generate Investor Challenge
  app.post('/api/generate-challenge', async (req: Request, res: Response) => {
    try {
      const { intake, slides, score, critique, decision } = req.body;
      if (!intake || !slides) {
        return res.status(400).json({ error: 'Intake and slides are required.' });
      }
      const challenge = await generateInvestorChallenge(intake, slides, score, critique, decision);
      res.json(challenge);
    } catch (error: any) {
      console.error('Error in /api/generate-challenge:', error);
      res.status(500).json({ error: error.message || 'Failed to generate investor challenge.' });
    }
  });

  // 10. Resolve Investor Challenge
  app.post('/api/resolve-challenge', async (req: Request, res: Response) => {
    try {
      const { intake, slides, currentScore, challenge, founderAnswer, analysis } = req.body;
      if (!intake || !slides || !currentScore || !challenge || !founderAnswer) {
        return res.status(400).json({ error: 'Intake, slides, currentScore, challenge, and founderAnswer are required.' });
      }
      const result = await resolveInvestorChallenge(intake, slides, currentScore, challenge, founderAnswer, analysis);
      res.json(result);
    } catch (error: any) {
      console.error('Error in /api/resolve-challenge:', error);
      res.status(500).json({ error: error.message || 'Failed to resolve investor challenge.' });
    }
  });

  // Vite middleware for development vs static production serve
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PitchForge AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

