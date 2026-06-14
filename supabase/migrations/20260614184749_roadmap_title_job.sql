-- Each roadmap gets a human title and can be tied to a specific job it's for.
alter table public.roadmaps
  add column if not exists title text,
  add column if not exists job_id uuid references public.jobs(id) on delete set null,
  add column if not exists job_title text;
