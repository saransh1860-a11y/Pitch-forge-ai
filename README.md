# PitchForge AI - Investor-Grade Pitch Engine

PitchForge AI generates, analyzes, scores, and autonomously refines 10-slide VC pitch decks with real institutional heuristics and closed-loop agentic improvement.

---

## 🚀 Deploying to Render (Zero Configuration)

You can deploy PitchForge AI to [Render](https://render.com) in 2 minutes:

### Option 1: Automatic Blueprint (Recommended)
1. Push this repository to your GitHub or GitLab account.
2. Log in to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** → **Blueprint**.
4. Connect your repository. Render will automatically read `render.yaml`.
5. Under Environment Variables, provide your `GEMINI_API_KEY`.
6. Click **Apply**!

---

### Option 2: Manual Web Service Setup
1. In Render, click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the settings:
   - **Name**: `pitchforge-ai`
   - **Runtime**: `Node`
   - **Branch**: `main` (or your default branch)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` or `Starter`
4. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: *Your Google Gemini API Key*
   - `NODE_ENV`: `production`
5. Click **Deploy Web Service**!

---

## 🛠 Local Development

```bash
# Install dependencies
npm install

# Run full-stack dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```
