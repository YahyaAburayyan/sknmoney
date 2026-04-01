"use client";

import { useState } from "react";
import { markAsPaid, confirmPaymentReceived } from "@/actions/settlements";
import { useT } from "@/components/providers/LanguageProvider";

interface MarkAsPaidButtonProps {
  groupId: string;
  amountCents: number;
  direction: "debtor" | "creditor";
  otherUserId: string;
}

export default function MarkAsPaidButton({
  groupId,
  amountCents,
  direction,
  otherUserId,
}: MarkAsPaidButtonProps) {
  const { t } = useT();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    const result =
      direction === "debtor"
        ? await markAsPaid(groupId, otherUserId, amountCents)
        : await confirmPaymentReceived(groupId, otherUserId, amountCents);

    if (result && "error" in result) {
      setError(result.error);
      setLoading(false);
    } else {
      setDone(true);
    }
  }

  if (done) {
    return (
      <span className="text-xs text-emerald-600 font-bold px-3 py-1.5 bg-emerald-50 rounded-lg">
        {t("balances.recorded")}
      </span>
    );
  }

  const label = direction === "debtor" ? t("balances.markAsPaid") : t("balances.confirmReceived");
  const style =
    direction === "debtor"
      ? "bg-zinc-950 text-white hover:bg-zinc-800"
      : "bg-emerald-600 text-white hover:bg-emerald-700";

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`text-xs px-3 py-1.5 rounded-lg font-bold disabled:opacity-50 transition-colors ${style}`}
      >
        {loading ? t("balances.saving") : label}
      </button>
      {error && <p className="text-xs text-rose-500 max-w-[140px] text-end">{error}</p>}
    </div>
  );
}
