
-- 1) Create plan_channels table for managing channel/group links per plan
create table if not exists public.plan_channels (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references public.subscription_plans(id) on delete cascade,
  channel_name text not null,
  channel_type text check (channel_type in ('channel','group')) default 'channel',
  invite_link text not null,
  chat_id text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2) Enable Row Level Security
alter table public.plan_channels enable row level security;

-- 3) Policies
-- Public can view only active channels
drop policy if exists "Public can view plan channels" on public.plan_channels;
create policy "Public can view plan channels"
  on public.plan_channels
  for select
  to public
  using (is_active = true);

-- Admins (via profiles.role) can manage all rows
drop policy if exists "Admins can manage plan channels" on public.plan_channels;
create policy "Admins can manage plan channels"
  on public.plan_channels
  for all
  to authenticated
  using (exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  ))
  with check (exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  ));

-- 4) Index for performance
create index if not exists idx_plan_channels_plan_id_active
  on public.plan_channels(plan_id, is_active);

-- 5) Keep updated_at fresh
drop trigger if exists update_plan_channels_updated_at on public.plan_channels;
create trigger update_plan_channels_updated_at
  before update on public.plan_channels
  for each row
  execute function public.update_updated_at_column();
