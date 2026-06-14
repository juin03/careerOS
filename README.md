# Career OS

**A jobsite where the unit of matching is the career *path*, not the keyword.**
A navigation tool, not a prediction tool — it shows people the realistic routes
ahead, the trade-offs of each, and the next move that gets them there. The user
keeps agency; we just give them better data than they could assemble alone.

🔗 **Live demo:** https://careeros-ruddy.vercel.app

```
Demo logins
  Candidate   candidate@careeros.demo  / demo1234   (pre-loaded with a real CV)
  Employer    employer@careeros.demo   / demo1234
  University   (no login)  →  /university
  Public      /careers  ·  /demand
```

---

## The idea in one line

Job boards see vacancies. ATS systems see keyword filters that match where you've
*been*, never where you're *heading* — which structurally punishes fresh graduates
and career-switchers. Nobody holds the long view. Career OS fixes this with **one
career-trajectory graph viewed from every side**: roles, skills, and the weighted
edges of how people actually move between jobs.

## What it does

**Candidates — Career Path Navigator**
- AI parses your resume (PDF upload or paste) into a structured profile + Living Portfolio
- **Landscape Map** — an interactive, multi-hop graph of realistic next moves, each
  with salary range (RM), time horizon, skill gap, and an honest trade-off. Re-root
  from any role to wander the whole graph.
- **Seniority-aware** — a fresh grad isn't told to become a Director next; moves are
  labelled *ready / stretch / long-term* against their actual years of experience
- **Personalised roadmaps** — generate a titled, trackable plan toward any role *or*
  any specific job listing; check off steps as you go
- **AI Career Coach** — a chat grounded in your graph + portfolio that presents
  options and trade-offs (never one verdict) and can update your profile
- Explainable job fit (which skills you have vs. need — no black-box score), GPS-routed
  job search, applications, Quiet Signals inbox

**Employers — Smart Talent Matching**
- Candidates ranked by *trajectory fit*, each with a plain-language reason — never a
  naked percentage
- **Quiet Signals** — anonymous candidates, a limited outreach budget, and an
  AI-validated "why you" so generic spam can't get through
- Full candidate portfolios (experience timeline + achievements), post jobs, review applicants

**Universities — Lifelong Outcome Loop**
- Per-institution graduate employability by field, at-risk programmes, starting salaries
- **Recommended actions** (what to fix, which market skills to add), grounded in the
  Graduate Tracer Study method, with an honest data-onboarding story

**Public — Skills Demand Map**
- Where skills are in demand across Malaysia, with real **live DOSM** labour data and a
  downloadable open-data CSV

## How it stays honest

The whole product is one graph viewed from different sides — adding an audience is a
new *view*, not a new product. National labour figures are live from the Department of
Statistics Malaysia (DOSM) API; salaries/outcomes follow the Graduate Tracer method;
the trajectory graph is curated (no public source publishes career transitions) and
labelled as such. No black-box scores, ranges not points, uncertainty stated plainly.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| UI | Tailwind v4, shadcn/ui, React Flow (the map), Recharts |
| Backend | Supabase — Postgres, Auth, Row-Level Security, versioned migrations |
| AI | Azure OpenAI (`o4-mini` + `gpt-5.4-mini`) — 5 distinct uses, all with deterministic fallbacks |
| Data | DOSM open-data API (live), pdf.js (client-side CV extraction) |
| Deploy | Vercel (CI/CD via GitHub Actions) |

**AI uses:** resume → structured profile/portfolio, landscape narration (cached),
roadmap generation, Quiet Signals spam validation, and the Career Coach.

## Architecture

```
                ┌───────────────────────────────┐
                │   Career-trajectory graph      │
                │   roles · skills · transitions │   src/lib/career-graph
                └───────────────┬───────────────┘
        ┌───────────────┬───────┴───────┬────────────────┐
   Candidate        Employer        University         Public
   navigate         find fit        outcomes loop      demand map
```

- `src/lib/career-graph/` — seed data + the engine (pure functions: landscape,
  seniority-aware reachability, BFS routing, explainable matching)
- `src/lib/ai/` — provider wrapper + the five AI features, each with a fallback
- `src/lib/dosm.ts` — live Malaysian labour-market data
- `supabase/migrations/` — versioned schema with RLS

## Running locally

```bash
npm install
cp .env.example .env.local      # add Supabase URL + key, Azure OpenAI vars
npm run dev
```

```bash
# Database
npx supabase link --project-ref <ref>
npx supabase db push
node scripts/seed-demo.mjs       # seed the graph + demo accounts
```

Without the AI keys the app still works end-to-end — every AI feature degrades to a
deterministic fallback.

## Deployment

CI/CD lives in `.github/workflows/deploy.yml`: lint + build on every push, then deploy
to Vercel. App env vars are set in the Vercel project; see the deployment section of the
concept brief for the exact setup.

---

*Built for the Career OS challenge by Talentbank.*
