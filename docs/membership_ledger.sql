create table if not exists public.membership_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  source text not null check (source in ('creem', 'code', 'refund', 'manual')),
  action text not null check (action in ('extend', 'reverse')),
  days_delta integer not null,
  expires_before timestamptz,
  expires_after timestamptz,
  plan_key text,
  creem_event_id text,
  creem_subscription_id text,
  creem_product_id text,
  creem_period_end timestamptz,
  membership_code_id uuid,
  related_ledger_id uuid references public.membership_ledger(id),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists membership_ledger_creem_event_uidx
  on public.membership_ledger (creem_event_id)
  where creem_event_id is not null;

create unique index if not exists membership_ledger_creem_period_uidx
  on public.membership_ledger (creem_subscription_id, creem_period_end)
  where source = 'creem'
    and action = 'extend'
    and creem_subscription_id is not null
    and creem_period_end is not null;

create index if not exists membership_ledger_user_created_idx
  on public.membership_ledger (user_id, created_at desc);

alter table public.membership_ledger enable row level security;

drop policy if exists "Users can view own membership ledger" on public.membership_ledger;
create policy "Users can view own membership ledger"
  on public.membership_ledger
  for select
  using (auth.uid() = user_id);
