"use client";

import { useState } from "react";
import { signUp } from "@/actions/auth";
import Link from "next/link";

const inputClass =
  "w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await signUp(formData);
    if (result && "error" in result) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-8">
      <h2 className="text-2xl font-extrabold text-white mb-1">Create account</h2>
      <p className="text-zinc-500 text-sm mb-7">Start tracking shared expenses</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Your name
          </label>
          <input
            name="displayName"
            type="text"
            required
            className={inputClass}
            placeholder="Ahmed"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={inputClass}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            autoComplete="new-password"
            className={inputClass}
            placeholder="At least 6 characters"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-60 text-zinc-900 font-bold py-3 px-4 rounded-xl transition-colors text-sm"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-600">
        Already have an account?{" "}
        <Link href="/login" className="text-yellow-400 hover:text-yellow-300 font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  );
}
