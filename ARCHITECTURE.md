# PitchForge AI - System Architecture

This document details the architectural blueprint, data flows, and security boundaries of **PitchForge AI**.

---

## 🏗 High-Level Architecture Diagram

```mermaid
graph TD
    %% Client Layer
    subgraph Client [Client-Side App - SPA]
        A[React Router / View Layer] <--> B[Local State / Contexts]
        B <--> C[Local Storage Cache]
        B <--> Auth[AuthContext]
    end

    %% Network / API Gateway
    subgraph API [Hosting & API Routing - Vercel / Express]
        D[Vercel Serverless / Express Router]
        D <--> E[API Routes /api/*]
    end

    %% Storage Layer
    subgraph Storage [Database & Auth - Firebase]
        F[(Firestore DB)]
        G[Firebase Auth]
    end

    %% AI Layer
    subgraph AIService [Generative AI Layer - Google Gemini]
        H[Google GenAI Client]
        I[Model Fallback Controller]
        J[gemini-3.7-flash]
        K[gemini-3.1-flash-lite]
    end

    %% Connections
    A <-->|HTTP API Requests| E
    Auth <-->|Session State| G
    B <-->|Real-time Sync| F
    E <-->|SDK Call| H
    H -->|Primary: 8s Timeout| J
    H -->|Fallback| K
```

---

## 🗄 Core Architectural Layers

### 1. Presentation Layer (Client-Side SPA)
- **Framework & Build**: Built on React 19, TypeScript, and Vite.
- **State Management**:
  - `AuthContext`: Manages OAuth state, Anonymous / Guest users, and active session boundaries.
  - Custom subscription streams synchronizing active pitch deck edits securely.
- **Data Caching**: Utilizes `localStorage` for latency-free initial paints of the dashboard while the active subscription handshake with Firestore finishes.

### 2. Synchronization & Migration Flow
```mermaid
sequenceDiagram
    autonumber
    actor Founder as Guest User
    participant Local as localStorage
    participant Server as App Engine
    participant Auth as Firebase Auth
    participant DB as Cloud Firestore

    Founder->>Local: Draft pitch / Q&A challenge
    Local->>Founder: Instant load
    Founder->>Auth: Click Sign In with Google
    Auth-->>Founder: Return user details (UID)
    Founder->>Local: Read guest projects
    Local-->>Founder: Return guest payload
    Founder->>DB: Bulk write to Firestore (mapped to user's UID)
    Founder->>Local: Clear pitchforge_guest_projects
    Note over Founder,DB: Seamless account transition complete!
```

### 3. Server-Side Integration (API proxy)
- **Host**: Vercel Serverless / Node.js Express.
- **Security Rule**: To prevent API key extraction, the browser client **never** talks directly to Google Gemini. All generation requests are proxied securely through the `/api/*` endpoints.

### 4. Generative AI Engine (Gemini)
- **SDK**: Utilizes the modern, type-safe `@google/genai` library.
- **Optimized High-Availability Pipeline**:
  - **Primary Model**: `gemini-3.7-flash` (Optimized for lightning-fast structural text and score evaluations).
  - **Timeout Limit**: Restricts request times to **8 seconds** max per model attempt.
  - **Fallback Chain**: If the primary request fails or exceeds the timeout, the pipeline immediately falls back to `gemini-3.1-flash-lite` to ensure continuity.

---

## 🛡 Security Boundaries

1. **Firestore Rules**:
   - Ensures users can **only** read and write documents where `resource.data.ownerId == request.auth.uid`.
   - Strictly validates all schema types (e.g. `score` is a map, `ownerEmail` is a string, and custom evaluation scores are validated).
2. **Secret Management**:
   - `GEMINI_API_KEY` is loaded strictly in the server runtime environment (`process.env`), isolated from browser bundles.
