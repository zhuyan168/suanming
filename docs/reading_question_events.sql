-- Run once in the Supabase SQL editor.
create table if not exists public.reading_question_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete set null,
  guest_id uuid null,
  question_text text not null,
  question_category text null,
  spread_type text not null,
  locale text not null,
  page_path text not null,
  result_viewed boolean not null default false,
  signup_after_result boolean not null default false,
  paywall_shown boolean not null default false,
  subscribe_clicked boolean not null default false,
  created_at timestamptz not null default now(),
  constraint reading_question_events_actor_check
    check (user_id is not null or guest_id is not null),
  constraint reading_question_events_question_length
    check (char_length(question_text) between 1 and 2000)
);

create index if not exists reading_question_events_user_created_idx
  on public.reading_question_events (user_id, created_at desc)
  where user_id is not null;

create index if not exists reading_question_events_guest_created_idx
  on public.reading_question_events (guest_id, created_at desc)
  where guest_id is not null;

alter table public.reading_question_events enable row level security;

-- No browser-facing policies are created. The app's server uses the service role.
comment on table public.reading_question_events is
  'First-party tarot question funnel events. Do not add IP or sensitive device data.';

