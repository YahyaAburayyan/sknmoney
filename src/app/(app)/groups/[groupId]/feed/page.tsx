import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatCents } from "@/lib/utils/currency";
import { formatDate, relativeTime } from "@/lib/utils/dates";
import DeleteExpenseButton from "@/components/expenses/DeleteExpenseButton";

export default async function FeedPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [expensesResult, settlementsResult] = await Promise.all([
    supabase
      .from("expenses")
      .select(
        "id, description, amount_cents, date, created_at, created_by, notes, split_type, paid_by, profiles!paid_by(display_name), expense_splits(amount_cents, user_id, profiles(display_name))"
      )
      .eq("group_id", groupId)
      .is("deleted_at", null)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("settlements")
      .select(
        "id, amount_cents, date, created_at, notes, paid_by, paid_to, payer:profiles!paid_by(display_name), payee:profiles!paid_to(display_name)"
      )
      .eq("group_id", groupId)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  type FeedItem =
    | { type: "expense"; created_at: string; date: string; data: NonNullable<typeof expensesResult.data>[0] }
    | { type: "settlement"; created_at: string; date: string; data: NonNullable<typeof settlementsResult.data>[0] };

  const items: FeedItem[] = [
    ...(expensesResult.data ?? []).map((e) => ({
      type: "expense" as const,
      created_at: e.created_at,
      date: e.date,
      data: e,
    })),
    ...(settlementsResult.data ?? []).map((s) => ({
      type: "settlement" as const,
      created_at: s.created_at,
      date: s.date,
      data: s,
    })),
  ].sort((a, b) => {
    if (a.date !== b.date) return a.date > b.date ? -1 : 1;
    return a.created_at > b.created_at ? -1 : 1;
  });

  return (
    <div>
      {items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-zinc-100">
          <div className="w-14 h-14 bg-zinc-950 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🧾</span>
          </div>
          <p className="text-zinc-900 font-bold text-base mb-1">No expenses yet</p>
          <p className="text-zinc-400 text-sm mb-6">Add the first expense for this group</p>
          <Link
            href={`/groups/${groupId}/expenses/new`}
            className="btn-accent"
          >
            + Add expense
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            if (item.type === "expense") {
              const e = item.data;
              const payer = Array.isArray(e.profiles) ? e.profiles[0] : e.profiles;
              const splits = e.expense_splits ?? [];
              const isCreator = e.created_by === user?.id;

              return (
                <div
                  key={e.id}
                  className="bg-white rounded-2xl border border-zinc-100 p-4 hover:border-zinc-200 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center text-base flex-shrink-0 mt-0.5">
                      💳
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-zinc-900 leading-snug">{e.description}</p>
                        <div className="text-right flex-shrink-0">
                          <p className="font-extrabold text-zinc-900 text-base">
                            {formatCents(e.amount_cents)}
                          </p>
                          {isCreator && (
                            <DeleteExpenseButton expenseId={e.id} groupId={groupId} />
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-zinc-400 mt-0.5">
                        <span className="font-medium text-zinc-500">{payer?.display_name ?? "Unknown"}</span>
                        {" paid · "}
                        {formatDate(e.date)}
                        {" · "}
                        <span title={e.created_at}>{relativeTime(e.created_at)}</span>
                      </p>

                      {e.notes && (
                        <p className="text-xs text-zinc-500 mt-1.5 italic bg-zinc-50 rounded-lg px-2.5 py-1.5">
                          {e.notes}
                        </p>
                      )}

                      {splits.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {splits.map((s) => {
                            const sp = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles;
                            return (
                              <span
                                key={s.user_id}
                                className="text-xs bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-full font-medium"
                              >
                                {sp?.display_name}: {formatCents(s.amount_cents)}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            // Settlement
            const s = item.data;
            const payer = Array.isArray(s.payer) ? s.payer[0] : s.payer;
            const payee = Array.isArray(s.payee) ? s.payee[0] : s.payee;

            return (
              <div
                key={s.id}
                className="bg-zinc-950 rounded-2xl p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center text-base flex-shrink-0">
                  ✓
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">
                    <span className="text-yellow-400">{payer?.display_name ?? "?"}</span>
                    {" paid "}
                    <span className="text-yellow-400">{payee?.display_name ?? "?"}</span>
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {formatDate(s.date)} · {relativeTime(s.created_at)}
                  </p>
                  {s.notes && (
                    <p className="text-xs text-zinc-500 italic mt-0.5">{s.notes}</p>
                  )}
                </div>
                <p className="font-extrabold text-yellow-400 flex-shrink-0 text-base">
                  {formatCents(s.amount_cents)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
