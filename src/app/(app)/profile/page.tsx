import { createClient } from "@/lib/supabase/server";
import { formatCents } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";
import MonthlyChart from "@/components/charts/MonthlyChart";
import GroupBreakdownChart from "@/components/charts/GroupBreakdownChart";

// ─── helpers ─────────────────────────────────────────────────────────────────

function getMonthLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleString("default", { month: "short" });
}

function buildLast6Months(): { key: string; label: string; amountCents: number }[] {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("default", { month: "short" });
    months.push({ key, label, amountCents: 0 });
  }
  return months;
}

// ─── page ────────────────────────────────────────────────────────────────────

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const sixMonthsAgo = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 5);
    d.setDate(1);
    return d.toISOString().split("T")[0];
  })();

  // ── parallel data fetch ────────────────────────────────────────────────────
  const [
    profileResult,
    expensesPaidResult,
    mySplitsResult,
    settlementsPaidResult,
    settlementsReceivedResult,
    groupCountResult,
    recentActivityResult,
  ] = await Promise.all([
    // Profile
    supabase.from("profiles").select("display_name, email").eq("id", user.id).single(),

    // All expenses I paid (for total fronted + charts)
    supabase
      .from("expenses")
      .select("id, amount_cents, date, group_id, groups(name)")
      .eq("paid_by", user.id)
      .is("deleted_at", null)
      .order("date"),

    // All my expense splits (to compute my personal share + what others fronted for me)
    supabase
      .from("expense_splits")
      .select("amount_cents, expenses!inner(id, paid_by, deleted_at)")
      .eq("user_id", user.id),

    // Settlements I paid (outgoing)
    supabase
      .from("settlements")
      .select("amount_cents, date, paid_to, profiles!paid_to(display_name)")
      .eq("paid_by", user.id)
      .order("date", { ascending: false })
      .limit(5),

    // Settlements I received (incoming)
    supabase
      .from("settlements")
      .select("amount_cents")
      .eq("paid_to", user.id),

    // Groups I'm in
    supabase
      .from("group_members")
      .select("group_id", { count: "exact" })
      .eq("user_id", user.id),

    // Recent settled expenses I paid (last 5)
    supabase
      .from("expenses")
      .select("id, description, amount_cents, date, groups(name)")
      .eq("paid_by", user.id)
      .is("deleted_at", null)
      .order("date", { ascending: false })
      .limit(5),
  ]);

  // ── compute stats ──────────────────────────────────────────────────────────

  const expensesPaid = expensesPaidResult.data ?? [];
  const mySplitsRaw = mySplitsResult.data ?? [];
  const settlementsPaid = settlementsPaidResult.data ?? [];
  const settlementsReceived = settlementsReceivedResult.data ?? [];

  // Total I fronted for the group
  const totalFronted = expensesPaid.reduce((s, e) => s + e.amount_cents, 0);

  // My splits: filter active expenses only
  const activeMySplits = mySplitsRaw.filter((s) => {
    const e = Array.isArray(s.expenses) ? s.expenses[0] : s.expenses;
    return e && !e.deleted_at;
  });

  // Splits where someone else paid for me (I benefited, they paid)
  const iOweRaw = activeMySplits
    .filter((s) => {
      const e = Array.isArray(s.expenses) ? s.expenses[0] : s.expenses;
      return e && e.paid_by !== user.id;
    })
    .reduce((sum, s) => sum + s.amount_cents, 0);

  // My personal share of my own expenses (what I funded for myself)
  const myOwnShareInMyExpenses = activeMySplits
    .filter((s) => {
      const e = Array.isArray(s.expenses) ? s.expenses[0] : s.expenses;
      return e && e.paid_by === user.id;
    })
    .reduce((sum, s) => sum + s.amount_cents, 0);

  // What others owe me (I paid for them)
  const othersOweMe = totalFronted - myOwnShareInMyExpenses;

  // Settlements totals
  const totalSettlementsPaid = settlementsPaid.reduce((s, p) => s + p.amount_cents, 0);
  const totalSettlementsReceived = settlementsReceived.reduce((s, p) => s + p.amount_cents, 0);

  // Approximate net balance (positive = you're owed, negative = you owe)
  const netBalance = othersOweMe - iOweRaw - totalSettlementsPaid + totalSettlementsReceived;

  const groupCount = groupCountResult.count ?? 0;
  const totalExpenses = expensesPaid.length;

  // ── monthly chart data (last 6 months) ────────────────────────────────────
  const monthlyBuckets = buildLast6Months();
  for (const e of expensesPaid) {
    if (e.date < sixMonthsAgo) continue;
    const key = e.date.slice(0, 7); // "YYYY-MM"
    const bucket = monthlyBuckets.find((b) => b.key === key);
    if (bucket) bucket.amountCents += e.amount_cents;
  }
  const monthlyChartData = monthlyBuckets.map((b) => ({
    month: b.label,
    amountCents: b.amountCents,
  }));

  // ── group breakdown chart ──────────────────────────────────────────────────
  const groupMap: Record<string, { name: string; amountCents: number }> = {};
  for (const e of expensesPaid) {
    const gid = e.group_id;
    const gname = (Array.isArray(e.groups) ? e.groups[0] : e.groups)?.name ?? "Unknown";
    if (!groupMap[gid]) groupMap[gid] = { name: gname, amountCents: 0 };
    groupMap[gid].amountCents += e.amount_cents;
  }
  const groupChartData = Object.values(groupMap).sort(
    (a, b) => b.amountCents - a.amountCents
  );

  const profile = profileResult.data;
  const recentExpenses = recentActivityResult.data ?? [];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="bg-zinc-950 rounded-3xl p-8 relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-yellow-400 flex items-center justify-center text-2xl font-black text-zinc-900">
              {profile?.display_name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div>
              <p className="text-zinc-400 text-sm">Financial report</p>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                {profile?.display_name ?? "User"}
              </h1>
            </div>
          </div>

          {/* Net balance hero number */}
          <div>
            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">
              Net balance across all groups
            </p>
            <p
              className={`text-5xl font-black tracking-tight ${
                netBalance > 0
                  ? "text-yellow-400"
                  : netBalance < 0
                  ? "text-red-400"
                  : "text-white"
              }`}
            >
              {netBalance > 0
                ? `+${formatCents(netBalance)}`
                : netBalance < 0
                ? `-${formatCents(Math.abs(netBalance))}`
                : "Settled"}
            </p>
            <p className="text-zinc-500 text-sm mt-1">
              {netBalance > 0
                ? "You are owed this in total"
                : netBalance < 0
                ? "You owe this in total"
                : "All debts settled"}
            </p>
          </div>
        </div>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Total fronted"
          value={formatCents(totalFronted)}
          sub="You paid for others"
          accent
        />
        <StatCard
          label="Others owe you"
          value={formatCents(Math.max(0, othersOweMe - totalSettlementsReceived))}
          sub="Still outstanding"
          positive
        />
        <StatCard
          label="You owe others"
          value={formatCents(Math.max(0, iOweRaw - totalSettlementsPaid))}
          sub="Still outstanding"
          negative
        />
        <StatCard
          label="Active groups"
          value={String(groupCount)}
          sub={`${totalExpenses} expenses logged`}
        />
      </div>

      {/* Monthly spending trend */}
      <div className="bg-zinc-950 rounded-3xl p-6">
        <h2 className="text-white font-bold text-base mb-1">Monthly spending</h2>
        <p className="text-zinc-500 text-xs mb-5">Amount you paid out per month (last 6 months)</p>
        <MonthlyChart data={monthlyChartData} />
      </div>

      {/* Group breakdown */}
      {groupChartData.length > 0 && (
        <div className="bg-zinc-950 rounded-3xl p-6">
          <h2 className="text-white font-bold text-base mb-1">Spending by group</h2>
          <p className="text-zinc-500 text-xs mb-5">Total you fronted per group</p>
          <GroupBreakdownChart data={groupChartData} />
        </div>
      )}

      {/* Two-column: settlements + recent expenses */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Recent payments made */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-5">
          <h3 className="font-bold text-zinc-900 text-sm mb-4">Recent payments made</h3>
          {settlementsPaid.length === 0 ? (
            <p className="text-zinc-400 text-sm">No payments recorded yet</p>
          ) : (
            <div className="space-y-3">
              {settlementsPaid.map((s, i) => {
                const payee = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles;
                return (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-zinc-800">
                        → {payee?.display_name ?? "Unknown"}
                      </p>
                      <p className="text-xs text-zinc-400">{formatDate(s.date)}</p>
                    </div>
                    <span className="text-sm font-bold text-zinc-900">
                      {formatCents(s.amount_cents)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent expenses paid */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-5">
          <h3 className="font-bold text-zinc-900 text-sm mb-4">Recent expenses paid</h3>
          {recentExpenses.length === 0 ? (
            <p className="text-zinc-400 text-sm">No expenses yet</p>
          ) : (
            <div className="space-y-3">
              {recentExpenses.map((e) => {
                const group = Array.isArray(e.groups) ? e.groups[0] : e.groups;
                return (
                  <div key={e.id} className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-800 truncate">
                        {e.description}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {group?.name} · {formatDate(e.date)}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-zinc-900 ml-3 flex-shrink-0">
                      {formatCents(e.amount_cents)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Summary strip */}
      <div className="bg-yellow-400 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="text-zinc-900 font-extrabold text-lg">
            {totalSettlementsPaid > 0
              ? `${formatCents(totalSettlementsPaid)} settled`
              : "No settlements yet"}
          </p>
          <p className="text-zinc-700 text-sm">
            Total amount you have paid back across all groups
          </p>
        </div>
        <div className="text-5xl">💸</div>
      </div>
    </div>
  );
}

// ─── StatCard component ───────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  accent,
  positive,
  negative,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
  positive?: boolean;
  negative?: boolean;
}) {
  const bg = accent
    ? "bg-yellow-400"
    : "bg-white border border-zinc-100";
  const labelColor = accent ? "text-yellow-900/70" : "text-zinc-400";
  const valueColor = accent
    ? "text-zinc-900"
    : positive
    ? "text-emerald-600"
    : negative
    ? "text-red-500"
    : "text-zinc-900";
  const subColor = accent ? "text-yellow-900/60" : "text-zinc-400";

  return (
    <div className={`rounded-2xl p-4 ${bg}`}>
      <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${labelColor}`}>
        {label}
      </p>
      <p className={`text-2xl font-extrabold tracking-tight leading-none mb-1 ${valueColor}`}>
        {value}
      </p>
      <p className={`text-xs ${subColor}`}>{sub}</p>
    </div>
  );
}
