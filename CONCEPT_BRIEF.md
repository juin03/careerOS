# Career OS — Concept Brief

**Team audience focus:** Candidates (primary) + Employers, with a University lens.
**Modules:** Career Path Navigator (Candidates 01) + Smart Talent Matching (Employers 01)
+ Lifelong Outcome Loop (Universities 01) — delivered as one system, not three.

---

## The problem we're solving

Every system between graduates and opportunity sees only a fragment. Job boards see
vacancies and optimise for application volume — which is exactly why both sides drown
in spam and ghosting. ATS and matching systems are keyword filters: they match where
someone has *been*, never where they're *heading*, which structurally punishes fresh
graduates and career-switchers — precisely Talentbank's core audience. And nobody holds
the long view. Every job search restarts from zero; a career is treated as a stack of
disconnected applications rather than the 40-year arc it actually is.

The result is cynicism on both sides and decisions made in the dark.

## Our position

Career OS is a **navigation tool, not a prediction tool**. It never tells anyone what
their career *will* be. It shows the realistic paths available to people of a similar
shape — skills, education, prior roles, geography — the trade-offs each path implies,
and the next move that gets them there. The user keeps agency; we just give them better
data than they could ever assemble alone. No black-box scores. No false precision.
Uncertainty is stated in plain language.

## The one idea that makes it coherent

We don't build three modules. We build **one career-trajectory graph and view it from
three sides.** The same data model — roles, skills, and the weighted edges of how people
actually move between them — becomes:

- **The candidate's Landscape Map.** Instead of a single "recommended job", we render
  the landscape: where people like you went next, each direction annotated with its
  salary range (in RM), typical time horizon, the specific skills between you and it,
  and an honest one-line trade-off. Thicker paths mean more people took them. Then
  **GPS rerouting**: pick a destination and real job listings surface as stepping
  stones toward it; choose a different road and it recalculates.

- **The employer's Smart Matching.** The same graph, read for fit. Candidates are
  ranked by *trajectory alignment* — how close their path is to the role and how much
  of the skill set they already hold — and **every match carries an explained reason**,
  citing the candidate's actual skills and trajectory. No naked percentages anywhere.
  Paired with **Quiet Signals**: candidates can be findable yet anonymous, employers get
  a limited outreach budget, and each message must include a specific, AI-validated
  "why you" — generic spam literally cannot pass the gate. Identity is revealed only on
  accept. Scarcity plus forced specificity kills the noise structurally.

- **The university's Outcome Loop.** The same graph, read backward and filtered to one
  institution's alumni: where graduates actually flowed, which skill gaps recur against
  market demand, and the live outcome flows — so teaching can be measured against reality
  long after graduation day.

This is the system-design answer: one schema, three honest lenses. Adding a fourth
audience later means a new view, not a new product.

## Why this wins on the rubric

- **Product & UX (30%):** solves the named problem (careers as transactions) with a
  specific mechanic (path-as-the-unit-of-matching), for Talentbank's real audience.
- **System Design (25%):** one coherent graph, multiple surfaces — the cleanest possible
  integration story, and it visibly fits the broader Career OS pattern.
- **Completeness (20%):** working end-to-end with real auth, a real Postgres database
  with row-level security, and a live demo URL. Built to be directly integrable.
- **AI Craft (15%):** three distinct, defensible LLM uses — resume→graph parsing,
  uncertainty-calibrated path narration, and the spam-blocking outreach validator —
  each with a deterministic fallback so the product is never brittle.
- **Code Quality (10%):** typed throughout, versioned migrations, a pure-function engine
  separated from UI, and documentation that reads cleanly to someone who didn't write it.

## What we deliberately left out

No Fair Pay Engine, AI coach chatbot, onboarding predictor, or gamification. Each would
be a *separate* idea bolted on; every one would dilute the single-graph story that makes
the architecture coherent. The brief asks for a position, not a hedge — this is ours.

## Tech

Next.js 16 · React 19 · TypeScript · Tailwind v4 · shadcn/ui · React Flow (the map) ·
Recharts (university analytics) · Supabase (Postgres, Auth, RLS) · Gemini for AI, with
graceful fallback. Light/dark theme follows the system default.
