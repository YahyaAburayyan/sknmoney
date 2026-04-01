import { createClient } from "@/lib/supabase/server";
import SettlementForm from "@/components/settlements/SettlementForm";

export default async function SettlePage({
  params,
  searchParams,
}: {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<{ to?: string; amount?: string }>;
}) {
  const { groupId } = await params;
  const { to: prefilledTo, amount: prefilledAmount } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: members } = await supabase
    .from("group_members")
    .select("user_id, profiles(id, display_name)")
    .eq("group_id", groupId)
    .neq("user_id", user!.id);

  const profiles = (members ?? [])
    .map((m) => {
      const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
      return p;
    })
    .filter(Boolean) as Array<{ id: string; display_name: string }>;

  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Record a payment</h2>
      <SettlementForm
        groupId={groupId}
        members={profiles}
        prefilledTo={prefilledTo}
        prefilledAmountCents={prefilledAmount ? parseInt(prefilledAmount) : undefined}
      />
    </div>
  );
}
