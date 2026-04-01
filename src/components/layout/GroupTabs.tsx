"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Feed", href: (id: string) => `/groups/${id}/feed` },
  { label: "Balances", href: (id: string) => `/groups/${id}/balances` },
  { label: "Settle Up", href: (id: string) => `/groups/${id}/settle` },
  { label: "Settings", href: (id: string) => `/groups/${id}/settings` },
];

export default function GroupTabs({ groupId }: { groupId: string }) {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 bg-zinc-100 rounded-2xl p-1 overflow-x-auto">
      {tabs.map((tab) => {
        const href = tab.href(groupId);
        const active =
          pathname === href ||
          (tab.label === "Feed" && pathname === `/groups/${groupId}`);
        return (
          <Link
            key={tab.label}
            href={href}
            className={`px-4 py-2 text-sm font-semibold rounded-xl whitespace-nowrap transition-all ${
              active
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
      <Link
        href={`/groups/${groupId}/expenses/new`}
        className="ml-auto px-4 py-2 text-sm font-bold bg-yellow-400 text-zinc-900 rounded-xl hover:bg-yellow-300 transition-colors whitespace-nowrap flex-shrink-0"
      >
        + Add
      </Link>
    </div>
  );
}
