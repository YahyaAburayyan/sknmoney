-- ============================================================
-- SknMoney — Confirm payment received (security definer)
-- Allows the creditor to record that they received a payment
-- from a debtor. RLS only allows paid_by = auth.uid(), so this
-- function bypasses that restriction after verifying both parties
-- are group members.
-- ============================================================

create or replace function public.confirm_payment_received(
  p_group_id    uuid,
  p_paid_by     uuid,   -- the debtor (person who paid in real life)
  p_amount_cents integer
)
returns void language plpgsql security definer as $$
begin
  -- Both parties must be group members
  if not exists (
    select 1 from public.group_members
    where group_id = p_group_id and user_id = auth.uid()
  ) then
    raise exception 'You are not a member of this group';
  end if;

  if not exists (
    select 1 from public.group_members
    where group_id = p_group_id and user_id = p_paid_by
  ) then
    raise exception 'Payer is not a member of this group';
  end if;

  if p_paid_by = auth.uid() then
    raise exception 'Cannot confirm payment from yourself';
  end if;

  if p_amount_cents <= 0 then
    raise exception 'Amount must be positive';
  end if;

  insert into public.settlements (group_id, paid_by, paid_to, amount_cents, date, created_by)
  values (p_group_id, p_paid_by, auth.uid(), p_amount_cents, current_date, auth.uid());
end;
$$;

grant execute on function public.confirm_payment_received(uuid, uuid, integer) to authenticated;
