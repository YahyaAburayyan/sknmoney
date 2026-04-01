-- ============================================================
-- SknMoney — Database Functions
-- Run this AFTER 001 and 002.
-- ============================================================

-- ============================================================
-- get_group_balances(gid)
--
-- Returns the net owed between every pair of users in a group.
-- Accounts for all non-deleted expenses and all settlements.
--
-- Result: (creditor_id, debtor_id, net_cents)
--   creditor is owed net_cents by debtor.
-- ============================================================
create or replace function public.get_group_balances(gid uuid)
returns table(
  creditor_id  uuid,
  debtor_id    uuid,
  net_cents    integer
)
language sql security definer stable as $$

  with expense_debts as (
    -- Each split creates a debt: split.user_id owes expense.paid_by
    -- Exclude the self-owed portion (payer's own split).
    select
      e.paid_by      as creditor_id,
      es.user_id     as debtor_id,
      es.amount_cents
    from public.expense_splits es
    join public.expenses e on e.id = es.expense_id
    where e.group_id = gid
      and e.deleted_at is null
      and e.paid_by != es.user_id
  ),
  settlement_credits as (
    -- Settlements reduce the debt: paid_to is the creditor, paid_by is the debtor
    select
      paid_to       as creditor_id,
      paid_by       as debtor_id,
      amount_cents
    from public.settlements
    where group_id = gid
  ),
  all_flows as (
    select creditor_id, debtor_id,  amount_cents from expense_debts
    union all
    -- Negate settlement amounts (they cancel debt)
    select creditor_id, debtor_id, -amount_cents from settlement_credits
  ),
  raw_sums as (
    -- Sum all flows per ordered pair
    select
      creditor_id,
      debtor_id,
      sum(amount_cents) as net
    from all_flows
    group by creditor_id, debtor_id
  ),
  -- Collapse A->B and B->A into a single canonical signed pair (smaller UUID first)
  normalized as (
    select
      least(creditor_id, debtor_id)    as user_a,
      greatest(creditor_id, debtor_id) as user_b,
      case
        when creditor_id < debtor_id then net
        else -net
      end as signed_cents
    from raw_sums
  ),
  collapsed as (
    select user_a, user_b, sum(signed_cents)::integer as net_cents
    from normalized
    group by user_a, user_b
  )
  select
    case when net_cents > 0 then user_a else user_b end as creditor_id,
    case when net_cents > 0 then user_b else user_a end as debtor_id,
    abs(net_cents) as net_cents
  from collapsed
  where abs(net_cents) > 0;

$$;

-- Grant execute to authenticated users (RLS on underlying tables ensures security)
grant execute on function public.get_group_balances(uuid) to authenticated;
grant execute on function public.is_group_member(uuid) to authenticated;
grant execute on function public.is_group_admin(uuid) to authenticated;
