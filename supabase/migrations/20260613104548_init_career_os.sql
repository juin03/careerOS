-- Career OS — database schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query → paste → Run).
-- Safe to re-run: uses "if not exists" and "drop policy if exists" guards.

-- =============================================================
-- ENUMS
-- =============================================================
do $$ begin
  create type account_role as enum ('candidate', 'employer', 'university');
exception when duplicate_object then null; end $$;

do $$ begin
  create type findability as enum ('open', 'quiet', 'closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type application_status as enum ('applied', 'reviewing', 'interview', 'offer', 'rejected', 'withdrawn');
exception when duplicate_object then null; end $$;

-- =============================================================
-- REFERENCE DATA (the career graph: roles, companies, skills, edges)
-- These are public, read-only to all authenticated users. Seeded by app.
-- =============================================================

-- A role node in the career graph (e.g. "QA Engineer", "Product Manager").
create table if not exists public.roles (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  family        text not null,                 -- e.g. "Engineering", "Product", "Data"
  seniority     int  not null default 1,       -- 1=entry .. 5=exec, used to order the landscape
  salary_min    int,                           -- RM/month, lower band
  salary_max    int,                           -- RM/month, upper band
  description   text,
  created_at    timestamptz not null default now()
);

create table if not exists public.companies (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  industry      text,
  location      text,                          -- e.g. "Kuala Lumpur"
  size          text,                          -- e.g. "201-500"
  created_at    timestamptz not null default now()
);

create table if not exists public.skills (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,
  category      text                           -- e.g. "Technical", "Domain", "Soft"
);

-- Which skills a role needs (the "gap" calculation joins against this).
create table if not exists public.role_skills (
  role_id       uuid not null references public.roles(id) on delete cascade,
  skill_id      uuid not null references public.skills(id) on delete cascade,
  weight        int not null default 1,        -- importance of skill to the role
  primary key (role_id, skill_id)
);

-- A directed edge: people in role "from" commonly move to role "to".
-- This is the heart of the Landscape Map and GPS rerouting.
create table if not exists public.transitions (
  id            uuid primary key default gen_random_uuid(),
  from_role_id  uuid not null references public.roles(id) on delete cascade,
  to_role_id    uuid not null references public.roles(id) on delete cascade,
  share         numeric not null,              -- 0..1 fraction of people who took this path
  median_months int,                           -- typical time to make the move
  note          text,                          -- plain-language trade-off (no black-box scores)
  unique (from_role_id, to_role_id)
);

-- =============================================================
-- USER DATA
-- =============================================================

-- One profile per auth user. role = which lens they use.
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  account_role  account_role not null default 'candidate',
  full_name     text,
  headline      text,                          -- e.g. "Fresh grad, Computer Science, UM"
  location      text,
  current_role_id uuid references public.roles(id),
  findability   findability not null default 'open',
  resume_text   text,                          -- raw pasted/uploaded resume
  company_id    uuid references public.companies(id),   -- for employer accounts
  university    text,                          -- for university accounts
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Skills a candidate claims (used against role_skills to compute gaps).
create table if not exists public.profile_skills (
  profile_id    uuid not null references public.profiles(id) on delete cascade,
  skill_id      uuid not null references public.skills(id) on delete cascade,
  level         int not null default 3,        -- 1..5 self-rated
  primary key (profile_id, skill_id)
);

-- Job listings posted by employers.
create table if not exists public.jobs (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid references public.companies(id) on delete set null,
  posted_by     uuid references public.profiles(id) on delete set null,
  role_id       uuid references public.roles(id),       -- ties listing into the graph
  title         text not null,
  location      text,
  salary_min    int,
  salary_max    int,
  description   text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

create table if not exists public.applications (
  id            uuid primary key default gen_random_uuid(),
  job_id        uuid not null references public.jobs(id) on delete cascade,
  candidate_id  uuid not null references public.profiles(id) on delete cascade,
  status        application_status not null default 'applied',
  cover_note    text,
  created_at    timestamptz not null default now(),
  unique (job_id, candidate_id)
);

-- Quiet Signals: employer outreach to a (possibly anonymous) candidate.
create table if not exists public.signals (
  id            uuid primary key default gen_random_uuid(),
  employer_id   uuid not null references public.profiles(id) on delete cascade,
  candidate_id  uuid not null references public.profiles(id) on delete cascade,
  job_id        uuid references public.jobs(id) on delete set null,
  why_you       text not null,                 -- AI-validated specific reason; generic spam rejected
  accepted      boolean,                       -- null=pending, true=revealed, false=declined
  created_at    timestamptz not null default now(),
  unique (employer_id, candidate_id, job_id)
);

-- =============================================================
-- updated_at trigger for profiles
-- =============================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_profiles_touch on public.profiles;
create trigger trg_profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- =============================================================
-- Auto-create a profile row when a user signs up
-- =============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, account_role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'account_role')::account_role, 'candidate')
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================
alter table public.roles          enable row level security;
alter table public.companies      enable row level security;
alter table public.skills         enable row level security;
alter table public.role_skills    enable row level security;
alter table public.transitions    enable row level security;
alter table public.profiles       enable row level security;
alter table public.profile_skills enable row level security;
alter table public.jobs           enable row level security;
alter table public.applications   enable row level security;
alter table public.signals        enable row level security;

-- Reference/graph data: readable by any authenticated user.
drop policy if exists "read roles"        on public.roles;
drop policy if exists "read companies"    on public.companies;
drop policy if exists "read skills"       on public.skills;
drop policy if exists "read role_skills"  on public.role_skills;
drop policy if exists "read transitions"  on public.transitions;
create policy "read roles"       on public.roles       for select to authenticated using (true);
create policy "read companies"   on public.companies   for select to authenticated using (true);
create policy "read skills"      on public.skills      for select to authenticated using (true);
create policy "read role_skills" on public.role_skills for select to authenticated using (true);
create policy "read transitions" on public.transitions for select to authenticated using (true);

-- Allow authenticated users to seed reference data (demo convenience).
drop policy if exists "write roles"        on public.roles;
drop policy if exists "write companies"    on public.companies;
drop policy if exists "write skills"       on public.skills;
drop policy if exists "write role_skills"  on public.role_skills;
drop policy if exists "write transitions"  on public.transitions;
create policy "write roles"       on public.roles       for all to authenticated using (true) with check (true);
create policy "write companies"   on public.companies   for all to authenticated using (true) with check (true);
create policy "write skills"      on public.skills      for all to authenticated using (true) with check (true);
create policy "write role_skills" on public.role_skills for all to authenticated using (true) with check (true);
create policy "write transitions" on public.transitions for all to authenticated using (true) with check (true);

-- Profiles: anyone authenticated can read (employers browse candidates);
-- you can only modify your own.
drop policy if exists "read profiles"   on public.profiles;
drop policy if exists "update own profile" on public.profiles;
drop policy if exists "insert own profile" on public.profiles;
create policy "read profiles"      on public.profiles for select to authenticated using (true);
create policy "update own profile" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);

-- Profile skills: owner manages; all authenticated can read (for matching).
drop policy if exists "read profile_skills"  on public.profile_skills;
drop policy if exists "write profile_skills" on public.profile_skills;
create policy "read profile_skills"  on public.profile_skills for select to authenticated using (true);
create policy "write profile_skills" on public.profile_skills for all to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- Jobs: all authenticated read; poster manages their own.
drop policy if exists "read jobs"   on public.jobs;
drop policy if exists "write jobs"  on public.jobs;
create policy "read jobs"  on public.jobs for select to authenticated using (true);
create policy "write jobs" on public.jobs for all to authenticated
  using (posted_by = auth.uid()) with check (posted_by = auth.uid());

-- Applications: candidate sees own; job poster sees applications to their jobs.
drop policy if exists "read applications"   on public.applications;
drop policy if exists "insert applications" on public.applications;
drop policy if exists "update applications" on public.applications;
create policy "read applications" on public.applications for select to authenticated using (
  candidate_id = auth.uid()
  or exists (select 1 from public.jobs j where j.id = job_id and j.posted_by = auth.uid())
);
create policy "insert applications" on public.applications for insert to authenticated
  with check (candidate_id = auth.uid());
create policy "update applications" on public.applications for update to authenticated using (
  candidate_id = auth.uid()
  or exists (select 1 from public.jobs j where j.id = job_id and j.posted_by = auth.uid())
);

-- Signals: visible to the two parties involved.
drop policy if exists "read signals"   on public.signals;
drop policy if exists "insert signals" on public.signals;
drop policy if exists "update signals" on public.signals;
create policy "read signals" on public.signals for select to authenticated using (
  employer_id = auth.uid() or candidate_id = auth.uid()
);
create policy "insert signals" on public.signals for insert to authenticated
  with check (employer_id = auth.uid());
create policy "update signals" on public.signals for update to authenticated using (
  employer_id = auth.uid() or candidate_id = auth.uid()
);
