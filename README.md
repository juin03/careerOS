# Career OS

A jobsite reimagined as a **navigation tool, not a prediction tool**. The unit of
matching is the *career path*, not the keyword. One trajectory graph powers three
honest views: candidates see the landscape ahead, employers see who's heading their
way (with reasons, not naked scores), and universities see where graduates actually went.

Built for the Career OS challenge by Talentbank.

## The idea in one sentence

Most tools see a fragment — job boards see vacancies, ATS systems see filters. Career OS
holds the whole picture: a graph of how careers actually move, surfaced as a map you
navigate, recalculating like a GPS as you choose your own road.

## What's built

**Candidate lens** (Career Path Navigator)
- AI resume parsing → structured profile (skills, current role)
- **Landscape Map** — interactive React Flow graph of realistic next moves, each with
  salary range (RM), time horizon, skill gap, and a plain-language trade-off
- **GPS rerouting** — pick a destination; jobs surface as stepping stones toward it
- Job search, applications, and a Quiet Signals inbox

**Employer lens** (Smart Talent Matching)
- Talent ranked by *trajectory fit*, not keyword overlap — every match has an
  explained "why", never a naked percentage
- **Quiet Signals** — anonymous candidates, a limited outreach budget, and an
  AI-validated "why you" so generic spam can't get through
- Post jobs, review applicants with fit reads

**University lens** (Lifelong Outcome Loop)
- Read-only dashboard: where alumni went, recurring skill gaps, outcome flows —
  the same graph, viewed backward. Public demo at `/university`.

## Architecture

The whole product is one career-trajectory graph viewed from different sides.

```
                 ┌──────────────────────────┐
                 │   Career trajectory graph │
                 │  roles · skills · edges   │  (src/lib/career-graph)
                 └────────────┬─────────────┘
        ┌─────────────────────┼─────────────────────┐
   Candidate view        Employer view          University view
   (navigate forward)    (read, find fit)       (read backward)
```

- **`src/lib/career-graph/`** — seed data (Malaysian market) + the engine (pure
  functions: landscape, skill gaps, BFS routing, explainable matching). Single source
  of truth, deterministic, fast.
- **`src/lib/ai/`** — three distinct LLM uses (resume parse, path narration, spam
  validation), each with a deterministic fallback so the app works with or without a key.
- **Supabase** — Postgres + Auth + Row Level Security. Schema is a versioned migration
  (`supabase/migrations/`). Generated types in `src/lib/supabase/database.types.ts`.

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · shadcn/ui ·
React Flow · Recharts · Supabase · next-themes (light/dark, system default).

## Running locally

```bash
npm install
cp .env.example .env.local   # fill in Supabase URL + publishable key
npm run dev
```

Database schema:

```bash
npx supabase link --project-ref <ref>
npx supabase db push
```

Seed demo data (graph + sample accounts):

```bash
node scripts/seed-demo.mjs
```

### AI (optional)

Set `GEMINI_API_KEY` in `.env.local` to enable AI resume parsing, path narration,
and spam validation. Without it, the app falls back to deterministic heuristics —
every feature still works.

## Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Candidate | `candidate@careeros.demo` | `demo1234` |
| Employer | `employer@careeros.demo` | `demo1234` |

University view needs no login: visit `/university`.

## Design principles

A calm "instrument panel" aesthetic — neutral base, one accent, generous whitespace.
The restraint is the point: the product's thesis is *no false precision, no black-box
scores*, and the UI says that before you read a word. Full light/dark support follows
the system theme, with a manual toggle.
