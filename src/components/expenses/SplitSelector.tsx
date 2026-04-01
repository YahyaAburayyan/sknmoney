"use client";

import { useEffect, useState } from "react";
import { formatCents, parseCurrencyInput, centsToDecimalString, splitEqually } from "@/lib/utils/currency";
import type { Profile } from "@/types/app";

export interface SplitEntry {
  userId: string;
  amountCents: number;
  included: boolean;
}

interface SplitSelectorProps {
  members: Profile[];
  totalCents: number;
  splitType: "equal" | "custom";
  onSplitsChange: (splits: Array<{ userId: string; amountCents: number }>) => void;
}

export default function SplitSelector({
  members,
  totalCents,
  splitType,
  onSplitsChange,
}: SplitSelectorProps) {
  // Track which members are included (for equal split)
  const [included, setIncluded] = useState<Record<string, boolean>>(
    Object.fromEntries(members.map((m) => [m.id, true]))
  );

  // Track custom amounts (for custom split)
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>(
    Object.fromEntries(members.map((m) => [m.id, ""]))
  );

  // Compute and emit splits whenever inputs change
  useEffect(() => {
    if (splitType === "equal") {
      const activeMemberIds = members.filter((m) => included[m.id]).map((m) => m.id);
      if (activeMemberIds.length === 0 || totalCents === 0) {
        onSplitsChange([]);
        return;
      }
      const amounts = splitEqually(totalCents, activeMemberIds.length);
      onSplitsChange(activeMemberIds.map((id, i) => ({ userId: id, amountCents: amounts[i] })));
    } else {
      const splits = members
        .map((m) => ({
          userId: m.id,
          amountCents: parseCurrencyInput(customAmounts[m.id] || "0"),
        }))
        .filter((s) => !isNaN(s.amountCents) && s.amountCents > 0);
      onSplitsChange(splits);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splitType, included, customAmounts, totalCents, members.length]);

  if (splitType === "equal") {
    const activeMemberIds = members.filter((m) => included[m.id]).map((m) => m.id);
    const perPerson =
      activeMemberIds.length > 0 && totalCents > 0
        ? Math.ceil(totalCents / activeMemberIds.length)
        : 0;

    return (
      <div className="space-y-2">
        {members.map((m) => (
          <label
            key={m.id}
            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 text-green-600 rounded border-gray-300"
                checked={!!included[m.id]}
                onChange={(e) =>
                  setIncluded((prev) => ({ ...prev, [m.id]: e.target.checked }))
                }
              />
              <span className="text-sm text-gray-700">{m.display_name}</span>
            </div>
            <span className="text-sm text-gray-500">
              {included[m.id] && totalCents > 0 ? formatCents(perPerson) : "—"}
            </span>
          </label>
        ))}
        {activeMemberIds.length === 0 && (
          <p className="text-xs text-red-500 px-3">Select at least one person</p>
        )}
      </div>
    );
  }

  // Custom mode
  const customTotal = members.reduce((sum, m) => {
    const val = parseCurrencyInput(customAmounts[m.id] || "0");
    return sum + (isNaN(val) ? 0 : val);
  }, 0);
  const remaining = totalCents - customTotal;
  const isValid = remaining === 0 && totalCents > 0;

  return (
    <div className="space-y-2">
      {members.map((m) => (
        <div key={m.id} className="flex items-center gap-2 py-1 px-3">
          <span className="flex-1 text-sm text-gray-700">{m.display_name}</span>
          <div className="relative w-28">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={customAmounts[m.id]}
              onChange={(e) =>
                setCustomAmounts((prev) => ({ ...prev, [m.id]: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg pl-5 pr-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      ))}
      <div
        className={`flex items-center justify-between text-xs px-3 pt-1 font-medium ${
          isValid ? "text-green-600" : remaining < 0 ? "text-red-500" : "text-orange-500"
        }`}
      >
        <span>
          {remaining === 0
            ? "✓ Splits match total"
            : remaining > 0
            ? `${formatCents(remaining)} remaining`
            : `${formatCents(Math.abs(remaining))} over total`}
        </span>
        <span>
          Total: {formatCents(customTotal)} / {formatCents(totalCents)}
        </span>
      </div>
    </div>
  );
}
