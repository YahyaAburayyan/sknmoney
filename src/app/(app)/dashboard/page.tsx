import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id, role, groups(id, name, description, invite_code, created_at)")
    .eq("user_id", user!.id)
    .order("joined_at");

  type GroupEntry = {
    id: string;
    name: string;
    description: string | null;
    invite_code: string;
    created_at: string;
    role: "admin" | "member";
  };
  const groups: GroupEntry[] = (memberships ?? [])
    .map((m) => {
      const g = Array.isArray(m.groups) ? m.groups[0] : m.groups;
      if (!g) return null;
      return { ...g, role: m.role } as GroupEntry;
    })
    .filter((g): g is GroupEntry => g !== null);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            Your Groups
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            {groups.length === 0
              ? "Create or join a group to get started"
              : `${groups.length} group${groups.length !== 1 ? "s" : ""} active`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/groups/join" className="btn-ghost">
            Join group
          </Link>
          <Link href="/groups/new" className="btn-primary">
            + New group
          </Link>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-zinc-100">
          <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🏠</span>
          </div>
          <p className="text-zinc-900 font-bold text-lg mb-1">No groups yet</p>
          <p className="text-zinc-500 text-sm mb-6">
            Create an apartment group or join one with an invite code
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/groups/new" className="btn-primary">
              Create a group
            </Link>
            <Link href="/groups/join" className="btn-ghost">
              Join with code
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map((g, i) => (
            <Link
              key={g.id}
              href={`/groups/${g.id}`}
              className={`group relative rounded-2xl p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                i === 0
                  ? "bg-zinc-950 text-white"
                  : "bg-white border border-zinc-100"
              }`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-8">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                    i === 0 ? "bg-yellow-400" : "bg-zinc-100"
                  }`}
                >
                  🏠
                </div>
                {g.role === "admin" && (
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      i === 0
                        ? "bg-white/10 text-white"
                        : "bg-zinc-900 text-white"
                    }`}
                  >
                    Admin
                  </span>
                )}
              </div>

              {/* Name */}
              <h3
                className={`font-bold text-lg leading-tight mb-1 ${
                  i === 0 ? "text-white" : "text-zinc-900"
                }`}
              >
                {g.name}
              </h3>
              {g.description && (
                <p
                  className={`text-sm mb-3 ${
                    i === 0 ? "text-zinc-400" : "text-zinc-500"
                  }`}
                >
                  {g.description}
                </p>
              )}

              {/* Invite code */}
              <p
                className={`text-xs font-mono mt-auto ${
                  i === 0 ? "text-zinc-500" : "text-zinc-400"
                }`}
              >
                Code:{" "}
                <span
                  className={`font-semibold ${
                    i === 0 ? "text-zinc-300" : "text-zinc-700"
                  }`}
                >
                  {g.invite_code}
                </span>
              </p>
            </Link>
          ))}

          {/* Add group card */}
          <Link
            href="/groups/new"
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-200 p-6 text-zinc-400 hover:border-zinc-400 hover:text-zinc-600 transition-colors min-h-[160px]"
          >
            <span className="text-3xl">+</span>
            <span className="text-sm font-medium">New group</span>
          </Link>
        </div>
      )}
    </div>
  );
}
