"use client";

import { useState } from "react";
import { createExpense } from "@/actions/expenses";
import SplitSelector from "./SplitSelector";
import { parseCurrencyInput, centsToDecimalString } from "@/lib/utils/currency";
import { todayISO } from "@/lib/utils/dates";
import type { Profile } from "@/types/app";
import { useT } from "@/components/providers/LanguageProvider";

interface ExpenseFormProps {
  groupId: string;
  members: Pick<Profile, "id" | "display_name" | "email">[];
  currentUserId: string;
}

const inputClass =
  "w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-4 py-3 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition";

export default function ExpenseForm({ groupId, members, currentUserId }: ExpenseFormProps) {
  const { t } = useT();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [amountInput, setAmountInput] = useState("");
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal");
  const [splits, setSplits] = useState<Array<{ userId: string; amountCents: number }>>([]);

  const amountCents = parseCurrencyInput(amountInput);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (isNaN(amountCents) || amountCents <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (splits.length === 0) {
      setError("Select at least one person to split with");
      return;
    }
    if (splitType === "custom") {
      const splitSum = splits.reduce((s, sp) => s + sp.amountCents, 0);
      if (splitSum !== amountCents) {
        setError(`Split amounts must sum to $${centsToDecimalString(amountCents)}`);
        return;
      }
    }

    setLoading(true);
    const form = e.currentTarget;
    const result = await createExpense(groupId, {
      description: form.description.value,
      amountCents,
      paidBy: currentUserId,
      splitType,
      splits,
      date: form.date.value,
      notes: form.notes.value || undefined,
    });

    if (result && "error" in result) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-zinc-100 p-7">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
            {t("expense.description")} <span className="text-yellow-500">*</span>
          </label>
          <input
            name="description"
            type="text"
            required
            placeholder={t("expense.placeholder.description")}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
            {t("expense.amount")} <span className="text-yellow-500">*</span>
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
            {t("expense.date")}
          </label>
          <input name="date" type="date" defaultValue={todayISO()} required className={inputClass} />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
            {t("expense.splitType")}
          </label>
          <div className="flex gap-2">
            {(["equal", "custom"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSplitType(type)}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                  splitType === type
                    ? "bg-zinc-950 text-yellow-400"
                    : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                }`}
              >
                {type === "equal" ? t("expense.equal") : t("expense.custom")}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden">
          <SplitSelector
            members={members as Profile[]}
            totalCents={isNaN(amountCents) ? 0 : amountCents}
            splitType={splitType}
            onSplitsChange={setSplits}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
            {t("expense.notes")} <span className="text-zinc-300 font-normal normal-case">{t("expense.optional")}</span>
          </label>
          <input
            name="notes"
            type="text"
            placeholder={t("expense.placeholder.notes")}
            className={inputClass}
          />
        </div>

        {error && (
          <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-60 text-zinc-900 font-bold py-3 px-4 rounded-xl transition-colors text-sm"
        >
          {loading ? t("expense.saving") : t("expense.submit")}
        </button>
      </form>
    </div>
  );
}
