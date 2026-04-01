"use client";

import { useState } from "react";
import { joinGroup } from "@/actions/groups";

export default function JoinGroupPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await joinGroup(formData);
    if (result && "error" in result) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center mb-4 text-xl">🔗</div>
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Join a group</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Ask your group admin for the 6-character invite code, then enter it below.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-100 p-7">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Invite code
            </label>
            <input
              name="inviteCode"
              type="text"
              required
              className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-4 text-2xl font-mono font-bold tracking-widest uppercase text-center placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition"
              placeholder="ABC123"
              maxLength={10}
            />
          </div>

          {error && (
            <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-60 text-zinc-900 font-bold py-3 px-4 rounded-xl transition-colors text-sm"
          >
            {loading ? "Joining…" : "Join group"}
          </button>
        </form>
      </div>
    </div>
  );
}
