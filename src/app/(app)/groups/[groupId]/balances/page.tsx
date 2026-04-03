import { createClient } from "@/lib/supabase/server";
import { formatCents } from "@/lib/utils/currency";
import { computeNetBalances, simplifyDebts } from "@/lib/algorithms/debt-simplification";
import MarkAsPaidButton from "@/components/settlements/MarkAsPaidButton";

export default async function BalancesPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [membersResult, balancesResult] = await Promise.all([
    supabase
      .from("group_members")
      .select("user_id, profiles(id, display_name)")
      .eq("group_id", groupId),
    supabase.rpc("get_group_balances", { gid: groupId }),
  ]);

  const members = (membersResult.data ?? [])
    .map((m) => {
      const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
      return p;
    })
    .filter(Boolean) as Array<{ id: string; display_name: string }>;

  const profileMap = Object.fromEntries(members.map((m) => [m.id, m]));
  const memberIds = members.map((m) => m.id);

  const rawBalances = balancesResult.data ?? [];
  const netBalances = computeNetBalances(rawBalances, memberIds);
  const simplified = simplifyDebts(netBalances);

  const myBalance = netBalances.find((b) => b.userId === user?.id);
  const myNet = myBalance?.net ?? 0;

  const myDebts = simplified.filter((tx) => tx.from === user?.id);
  const myCredits = simplified.filter((tx) => tx.to === user?.id);
  const otherTx = simplified.filter((tx) => tx.from !== user?.id && tx.to !== user?.id);

  return (
    <div className="space-y-5">

      {/* Net balance hero */}
      <div className="bg-zinc-950 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-400/5 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4 pointer-events-none" />
        <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Your balance in this group</p>
        <p className={`text-4xl font-black tracking-tight ${
          myNet > 0 ? "text-yellow-400" : myNet < 0 ? "text-rose-400" : "text-white"
        }`}>
          {myNet > 0
            ? `+${formatCents(myNet)}`
            : myNet < 0
            ? `-${formatCents(Math.abs(myNet))}`
            : "All settled"}
        </p>
        <p className="text-zinc-500 text-sm mt-1">
          {myNet > 0
            ? "You are owed this in the group"
            : myNet < 0
            ? "You owe this in the group"
            : "No outstanding balance — great!"}
        </p>
      </div>

      {/* You owe */}
      {myDebts.length > 0 && (
        <div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 px-1">
            You owe
          </p>
          <div className="space-y-2">
            {myDebts.map((tx, i) => {
              const to = profileMap[tx.to];
              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-zinc-100 p-4 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center font-bold text-sm text-rose-600 flex-shrink-0">
                      {to?.display_name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900 text-sm">{to?.display_name ?? "Unknown"}</p>
                      <p className="text-xs text-rose-500">You need to pay them</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className="font-extrabold text-zinc-900">{formatCents(tx.amount)}</p>
                    <span className="text-xs text-zinc-400 bg-zinc-50 border border-zinc-100 px-3 py-1.5 rounded-lg">
                      Waiting for confirmation
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Owed to you */}
      {myCredits.length > 0 && (
        <div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 px-1">
            Owed to you
          </p>
          <div className="space-y-2">
            {myCredits.map((tx, i) => {
              const from = profileMap[tx.from];
              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-zinc-100 p-4 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-sm text-emerald-600 flex-shrink-0">
                      {from?.display_name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900 text-sm">{from?.display_name ?? "Unknown"}</p>
                      <p className="text-xs text-emerald-600">Tap when they pay you</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className="font-extrabold text-emerald-600">+{formatCents(tx.amount)}</p>
                    <MarkAsPaidButton
                      groupId={groupId}
                      amountCents={tx.amount}
                      direction="creditor"
                      otherUserId={tx.from}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Other group transactions */}
      {otherTx.length > 0 && (
        <div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 px-1">
            Other payments in the group
          </p>
          <div className="bg-white rounded-2xl border border-zinc-100 divide-y divide-zinc-50">
            {otherTx.map((tx, i) => {
              const from = profileMap[tx.from];
              const to = profileMap[tx.to];
              return (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <p className="text-sm text-zinc-600">
                    <span className="font-semibold text-zinc-800">{from?.display_name ?? "?"}</span>
                    {" → "}
                    <span className="font-semibold text-zinc-800">{to?.display_name ?? "?"}</span>
                  </p>
                  <span className="text-sm font-bold text-zinc-700">{formatCents(tx.amount)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {simplified.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-zinc-100">
          <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
            🎉
          </div>
          <p className="font-bold text-zinc-900 text-base mb-1">All settled up!</p>
          <p className="text-zinc-400 text-sm">No outstanding balances in this group</p>
        </div>
      )}

      {/* Everyone's balance breakdown */}
      <div>
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 px-1">
          Everyone&apos;s balance
        </p>
        <div className="bg-white rounded-2xl border border-zinc-100 divide-y divide-zinc-50">
          {netBalances
            .sort((a, b) => b.net - a.net)
            .map((b) => {
              const profile = profileMap[b.userId];
              const isMe = b.userId === user?.id;
              return (
                <div key={b.userId} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      isMe ? "bg-zinc-950 text-yellow-400" : "bg-zinc-100 text-zinc-600"
                    }`}>
                      {profile?.display_name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <span className="text-sm font-medium text-zinc-700">
                      {profile?.display_name ?? "Unknown"}
                      {isMe && <span className="text-zinc-400 font-normal"> (you)</span>}
                    </span>
                  </div>
                  <span className={`text-sm font-bold ${
                    b.net > 0 ? "text-emerald-600" : b.net < 0 ? "text-rose-500" : "text-zinc-300"
                  }`}>
                    {b.net > 0
                      ? `+${formatCents(b.net)}`
                      : b.net < 0
                      ? `-${formatCents(Math.abs(b.net))}`
                      : "Settled"}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
