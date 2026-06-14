-- Living Portfolio: structured experience + achievements on a candidate profile,
-- visible to employers. JSONB so the shape can evolve without migrations.
alter table public.profiles
  add column if not exists summary text,
  add column if not exists experience jsonb not null default '[]'::jsonb,
  add column if not exists achievements jsonb not null default '[]'::jsonb;

-- experience item:   { "title", "org", "period", "highlights": ["..."] }
-- achievement item:  { "title", "detail" }
