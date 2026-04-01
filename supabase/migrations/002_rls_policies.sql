-- ============================================================
-- SknMoney — Row Level Security Policies
-- Run this AFTER 001_initial_schema.sql
-- ============================================================

-- Helper function: is the current authenticated user a member of a group?
create or replace function public.is_group_member(gid uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.group_members
    where group_id = gid and user_id = auth.uid()
  );
$$;

-- Helper function: is the current user the admin of a group?
create or replace function public.is_group_admin(gid uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.group_members
    where group_id = gid and user_id = auth.uid() and role = 'admin'
  );
$$;


-- ============================================================
-- PROFILES RLS
-- Anyone authenticated can read all profiles (needed to show names).
-- Users can only update their own profile.
-- ============================================================
alter table public.profiles enable row level security;

create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid());


-- ============================================================
-- GROUPS RLS
-- ============================================================
alter table public.groups enable row level security;

create policy "groups_select_members_only"
  on public.groups for select
  to authenticated
  using (is_group_member(id));

create policy "groups_insert_authenticated"
  on public.groups for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "groups_update_admin_only"
  on public.groups for update
  to authenticated
  using (is_group_admin(id));


-- ============================================================
-- GROUP MEMBERS RLS
-- ============================================================
alter table public.group_members enable row level security;

create policy "group_members_select_members"
  on public.group_members for select
  to authenticated
  using (is_group_member(group_id));

create policy "group_members_insert_self"
  on public.group_members for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "group_members_delete_self_or_admin"
  on public.group_members for delete
  to authenticated
  using (
    user_id = auth.uid()
    or is_group_admin(group_id)
  );


-- ============================================================
-- EXPENSES RLS
-- ============================================================
alter table public.expenses enable row level security;

create policy "expenses_select_members"
  on public.expenses for select
  to authenticated
  using (is_group_member(group_id));

create policy "expenses_insert_members"
  on public.expenses for insert
  to authenticated
  with check (is_group_member(group_id) and created_by = auth.uid());

create policy "expenses_update_creator"
  on public.expenses for update
  to authenticated
  using (created_by = auth.uid() and deleted_at is null);


-- ============================================================
-- EXPENSE SPLITS RLS
-- ============================================================
alter table public.expense_splits enable row level security;

create policy "expense_splits_select_members"
  on public.expense_splits for select
  to authenticated
  using (
    exists (
      select 1 from public.expenses e
      where e.id = expense_id
        and is_group_member(e.group_id)
    )
  );

create policy "expense_splits_insert_members"
  on public.expense_splits for insert
  to authenticated
  with check (
    exists (
      select 1 from public.expenses e
      where e.id = expense_id
        and is_group_member(e.group_id)
    )
  );

create policy "expense_splits_delete_expense_creator"
  on public.expense_splits for delete
  to authenticated
  using (
    exists (
      select 1 from public.expenses e
      where e.id = expense_id
        and e.created_by = auth.uid()
    )
  );


-- ============================================================
-- SETTLEMENTS RLS
-- ============================================================
alter table public.settlements enable row level security;

create policy "settlements_select_members"
  on public.settlements for select
  to authenticated
  using (is_group_member(group_id));

create policy "settlements_insert_self"
  on public.settlements for insert
  to authenticated
  with check (is_group_member(group_id) and paid_by = auth.uid() and created_by = auth.uid());
