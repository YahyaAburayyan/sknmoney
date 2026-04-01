"use client";

import { useState } from "react";
import { deleteExpense } from "@/actions/expenses";
import { useRouter } from "next/navigation";

export default function DeleteExpenseButton({
  expenseId,
  groupId,
}: {
  expenseId: string;
  groupId: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    const result = await deleteExpense(expenseId, groupId);
    if ("error" in result) {
      alert(result.error);
      setLoading(false);
      setConfirming(false);
    } else {
      router.refresh();
    }
  }

  if (confirming) {
    return (
      <div className="flex gap-1 mt-1">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs text-red-600 hover:underline disabled:opacity-50"
        >
          {loading ? "Deleting…" : "Confirm"}
        </button>
        <span className="text-xs text-gray-300">|</span>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-gray-400 hover:underline"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs text-gray-300 hover:text-red-400 mt-1 transition-colors"
    >
      Delete
    </button>
  );
}
