-- Years of experience drives seniority-aware path realism: a fresh grad should
-- not be told a 2-level jump (e.g. AI Engineer -> AI Lead) is a natural move.
alter table public.profiles
  add column if not exists years_experience numeric;
