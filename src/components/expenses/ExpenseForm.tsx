"use client";

import { useState } from "react";
import { createExpense } from "@/actions/expenses";
import SplitSelector from "./SplitSelector";
import { parseCurrencyInput, centsToDecimalString } from "@/lib/utils/currency";
import { todayISO } from "@/lib/utils/dates";
import type { Profile } from "@/types/app";

interface ExpenseFormProps {
  groupId: string;
  members: Pick<Profile, "id" | "display_name" | "email">[];
  currentUserId: string;
}

const inputClass =
  "w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-4 py-3 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition";

export default function ExpenseForm({
  groupId,
  members,
  currentUserId,
}: ExpenseFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [amountInput, setAmountInput] = useState("");
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal");
  const [paidBy, setPaidBy] = useState(currentUserId);
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
      paidBy,
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
        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
            Description <span className="text-yellow-500">*</span>
          </label>
          <input
            name="description"
            type="text"
            required
            placeholder="Groceries, Rent, Electricity…"
            className={inputClass}
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
            Amount <span className="text-yellow-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-semibold text-sm">$</span>
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="0.00"
              className={`${inputClass} pl-8`}
            />
          </div>
        </div>

        {/* Paid by */}
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
            Paid by
          </label>
          <select
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            className={inputClass}
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.display_name} {m.id === currentUserId ? "(you)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
            Date
          </label>
          <input
            name="date"
            type="date"
            defaultValue={todayISO()}
            required
            className={inputClass}
          />
        </div>

        {/* Split type toggle */}
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
            Split type
          </label>
          <div className="flex gap-2">
            {(["equal", "custom"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSplitType(type)}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all capitalize ${
                  splitType === type
                    ? "bg-zinc-950 text-yellow-400"
                    : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Split selector */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden">
          <SplitSelector
            members={members as Profile[]}
            totalCents={isNaN(amountCents) ? 0 : amountCents}
            splitType={splitType}
            onSplitsChange={setSplits}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
            Notes <span className="text-zinc-300 font-normal normal-case">(optional)</span>
          </label>
          <input
            name="notes"
            type="text"
            placeholder="Any extra details…"
            className={inputClass}
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
          {loading ? "Saving…" : "Add expense"}
        </button>
      </form>
    </div>
  );
}
