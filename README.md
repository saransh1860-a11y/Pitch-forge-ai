# PitchForge AI - Investor-Grade Pitch Engine

PitchForge AI is an advanced, full-stack, AI-powered system designed to generate, analyze, score, and autonomously refine investor pitch decks using real venture capital heuristics and closed-loop agentic improvement.

Developed with React, TypeScript, and Tailwind CSS on the frontend, and an optimized Node.js server powered by Google Gemini, PitchForge AI helps founders build pitch decks that satisfy high-stakes institutional standards.

---

## ✨ Features

- **Autonomous 10-Slide Pitch Generation**: Generates comprehensive, slide-by-slide slide decks matching elite venture capital standards (Problem, Solution, Market, Business Model, Team, Traction, etc.).
- **Venture Heuristic Engine**: Dynamically scores pitch decks on a scale of 0 to 100, providing concrete, action-oriented structural critiques.
- **Investor Challenge Q&A Simulator**: Simulate mock partner meetings with high-stakes, meaning-based VC evaluation.
  - **Diligence Answer Key**: Generates the conceptual guidelines required to satisfy each specific question.
  - **Dynamic Meaning-Based Grading**: Distinguishes between genuine answers and evasive gibberish (e.g., "ABCD") using semantic logic.
  - **Separate Knowledge Score**: Grades your personal domain expertise from 0 to 100 without artificially inflating the static pitch deck's presentation quality score.
- **Seamless Database Synchronization**: Backed by Firebase Firestore and Authentication.
  - **Guest Session Migration**: Easily start pitches as an unauthenticated guest. When signing in, your pitches are seamlessly migrated to your profile without data loss.
- **High-Performance LLM Architecture**: Features a robust fallback mechanism that targets `gemini-3.7-flash` with rapid transitions to `gemini-3.1-flash-lite` within 8 seconds if congestion occurs.

---

## ⚡ Deploying to Vercel (Recommended)

1. Push your repository to **GitHub**, **GitLab**, or **Bitbucket**.
2. Go to the [Vercel Dashboard](https://vercel.com/) and click **Add New...** → **Project**.
3. Import your repository.
4. Set **Framework Preset**: `Vite` (Output directory: `dist`).
5. Under **Environment Variables**, configure:
   - `GEMINI_API_KEY`: *(Your Google Gemini API Key)*
   - Firebase configurations (if using persistent database integration, automatically supplied via client-side config).
6. Click **Deploy**!

> *The included `vercel.json` and `/api` serverless functions are pre-configured to automatically route the frontend SPA and all `/api/*` requests smoothly without any routing issues.*

---

## 🛠 Local Development

To run PitchForge AI locally on your machine:

```bash
# 1. Install dependencies
npm install

# 2. Run the full-stack development server
npm run dev

# 3. Build for production
npm run build

# 4. Start the production bundle locally
npm start
```

---

## 🧪 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion
- **Backend**: Express (CJS Node Server bundled via `esbuild`)
- **Database / Auth**: Firebase Firestore & Firebase Authentication
- **AI Engine**: `@google/genai` TypeScript SDK leveraging `gemini-3.7-flash` and `gemini-3.1-flash-lite`
