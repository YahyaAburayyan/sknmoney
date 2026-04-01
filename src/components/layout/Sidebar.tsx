"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/actions/auth";
import type { Profile } from "@/types/app";

interface SidebarProps {
  profile: Profile | null;
  groups: Array<{ id: string; name: string }>;
}

export default function Sidebar({ profile, groups }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:fixed md:inset-y-0 md:w-64 flex-col bg-zinc-950 z-10">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 py-5">
          <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
            <span className="text-zinc-900 font-black text-sm">$</span>
          </div>
          <span className="text-lg font-extrabold text-white tracking-tight">SknMoney</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          <NavLink href="/dashboard" active={pathname === "/dashboard"} icon="⊞">
            Dashboard
          </NavLink>
          <NavLink href="/profile" active={pathname === "/profile"} icon="◎">
            My Report
          </NavLink>

          <div className="pt-5 pb-2 px-3">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              Groups
            </p>
          </div>

          {groups.map((g) => (
            <NavLink
              key={g.id}
              href={`/groups/${g.id}`}
              active={pathname.startsWith(`/groups/${g.id}`)}
              icon="◈"
            >
              <span className="truncate">{g.name}</span>
            </NavLink>
          ))}

          {groups.length === 0 && (
            <p className="px-3 py-2 text-xs text-zinc-600">No groups yet</p>
          )}

          <div className="pt-3" />
          <NavLink href="/groups/new" active={pathname === "/groups/new"} icon="+">
            New group
          </NavLink>
          <NavLink href="/groups/join" active={pathname === "/groups/join"} icon="⌁">
            Join group
          </NavLink>
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-zinc-800">
          <Link
            href="/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-900 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-zinc-900 font-bold text-sm flex-shrink-0">
              {profile?.display_name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {profile?.display_name ?? "User"}
              </p>
              <p className="text-xs text-zinc-500 truncate">{profile?.email}</p>
            </div>
          </Link>
          <form action={signOut} className="mt-1">
            <button
              type="submit"
              className="w-full text-left text-xs text-zinc-600 hover:text-red-400 py-1.5 px-3 rounded-lg transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 z-10 flex">
        <MobileTab href="/dashboard" active={pathname === "/dashboard"} label="Home" icon="⊞" />
        <MobileTab href="/profile" active={pathname === "/profile"} label="Report" icon="◎" />
        <MobileTab href="/groups/new" active={pathname === "/groups/new"} label="New" icon="+" />
        <MobileTab href="/groups/join" active={pathname === "/groups/join"} label="Join" icon="⌁" />
      </nav>
    </>
  );
}

function NavLink({
  href,
  active,
  icon,
  children,
}: {
  href: string;
  active: boolean;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        active
          ? "bg-yellow-400 text-zinc-900"
          : "text-zinc-400 hover:text-white hover:bg-zinc-900"
      }`}
    >
      <span className={`text-base leading-none ${active ? "text-zinc-900" : "text-zinc-500"}`}>
        {icon}
      </span>
      {children}
    </Link>
  );
}

function MobileTab({
  href,
  active,
  label,
  icon,
}: {
  href: string;
  active: boolean;
  label: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className={`flex-1 flex flex-col items-center py-3 text-xs font-medium gap-0.5 transition-colors ${
        active ? "text-yellow-400" : "text-zinc-500"
      }`}
    >
      <span className="text-lg leading-none">{icon}</span>
      {label}
    </Link>
  );
}
