-- ============================================================
-- SknMoney — Create group (security definer)
-- Runs as DB owner so auth.uid() is always available in the
-- RLS context. Creates the group and adds the creator as admin
-- in a single atomic transaction.
-- ============================================================

create or replace function public.create_group(
  p_name        text,
  p_description text default null
)
returns uuid language plpgsql security definer as $$
declare
  v_group_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if length(trim(p_name)) < 2 then
    raise exception 'Group name must be at least 2 characters';
  end if;

  -- Insert group
  insert into public.groups (name, description, created_by)
  values (trim(p_name), p_description, auth.uid())
  returning id into v_group_id;

  -- Add creator as admin
  insert into public.group_members (group_id, user_id, role)
  values (v_group_id, auth.uid(), 'admin');

  return v_group_id;
end;
$$;

grant execute on function public.create_group(text, text) to authenticated;
