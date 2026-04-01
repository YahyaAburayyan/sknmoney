import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import GroupTabs from "@/components/layout/GroupTabs";

export default async function GroupLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const supabase = await createClient();

  const { data: group } = await supabase
    .from("groups")
    .select("id, name, invite_code")
    .eq("id", groupId)
    .single();

  if (!group) notFound();

  return (
    <div>
      {/* Group header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-zinc-950 flex items-center justify-center text-yellow-400 font-black text-sm flex-shrink-0">
            {group.name[0].toUpperCase()}
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight leading-none">
            {group.name}
          </h1>
        </div>
        <p className="text-xs text-zinc-400 ml-12">
          Invite code:{" "}
          <span className="font-mono font-bold tracking-widest text-zinc-600 bg-zinc-100 px-1.5 py-0.5 rounded-md">
            {group.invite_code}
          </span>
        </p>
      </div>

      <GroupTabs groupId={groupId} />
      <div className="mt-5">{children}</div>
    </div>
  );
}
