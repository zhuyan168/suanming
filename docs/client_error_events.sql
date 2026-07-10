-- Run once in the Supabase SQL editor.
create table if not exists public.client_error_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete set null,
  guest_id uuid null,
  source text not null,
  message text not null,
  stack text null,
  component_stack text null,
  page_path text null,
  locale text null,
  browser text null,
  user_agent text null,
  ip_hash text null,
  created_at timestamptz not null default now(),
  constraint client_error_events_message_length
    check (char_length(message) between 1 and 2000)
);

create index if not exists client_error_events_created_idx
  on public.client_error_events (created_at desc);

create index if not exists client_error_events_source_created_idx
  on public.client_error_events (source, created_at desc);

create index if not exists client_error_events_user_created_idx
  on public.client_error_events (user_id, created_at desc)
  where user_id is not null;

create index if not exists client_error_events_guest_created_idx
  on public.client_error_events (guest_id, created_at desc)
  where guest_id is not null;

alter table public.client_error_events enable row level security;

-- No browser-facing policies are created. The app's server uses the service role.
comment on table public.client_error_events is
  'First-party frontend runtime error logs for debugging. Avoid storing question text or sensitive user input.';
