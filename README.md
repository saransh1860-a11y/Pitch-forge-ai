# PitchForge AI - Investor-Grade Pitch Engine

PitchForge AI generates, analyzes, scores, and autonomously refines 10-slide VC pitch decks with real institutional heuristics and closed-loop agentic improvement.

---

## ⚡ Deploying to Vercel (Recommended)

1. Push your repository to **GitHub** or **GitLab**.
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** → **Project**.
3. Import your repository.
4. Set **Framework Preset**: `Vite` (Output directory: `dist`).
5. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: *(Your Google Gemini API Key)*
6. Click **Deploy**!
   *(The included `vercel.json` and `api/index.ts` will automatically route the frontend SPA and all `/api/*` serverless requests without any 404 NOT_FOUND routing issues)*.

---

## 🚀 Deploying to Render (Web Service)

### Option 1: Automatic Blueprint (Zero Configuration)
1. In the [Render Dashboard](https://dashboard.render.com/), click **New +** → **Blueprint**.
2. Connect your repository. Render will automatically detect `render.yaml`.
3. Enter your `GEMINI_API_KEY` under Environment Variables and click **Apply**!

### Option 2: Manual Web Service
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Health Check Path**: `/api/health`
- **Environment Variables**: `GEMINI_API_KEY`

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
