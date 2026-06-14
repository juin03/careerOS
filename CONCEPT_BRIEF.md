# Career OS — Concept Brief

**Primary audience:** Candidates
**Module:** Career Path Navigator (Candidates · 01) — extended across one shared
graph into Smart Talent Matching (Employers · 01), Lifelong Outcome Loop
(Universities · 01), the AI Career Coach (Candidates · 03), Living Portfolio
(Candidates · 02), and a public Skills Demand Map wildcard.
**Build scope:** Career OS core jobsite + the above, as one integrated system.
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
single data model is what makes everything cohere, and it is the heart of the build.

## The problem

Every system between people and opportunity sees only a fragment. Job boards optimise
for application *volume*, which is exactly why both sides drown in spam and ghosting.
ATS and matching tools are keyword filters that match where someone has *been*, never
where they're *heading* — structurally punishing fresh graduates and career-switchers,
precisely Talentbank's audience. And nobody holds the long view: a career gets treated
as a stack of disconnected applications rather than the 40-year arc it actually is.

## How the one graph serves each audience

**Candidates — Career Path Navigator (primary).** Instead of one "recommended job," we
render the **Landscape Map**: an interactive, multi-hop graph of where people like you
realistically went next — each direction annotated with salary range (RM), time horizon,
the specific skills between you and it, and an honest trade-off. Crucially, moves are
**seniority-aware**: a fresh graduate isn't told to become a Director next; each path is
labelled *ready, stretch, or long-term* against their actual years of experience.
A **personalised, trackable roadmap** then turns any role — or any specific job listing —
into a phased plan around your real skill gap. And an **AI Career Coach** chats with you,
grounded in your own graph and portfolio, presenting options and trade-offs (never one
verdict) and updating your profile as you grow. Your resume becomes a **Living Portfolio**
the moment you upload it (PDF), compiled and kept current.

**Employers — Smart Talent Matching.** The same graph, read for fit. Candidates are
ranked by *trajectory alignment* — how close their path is to the role and how much of
the skill set they already hold — and **every match carries an explained reason** citing
real evidence, never a naked percentage. Paired with **Quiet Signals**: candidates stay
anonymous and findable, employers get a limited outreach budget, and each message must
include a specific, AI-validated "why you" — so generic spam cannot get through. Identity
is revealed only on accept.

**Universities — Lifelong Outcome Loop.** The same graph read backward, per institution:
graduate employability by field, starting salaries, at-risk programmes to intervene on,
curriculum-vs-market gaps, and **recommended actions** — grounded in the Ministry of
Higher Education's Graduate Tracer Study method, with national benchmarks live from the
Department of Statistics Malaysia (DOSM).

**Wildcard — Skills Demand Map.** A public, downloadable view of where skills are in
demand across Malaysia, backed by real DOSM labour data and an open-data CSV export — for
graduates, universities, and policymakers alike.

## Why this fits the Career OS vision

The brief asks for one coherent thing, not a hedge. Our differentiator is the
**connective tissue between every audience on a single graph** — the "One Career OS"
thesis in Talentbank's own header. Adding a new audience is a new *view*, not a new
product, which maps directly to the System Design criterion.

## AI craft

Five distinct, defensible LLM uses (Azure OpenAI; `o4-mini` + `gpt-5.4-mini`), each with
a deterministic fallback so nothing is brittle: resume → structured profile/portfolio
(PDF upload), landscape narration (cached for cost/speed), personalised roadmap
generation, the Quiet Signals spam validator, and the grounded Career Coach.

## What's already shipped

The live demo runs end-to-end: real Supabase auth, Postgres, and row-level security; the
full candidate and employer flows; the university and demand lenses; **31 roles across
tech, finance, healthcare, and business**; live DOSM data; and a candidate account
pre-loaded by parsing a real CV. Honest framing throughout — ranges not points, explained
matches, and clear labelling of which data is live versus curated.

## The 28-day plan

Deepen data integration (official DOSM occupational-wage and Tracer datasets), add test
coverage and accessibility hardening, broaden the graph toward a real taxonomy
(MASCO/O*NET) so role gaps are rare, and polish every surface to production quality —
directly integrable, as the rubric defines it.

## Honest framing

The trajectory graph is curated — no public source publishes Malaysian career
transitions — but salaries follow the Tracer method and national figures are live from
DOSM, with a documented path to full official ingestion. We'd rather state where the
uncertainty sits than pretend it isn't there. That honesty is the product.
