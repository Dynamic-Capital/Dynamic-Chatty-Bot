
-- 1) Key-Value Config Store for feature flags and settings
create table if not exists public.kv_config (
  key text primary key,
  value jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep updated_at fresh on updates (function already exists in your DB)
drop trigger if exists trg_kv_config_updated_at on public.kv_config;
create trigger trg_kv_config_updated_at
before update on public.kv_config
for each row execute function public.update_updated_at_column();

-- RLS: secure-by-default
alter table public.kv_config enable row level security;

-- Deny anonymous
drop policy if exists "Deny anonymous access to kv_config" on public.kv_config;
create policy "Deny anonymous access to kv_config"
  on public.kv_config
  for all
  using (false);

-- Service role full access (Edge functions use service role)
drop policy if exists "Service role can manage kv_config" on public.kv_config;
create policy "Service role can manage kv_config"
  on public.kv_config
  for all
  using (true)
  with check (true);



-- 2) Abuse ban list used by the bot and retention jobs
create table if not exists public.abuse_bans (
  id uuid primary key default gen_random_uuid(),
  telegram_id text not null,
  reason text,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  created_by text
);

-- Helpful index for blocking checks
create index if not exists idx_abuse_bans_tg on public.abuse_bans(telegram_id);

-- RLS: secure-by-default
alter table public.abuse_bans enable row level security;

-- Deny anonymous
drop policy if exists "Deny anonymous access to abuse_bans" on public.abuse_bans;
create policy "Deny anonymous access to abuse_bans"
  on public.abuse_bans
  for all
  using (false);

-- Service role full access (Edge functions/admin tools)
drop policy if exists "Service role can manage abuse_bans" on public.abuse_bans;
create policy "Service role can manage abuse_bans"
  on public.abuse_bans
  for all
  using (true)
  with check (true);
