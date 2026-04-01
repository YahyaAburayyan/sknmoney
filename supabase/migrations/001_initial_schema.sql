-- ============================================================
-- SknMoney — Initial Schema
-- Run this in your Supabase SQL Editor.
-- ============================================================

-- ============================================================
-- PROFILES
-- Extends auth.users. Created automatically via trigger.
-- ============================================================
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text not null,
  email         text not null unique,
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================================
-- GROUPS (APARTMENTS / HOUSEHOLDS)
-- ============================================================
create table if not exists public.groups (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  description  text,
  invite_code  text not null unique default upper(substr(md5(random()::text), 1, 6)),
  created_by   uuid not null references public.profiles(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_groups_invite_code on public.groups(invite_code);
create index if not exists idx_groups_created_by  on public.groups(created_by);


-- ============================================================
-- GROUP MEMBERSHIPS
-- ============================================================
create type if not exists group_role as enum ('admin', 'member');

create table if not exists public.group_members (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.groups(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  role       group_role not null default 'member',
  joined_at  timestamptz not null default now(),
  unique(group_id, user_id)
);

create index if not exists idx_group_members_group_id on public.group_members(group_id);
create index if not exists idx_group_members_user_id  on public.group_members(user_id);


-- ============================================================
-- EXPENSES
-- All monetary amounts in integer cents to avoid float bugs.
-- ============================================================
create type if not exists split_type as enum ('equal', 'custom');

create table if not exists public.expenses (
  id            uuid primary key default gen_random_uuid(),
  group_id      uuid not null references public.groups(id) on delete cascade,
  paid_by       uuid not null references public.profiles(id),
  description   text not null,
  amount_cents  integer not null check (amount_cents > 0),
  split_type    split_type not null default 'equal',
  date          date not null default current_date,
  notes         text,
  created_by    uuid not null references public.profiles(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz  -- soft delete: NULL = active
);

create index if not exists idx_expenses_group_id on public.expenses(group_id);
create index if not exists idx_expenses_paid_by  on public.expenses(paid_by);
create index if not exists idx_expenses_date     on public.expenses(date desc);
-- Partial index for active expenses
create index if not exists idx_expenses_active   on public.expenses(group_id, date desc)
  where deleted_at is null;


-- ============================================================
-- EXPENSE SPLITS
-- One row per beneficiary per expense.
-- Sum of amount_cents across splits for an expense must equal
-- the expense's amount_cents (enforced at application layer).
-- ============================================================
create table if not exists public.expense_splits (
  id            uuid primary key default gen_random_uuid(),
  expense_id    uuid not null references public.expenses(id) on delete cascade,
  user_id       uuid not null references public.profiles(id),
  amount_cents  integer not null check (amount_cents > 0),
  unique(expense_id, user_id)
);

create index if not exists idx_expense_splits_expense_id on public.expense_splits(expense_id);
create index if not exists idx_expense_splits_user_id    on public.expense_splits(user_id);


-- ============================================================
-- SETTLEMENTS / PAYMENTS
-- Direct payment from one group member to another.
-- No approval workflow — trust-based like Splitwise.
-- ============================================================
create table if not exists public.settlements (
  id            uuid primary key default gen_random_uuid(),
  group_id      uuid not null references public.groups(id) on delete cascade,
  paid_by       uuid not null references public.profiles(id),
  paid_to       uuid not null references public.profiles(id),
  amount_cents  integer not null check (amount_cents > 0),
  notes         text,
  date          date not null default current_date,
  created_by    uuid not null references public.profiles(id),
  created_at    timestamptz not null default now(),
  check (paid_by != paid_to)
);

create index if not exists idx_settlements_group_id on public.settlements(group_id);
create index if not exists idx_settlements_paid_by  on public.settlements(paid_by);
create index if not exists idx_settlements_paid_to  on public.settlements(paid_to);
create index if not exists idx_settlements_date     on public.settlements(date desc);
