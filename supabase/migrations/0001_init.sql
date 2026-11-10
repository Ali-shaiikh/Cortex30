-- Mind Gym: initial schema. Run this once in the Supabase SQL editor.
-- Three tables, Row Level Security on, every user can only see their own rows.

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,20}$'),
  start_date date not null default ((now() at time zone 'Asia/Kolkata')::date),
  created_at timestamptz not null default now(),
  -- AI rate limiting (15 calls per user per Asia/Kolkata day). Only writable via consume_ai_call().
  ai_calls_date date,
  ai_calls_count integer not null default 0
);

-- ---------------------------------------------------------------------------
-- submissions
-- ---------------------------------------------------------------------------
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  day integer not null check (day between 1 and 30),
  category text not null check (category in ('logic', 'analytical', 'critical', 'creative')),
  answer text not null,
  reasoning text not null,
  confidence integer not null check (confidence between 0 and 100),
  verdict text not null check (verdict in ('correct', 'partially_correct', 'incorrect', 'strong', 'developing', 'weak')),
  score numeric(4, 1) not null check (score between 0 and 10),
  feedback_json jsonb not null default '{}'::jsonb,
  thinking_pattern text,
  hints_used integer not null default 0 check (hints_used >= 0),
  is_bonus boolean not null default false,
  created_at timestamptz not null default now()
);

-- One main submission per user/day/skill; bonus exercises are separate (one per day).
create unique index if not exists submissions_main_unique
  on public.submissions (user_id, day, category) where not is_bonus;
create unique index if not exists submissions_bonus_unique
  on public.submissions (user_id, day) where is_bonus;
create index if not exists submissions_user_created on public.submissions (user_id, created_at);

-- ---------------------------------------------------------------------------
-- reports  (weekly coach reports, daily summary, generated bonus exercises, final review)
-- ---------------------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  kind text not null check (kind in ('weekly', 'summary', 'bonus', 'final')),
  week integer, -- weekly: 1-4; bonus: the day it belongs to; otherwise null
  text text not null,
  created_at timestamptz not null default now()
);
create index if not exists reports_user_kind on public.reports (user_id, kind, created_at desc);
create unique index if not exists reports_weekly_unique on public.reports (user_id, week) where kind = 'weekly';
create unique index if not exists reports_bonus_unique on public.reports (user_id, week) where kind = 'bonus';

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.submissions enable row level security;
alter table public.reports enable row level security;

drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "profiles: insert own" on public.profiles;
create policy "profiles: insert own" on public.profiles
  for insert with check (auth.uid() = id);
-- No update policy: start_date and AI counters can't be edited from the client.

-- Answers lock permanently: users can insert and read their submissions, never update or delete them.
drop policy if exists "submissions: read own" on public.submissions;
create policy "submissions: read own" on public.submissions
  for select using (auth.uid() = user_id);
drop policy if exists "submissions: insert own" on public.submissions;
create policy "submissions: insert own" on public.submissions
  for insert with check (auth.uid() = user_id);

drop policy if exists "reports: read own" on public.reports;
create policy "reports: read own" on public.reports
  for select using (auth.uid() = user_id);
drop policy if exists "reports: insert own" on public.reports;
create policy "reports: insert own" on public.reports
  for insert with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Functions (security definer: they do narrow writes RLS doesn't allow directly)
-- ---------------------------------------------------------------------------

-- Atomically spend one AI call. Returns the number of calls left today, or -1 if the limit is hit.
create or replace function public.consume_ai_call(daily_limit integer default 15)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  today date := (now() at time zone 'Asia/Kolkata')::date;
  used integer;
begin
  update public.profiles
     set ai_calls_count = case when ai_calls_date = today then ai_calls_count + 1 else 1 end,
         ai_calls_date = today
   where id = auth.uid()
     and (ai_calls_date is distinct from today or ai_calls_count < daily_limit)
  returning ai_calls_count into used;

  if used is null then
    return -1;
  end if;
  return daily_limit - used;
end;
$$;

-- Attach the single allowed follow-up question + coach reply to a submission.
create or replace function public.add_followup(submission_id uuid, question text, reply text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.submissions
     set feedback_json = feedback_json || jsonb_build_object(
           'followup', jsonb_build_object('question', question, 'answer', reply, 'at', now()))
   where id = submission_id
     and user_id = auth.uid()
     and not (feedback_json ? 'followup');
  return found;
end;
$$;

revoke all on function public.consume_ai_call(integer) from public, anon;
revoke all on function public.add_followup(uuid, text, text) from public, anon;
grant execute on function public.consume_ai_call(integer) to authenticated;
grant execute on function public.add_followup(uuid, text, text) to authenticated;

-- Check whether a username is free before signing up (returns only a boolean).
create or replace function public.username_available(name text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select not exists (select 1 from public.profiles where username = lower(name));
$$;
grant execute on function public.username_available(text) to anon, authenticated;

-- Create the profile automatically when a user signs up (username comes from sign-up metadata).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, lower(coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
