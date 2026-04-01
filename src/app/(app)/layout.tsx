import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import AppShell from "@/components/layout/AppShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [profileResult, groupsResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("group_members")
      .select("group_id, groups(id, name)")
      .eq("user_id", user.id)
      .order("joined_at"),
  ]);

  const profile = profileResult.data;
  type GroupSummary = { id: string; name: string };
  const groups: GroupSummary[] = (groupsResult.data ?? [])
    .map((m) => (Array.isArray(m.groups) ? m.groups[0] : m.groups))
    .filter((g): g is GroupSummary => Boolean(g?.id));

  return (
    <AppShell profile={profile} groups={groups}>
      {children}
    </AppShell>
  );
}
