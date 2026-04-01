-- ============================================================
-- SknMoney — Join group by invite code (security definer)
-- Run this in Supabase SQL Editor after 003_functions.sql
-- ============================================================

-- This function runs as the DB owner (security definer) so it can
-- look up a group by invite code even though the caller isn't a member yet.
-- It then inserts the caller as a member using auth.uid().
create or replace function public.join_group_by_invite_code(p_invite_code text)
returns uuid language plpgsql security definer as $$
declare
  v_group_id uuid;
begin
  select id into v_group_id
  from public.groups
  where invite_code = p_invite_code;

  if v_group_id is null then
    raise exception 'Invalid invite code';
  end if;

  -- No-op if already a member
  insert into public.group_members (group_id, user_id, role)
  values (v_group_id, auth.uid(), 'member')
  on conflict (group_id, user_id) do nothing;

  return v_group_id;
end;
$$;

grant execute on function public.join_group_by_invite_code(text) to authenticated;
