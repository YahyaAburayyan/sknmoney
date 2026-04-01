"use client";

import Sidebar from "./Sidebar";
import { useT } from "@/components/providers/LanguageProvider";
import type { Profile } from "@/types/app";

interface AppShellProps {
  profile: Profile | null;
  groups: Array<{ id: string; name: string }>;
  children: React.ReactNode;
}

export default function AppShell({ profile, groups, children }: AppShellProps) {
  const { dir } = useT();
  const isRTL = dir === "rtl";

  return (
    <div className="min-h-screen flex bg-zinc-50">
      <Sidebar profile={profile} groups={groups} />
      <main
        className={`flex-1 min-w-0 pb-20 md:pb-0 ${
          isRTL ? "md:mr-64" : "md:ml-64"
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 py-8">{children}</div>
      </main>
    </div>
  );
}
