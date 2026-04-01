"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/components/providers/LanguageProvider";

export default function GroupTabs({ groupId }: { groupId: string }) {
  const pathname = usePathname();
  const { t } = useT();

  const tabs = [
    { key: "tabs.feed" as const, href: `/groups/${groupId}/feed` },
    { key: "tabs.balances" as const, href: `/groups/${groupId}/balances` },
    { key: "tabs.settings" as const, href: `/groups/${groupId}/settings` },
  ];

  return (
    <div className="flex items-center gap-1 bg-zinc-100 rounded-2xl p-1 overflow-x-auto">
      {tabs.map((tab) => {
        const active =
          pathname === tab.href ||
          (tab.key === "tabs.feed" && pathname === `/groups/${groupId}`);
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={`px-4 py-2 text-sm font-semibold rounded-xl whitespace-nowrap transition-all ${
              active
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            {t(tab.key)}
          </Link>
        );
      })}
      <Link
        href={`/groups/${groupId}/expenses/new`}
        className="ms-auto px-4 py-2 text-sm font-bold bg-yellow-400 text-zinc-900 rounded-xl hover:bg-yellow-300 transition-colors whitespace-nowrap flex-shrink-0"
      >
        {t("tabs.add")}
      </Link>
    </div>
  );
}
