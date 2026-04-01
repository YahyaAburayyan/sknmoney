import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import GroupSettingsClient from "@/components/groups/GroupSettingsClient";

export default async function GroupSettingsPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [groupResult, membersResult, myMemberResult] = await Promise.all([
    supabase
      .from("groups")
      .select("id, name, description, invite_code, created_by")
      .eq("id", groupId)
      .single(),
    supabase
      .from("group_members")
      .select("user_id, role, joined_at, profiles(display_name, email)")
      .eq("group_id", groupId)
      .order("joined_at"),
    supabase
      .from("group_members")
      .select("role")
      .eq("group_id", groupId)
      .eq("user_id", user!.id)
      .single(),
  ]);

  if (!groupResult.data) notFound();

  const members = (membersResult.data ?? []).map((m) => ({
    userId: m.user_id,
    role: m.role,
    joinedAt: m.joined_at,
    profile: Array.isArray(m.profiles) ? m.profiles[0] : m.profiles,
  }));

  const isAdmin = myMemberResult.data?.role === "admin";

  return (
    <GroupSettingsClient
      group={groupResult.data}
      members={members}
      isAdmin={isAdmin}
      currentUserId={user!.id}
      groupId={groupId}
    />
  );
}
