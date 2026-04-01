"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { leaveGroup, updateGroupName } from "@/actions/groups";

interface Member {
  userId: string;
  role: string;
  joinedAt: string;
  profile: { display_name: string; email: string } | null | undefined;
}

interface Group {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  created_by: string;
}

export default function GroupSettingsClient({
  group,
  members,
  isAdmin,
  currentUserId,
  groupId,
}: {
  group: Group;
  members: Member[];
  isAdmin: boolean;
  currentUserId: string;
  groupId: string;
}) {
  const [name, setName] = useState(group.name);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [renameLoading, setRenameLoading] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  async function handleRename(e: React.FormEvent) {
    e.preventDefault();
    setRenameError(null);
    setRenameLoading(true);
    const result = await updateGroupName(groupId, name);
    if ("error" in result) setRenameError(result.error);
    setRenameLoading(false);
  }

  async function handleLeave() {
    if (!confirm("Are you sure you want to leave this group?")) return;
    setLeaveLoading(true);
    await leaveGroup(groupId);
  }

  function copyCode() {
    navigator.clipboard.writeText(group.invite_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="space-y-6 max-w-lg">
      {/* Invite code */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-medium text-gray-800 mb-3">Invite code</h3>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
            <p className="font-mono text-2xl font-bold tracking-widest text-gray-800 text-center">
              {group.invite_code}
            </p>
          </div>
          <button
            onClick={copyCode}
            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Share this code with your roommates so they can join.
        </p>
      </div>

      {/* Rename (admin only) */}
      {isAdmin && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-medium text-gray-800 mb-3">Group name</h3>
          <form onSubmit={handleRename} className="flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="submit"
              disabled={renameLoading || name === group.name}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {renameLoading ? "Saving…" : "Save"}
            </button>
          </form>
          {renameError && (
            <p className="text-xs text-red-500 mt-2">{renameError}</p>
          )}
        </div>
      )}

      {/* Members */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-medium text-gray-800 mb-3">
          Members ({members.length})
        </h3>
        <div className="space-y-2">
          {members.map((m) => (
            <div
              key={m.userId}
              className="flex items-center justify-between py-1.5"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                  {m.profile?.display_name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div>
                  <p className="text-sm text-gray-700">
                    {m.profile?.display_name ?? "Unknown"}
                    {m.userId === currentUserId ? " (you)" : ""}
                  </p>
                  <p className="text-xs text-gray-400">{m.profile?.email}</p>
                </div>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  m.role === "admin"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {m.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Leave group */}
      <div className="bg-white rounded-xl border border-red-100 p-5">
        <h3 className="font-medium text-gray-800 mb-1">Leave group</h3>
        <p className="text-sm text-gray-500 mb-3">
          You will lose access to this group&apos;s expenses and balances.
        </p>
        <button
          onClick={handleLeave}
          disabled={leaveLoading}
          className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          {leaveLoading ? "Leaving…" : "Leave group"}
        </button>
      </div>
    </div>
  );
}
