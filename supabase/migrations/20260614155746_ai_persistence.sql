-- AI persistence: cache landscape narration, store trackable roadmaps, and keep
-- a coach chat history. Closes the loop so AI output is durable, not throwaway.

-- Cached narration per (candidate, root role). Regenerated only when shape changes.
create table if not exists public.narration_cache (
  profile_id    uuid not null references public.profiles(id) on delete cascade,
  root_role_id  text not null,                 -- seed role id, e.g. "r_ai_engineer"
  shape_hash    text not null,                 -- hash of skills, to invalidate on change
  text          text not null,
  used_ai       boolean not null default false,
  created_at    timestamptz not null default now(),
  primary key (profile_id, root_role_id)
);

-- Saved, trackable roadmaps.
create table if not exists public.roadmaps (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null references public.profiles(id) on delete cascade,
  from_role     text not null,
  to_role       text not null,
  to_role_id    text,                          -- seed id of the target
  company       text,
  summary       text,
  total_months  int,
  phases        jsonb not null default '[]'::jsonb,
  done_steps    jsonb not null default '[]'::jsonb,  -- ["phaseIdx:stepIdx", ...]
  used_ai       boolean not null default false,
  created_at    timestamptz not null default now()
);

-- Coach chat messages.
create table if not exists public.coach_messages (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null references public.profiles(id) on delete cascade,
  role          text not null,                 -- 'user' | 'assistant'
  content       text not null,
  created_at    timestamptz not null default now()
);

-- RLS: each candidate owns their rows.
alter table public.narration_cache enable row level security;
alter table public.roadmaps        enable row level security;
alter table public.coach_messages  enable row level security;

drop policy if exists "own narration" on public.narration_cache;
create policy "own narration" on public.narration_cache for all to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

drop policy if exists "own roadmaps" on public.roadmaps;
create policy "own roadmaps" on public.roadmaps for all to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

drop policy if exists "own coach messages" on public.coach_messages;
create policy "own coach messages" on public.coach_messages for all to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());
