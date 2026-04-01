"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/actions/auth";
import type { Profile } from "@/types/app";
import { useT } from "@/components/providers/LanguageProvider";

interface SidebarProps {
  profile: Profile | null;
  groups: Array<{ id: string; name: string }>;
}

export default function Sidebar({ profile, groups }: SidebarProps) {
  const pathname = usePathname();
  const { t, lang, setLang, dir } = useT();
  const isRTL = dir === "rtl";

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex md:fixed md:inset-y-0 md:w-64 flex-col bg-zinc-950 z-10 ${
          isRTL ? "md:right-0" : "md:left-0"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 py-5">
          <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-zinc-900 font-black text-sm">$</span>
          </div>
          <span className="text-lg font-extrabold text-white tracking-tight">SknMoney</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          <NavLink href="/dashboard" active={pathname === "/dashboard"} icon="⊞">
            {t("nav.dashboard")}
          </NavLink>
          <NavLink href="/profile" active={pathname === "/profile"} icon="◎">
            {t("nav.myReport")}
          </NavLink>

          <div className="pt-5 pb-2 px-3">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              {t("nav.groups")}
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
            <p className="px-3 py-2 text-xs text-zinc-600">{t("dashboard.createOrJoin")}</p>
          )}

          <div className="pt-3" />
          <NavLink href="/groups/new" active={pathname === "/groups/new"} icon="+">
            {t("nav.newGroup")}
          </NavLink>
          <NavLink href="/groups/join" active={pathname === "/groups/join"} icon="⌁">
            {t("nav.joinGroup")}
          </NavLink>
        </nav>

        {/* Language toggle */}
        <div className="px-4 py-3 border-t border-zinc-800">
          <div className="flex items-center gap-2 bg-zinc-900 rounded-xl p-1">
            <button
              onClick={() => setLang("en")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                lang === "en"
                  ? "bg-yellow-400 text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("ar")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                lang === "ar"
                  ? "bg-yellow-400 text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              AR عربي
            </button>
          </div>
        </div>

        {/* User footer */}
        <div className="px-3 pb-4">
          <Link
            href="/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-900 transition-colors"
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
              className="w-full text-xs text-zinc-600 hover:text-red-400 py-1.5 px-3 rounded-lg transition-colors text-start"
            >
              {t("nav.signOut")}
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 z-10 flex">
        <MobileTab href="/dashboard" active={pathname === "/dashboard"} label={t("nav.home")} icon="⊞" />
        <MobileTab href="/profile" active={pathname === "/profile"} label={t("nav.report")} icon="◎" />
        <MobileTab href="/groups/new" active={pathname === "/groups/new"} label={t("nav.new")} icon="+" />
        <MobileTab href="/groups/join" active={pathname === "/groups/join"} label={t("nav.join")} icon="⌁" />
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
      <span className={`text-base leading-none flex-shrink-0 ${active ? "text-zinc-900" : "text-zinc-500"}`}>
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
