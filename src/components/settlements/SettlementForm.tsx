"use client";

import { useState } from "react";
import { createSettlement } from "@/actions/settlements";
import { parseCurrencyInput, centsToDecimalString } from "@/lib/utils/currency";
import { todayISO } from "@/lib/utils/dates";
import { useT } from "@/components/providers/LanguageProvider";

interface SettlementFormProps {
  groupId: string;
  members: Array<{ id: string; display_name: string }>;
  prefilledTo?: string;
  prefilledAmountCents?: number;
}

const inputClass =
  "w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-4 py-3 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition";

export default function SettlementForm({ groupId, members, prefilledTo, prefilledAmountCents }: SettlementFormProps) {
  const { t } = useT();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [amountInput, setAmountInput] = useState(
    prefilledAmountCents ? centsToDecimalString(prefilledAmountCents) : ""
  );
  const [paidTo, setPaidTo] = useState(prefilledTo ?? (members[0]?.id ?? ""));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const amountCents = parseCurrencyInput(amountInput);
    if (isNaN(amountCents) || amountCents <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (!paidTo) {
      setError("Please select who you paid");
      return;
    }

    setLoading(true);
    const form = e.currentTarget;
    const result = await createSettlement(groupId, {
      paidTo,
      amountCents,
      date: form.date.value,
      notes: (form.notes as HTMLInputElement).value || undefined,
    });

    if (result && "error" in result) {
      setError(result.error);
      setLoading(false);
    }
  }

  if (members.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-100 p-6 text-center text-zinc-400">
        {t("settle.noMembers")}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-zinc-100 p-7">
      <p className="text-sm text-zinc-500 mb-6">{t("settle.subtitle")}</p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
            {t("settle.iPaid")} <span className="text-yellow-500">*</span>
          </label>
          <select value={paidTo} onChange={(e) => setPaidTo(e.target.value)} required className={inputClass}>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.display_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
            {t("settle.amount")} <span className="text-yellow-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute start-4 top-1/2 -translate-y-1/2 text-zinc-400 font-semibold text-sm">$</span>
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="0.00"
              className={`${inputClass} ps-8`}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
            {t("settle.date")}
          </label>
          <input name="date" type="date" defaultValue={todayISO()} required className={inputClass} />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
            {t("settle.notes")} <span className="text-zinc-300 font-normal normal-case">{t("settle.optional")}</span>
          </label>
          <input name="notes" type="text" placeholder={t("settle.placeholder.notes")} className={inputClass} />
        </div>

        {error && (
          <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-60 text-zinc-900 font-bold py-3 px-4 rounded-xl transition-colors text-sm"
        >
          {loading ? t("settle.recording") : t("settle.submit")}
        </button>
      </form>
    </div>
  );
}
