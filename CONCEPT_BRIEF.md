# Career OS — Concept Brief

**Primary audience:** Candidates
**Module:** Career Path Navigator (Candidates · 01) — extended across one shared
graph into Smart Talent Matching (Employers · 01) and Lifelong Outcome Loop
(Universities · 01), plus a public Skills Demand Map wildcard.
**Build scope:** Career OS core jobsite + the above modules, as one integrated system.
**Live demo:** https://careeros-ruddy.vercel.app

---

## What we're building

Career OS is a jobsite where the unit of matching is the **career path, not the
keyword** — a navigation tool, not a prediction tool. It shows people the realistic
routes ahead for someone of their shape, the trade-offs of each, and the next move
that gets them there. The user keeps agency; we just give them better data than they
could assemble alone.

The whole product is **one career-trajectory graph viewed from different sides** —
roles, skills, and the weighted edges of how people actually move between jobs. That
single data model is what makes everything cohere, and it's the heart of our build.

## The problem

Every system between people and opportunity sees only a fragment. Job boards optimise
for application *volume*, which is exactly why both sides drown in spam and ghosting.
ATS and matching tools are keyword filters that match where someone has *been*, never
where they're *heading* — structurally punishing fresh graduates and career-switchers,
precisely Talentbank's audience. And nobody holds the long view: a career gets treated
as a stack of disconnected applications rather than the 40-year arc it actually is.

## How the one graph serves each audience

**Candidates — Career Path Navigator (primary).** Instead of one "recommended job,"
we render the **Landscape Map**: an interactive, multi-hop flow of where people like
you realistically went next — each direction annotated with salary range (RM), typical
time horizon, the specific skills between you and it, and an honest one-line trade-off.
Thicker paths mean more people took them. Click any role to re-root the map and explore
the whole graph hop by hop. Then a **personalised, AI-generated roadmap** turns a chosen
destination into a concrete, phased plan around your actual skill gap. No black-box
scores; ranges and plain-language reasons throughout.

**Employers — Smart Talent Matching.** The same graph, read for fit. Candidates are
ranked by *trajectory alignment* — how close their path is to the role and how much of
the skill set they already hold — and **every match carries an explained reason**
citing real evidence, never a naked percentage. Paired with **Quiet Signals**:
candidates stay anonymous and findable, employers get a limited outreach budget, and
each message must include a specific, AI-validated "why you" — so generic spam cannot
get through. Identity is revealed only on accept. Scarcity plus forced specificity
removes the noise that makes both sides cynical.

**Universities — Lifelong Outcome Loop.** The same graph read backward, per
institution: graduate employability by field, starting salaries, at-risk programmes
to intervene on, and curriculum-vs-market gaps. Outcome figures follow the Ministry of
Higher Education's Graduate Tracer Study method; national benchmarks are pulled **live
from the Department of Statistics Malaysia (DOSM) open data API**.

**Wildcard — Skills Demand Map.** A public, downloadable view of where skills are in
demand across Malaysia (e.g. Bayan Lepas embedded, Cyberjaya cloud), with real DOSM
labour-market data and an open-data CSV export — for graduates, universities, and
policymakers alike.

## Why this fits the Career OS vision

The brief asks for one coherent thing, not a hedge. Our differentiator is the
**connective tissue between all three audiences on a single graph** — the "One Career
OS" thesis in Talentbank's own header. It maps directly to the heaviest scored
criterion (System Design & Integration): adding a new audience is a new *view*, not a
new product.

## AI craft

Four distinct, defensible LLM uses (Azure OpenAI; o4-mini + gpt-5.4-mini), each with a
deterministic fallback so nothing is brittle: resume → structured profile parsing
(with PDF upload), uncertainty-calibrated path narration, personalised roadmap
generation, and the Quiet Signals spam validator.

## What we've already shipped (and the 28-day plan)

The live demo already runs end-to-end: real Supabase auth + Postgres + row-level
security, the full candidate and employer flows, the university and demand lenses,
30 roles across tech, finance, healthcare, and business, and real DOSM data. The
28-day build will deepen data integration (official DOSM occupational wage + Tracer
datasets), add test coverage and accessibility hardening, and polish each surface to
production quality — directly integrable, as the rubric defines it.

## Honest framing

The trajectory graph is curated — no public source publishes Malaysian career
transitions — but salaries follow the Tracer method and national figures are live from
DOSM, with a documented path to full official ingestion. We'd rather state where the
uncertainty sits than pretend it isn't there. That honesty is the product.
