import type { Balance, SimplifiedTransaction } from "@/types/app";

/**
 * Simplify a list of net balances into the minimum number of transactions.
 *
 * Uses the greedy creditor-debtor matching algorithm:
 *  - Sort creditors (net > 0) and debtors (net < 0) by magnitude.
 *  - Pair the largest creditor with the largest debtor each iteration.
 *  - Emit a transaction for min(creditor.net, |debtor.net|).
 *  - At most N-1 transactions for N people.
 *
 * @param balances - Array of { userId, net } where positive net = owed money.
 */
export function simplifyDebts(balances: Balance[]): SimplifiedTransaction[] {
  // Work on copies so we don't mutate the input
  const creditors = balances
    .filter((b) => b.net > 1) // ignore sub-cent noise
    .map((b) => ({ ...b }))
    .sort((a, b) => b.net - a.net);

  const debtors = balances
    .filter((b) => b.net < -1)
    .map((b) => ({ ...b }))
    .sort((a, b) => a.net - b.net); // most negative first

  const transactions: SimplifiedTransaction[] = [];

  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const c = creditors[ci];
    const d = debtors[di];
    const amount = Math.min(c.net, -d.net);

    transactions.push({ from: d.userId, to: c.userId, amount });

    c.net -= amount;
    d.net += amount;

    if (c.net <= 1) ci++;
    if (d.net >= -1) di++;
  }

  return transactions;
}

/**
 * Convert the raw balance pairs from the `get_group_balances` DB function
 * into per-person net balances relative to the given userId.
 *
 * @param rawBalances  - Array of { creditor_id, debtor_id, net_cents }
 * @param memberIds    - All user IDs in the group
 */
export function computeNetBalances(
  rawBalances: Array<{ creditor_id: string; debtor_id: string; net_cents: number }>,
  memberIds: string[]
): Balance[] {
  const netMap: Record<string, number> = {};

  for (const id of memberIds) {
    netMap[id] = 0;
  }

  for (const row of rawBalances) {
    netMap[row.creditor_id] = (netMap[row.creditor_id] ?? 0) + row.net_cents;
    netMap[row.debtor_id] = (netMap[row.debtor_id] ?? 0) - row.net_cents;
  }

  return Object.entries(netMap).map(([userId, net]) => ({ userId, net }));
}
