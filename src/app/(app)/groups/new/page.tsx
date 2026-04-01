"use client";

import { useState } from "react";
import { createGroup } from "@/actions/groups";
import { useT } from "@/components/providers/LanguageProvider";

export default function NewGroupPage() {
  const { t } = useT();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const inputClass =
    "w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-4 py-3 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createGroup(formData);
    if (result && "error" in result) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center mb-4 text-xl">🏠</div>
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">{t("group.newTitle")}</h1>
        <p className="text-zinc-500 text-sm mt-1">{t("group.newSubtitle")}</p>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-100 p-7">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
              {t("group.name")} <span className="text-yellow-500">*</span>
            </label>
            <input name="name" type="text" required className={inputClass} placeholder={t("group.placeholder.name")} />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
              {t("group.description")} <span className="text-zinc-300 font-normal normal-case">{t("group.optional")}</span>
            </label>
            <input name="description" type="text" className={inputClass} placeholder={t("group.placeholder.description")} />
          </div>

          {error && (
            <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-60 text-zinc-900 font-bold py-3 px-4 rounded-xl transition-colors text-sm"
          >
            {loading ? t("group.creating") : t("group.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
