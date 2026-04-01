import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

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

  // Fetch the user's profile and groups for the sidebar
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
    <div className="min-h-screen flex bg-zinc-50">
      <Sidebar profile={profile} groups={groups} />
      <main className="flex-1 min-w-0 md:ml-64 pb-20 md:pb-0">
        <div className="max-w-4xl mx-auto px-4 py-8">{children}</div>
      </main>
    </div>
  );
}
