"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export type ActionResult = { error: string } | { success: true };

const settlementSchema = z.object({
  paidTo: z.string().uuid("Invalid recipient"),
  amountCents: z.number().int().positive("Amount must be greater than 0"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().max(300).optional(),
});

export async function createSettlement(
  groupId: string,
  raw: {
    paidTo: string;
    amountCents: number;
    date: string;
    notes?: string;
  }
): Promise<ActionResult> {
  const parsed = settlementSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { paidTo, amountCents, date, notes } = parsed.data;

  if (paidTo === user.id) {
    return { error: "You cannot settle with yourself" };
  }

  const { error } = await supabase.from("settlements").insert({
    group_id: groupId,
    paid_by: user.id,
    paid_to: paidTo,
    amount_cents: amountCents,
    notes: notes ?? null,
    date,
    created_by: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath(`/groups/${groupId}`);
  redirect(`/groups/${groupId}/feed`);
}

// Creditor confirms they received payment from the debtor
export async function confirmPaymentReceived(
  groupId: string,
  paidBy: string,   // the debtor's user ID
  amountCents: number
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.rpc("confirm_payment_received", {
    p_group_id: groupId,
    p_paid_by: paidBy,
    p_amount_cents: amountCents,
  });

  if (error) return { error: error.message };

  revalidatePath(`/groups/${groupId}/balances`);
  revalidatePath(`/groups/${groupId}/feed`);
  return { success: true };
}

// One-click settlement — records the full amount and stays on the balances page
export async function markAsPaid(
  groupId: string,
  paidTo: string,
  amountCents: number
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (paidTo === user.id) return { error: "You cannot settle with yourself" };
  if (!Number.isInteger(amountCents) || amountCents <= 0)
    return { error: "Invalid amount" };

  const today = new Date().toISOString().split("T")[0];

  const { error } = await supabase.from("settlements").insert({
    group_id: groupId,
    paid_by: user.id,
    paid_to: paidTo,
    amount_cents: amountCents,
    notes: null,
    date: today,
    created_by: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath(`/groups/${groupId}/balances`);
  revalidatePath(`/groups/${groupId}/feed`);
  return { success: true };
}
