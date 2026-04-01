import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ExpenseForm from "@/components/expenses/ExpenseForm";

export default async function NewExpensePage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: members } = await supabase
    .from("group_members")
    .select("user_id, profiles(id, display_name, email)")
    .eq("group_id", groupId);

  if (!members) notFound();

  type MemberProfile = { id: string; display_name: string; email: string };
  const profiles: MemberProfile[] = (members ?? [])
    .map((m) => (Array.isArray(m.profiles) ? m.profiles[0] : m.profiles))
    .filter((p): p is MemberProfile => Boolean(p));

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Add expense</h2>
        <p className="text-zinc-500 text-sm mt-1">Record who paid and how to split it</p>
      </div>
      <ExpenseForm groupId={groupId} members={profiles} currentUserId={user!.id} />
    </div>
  );
}
