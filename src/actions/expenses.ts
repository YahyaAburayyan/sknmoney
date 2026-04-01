"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export type ActionResult = { error: string } | { success: true };

const splitSchema = z.object({
  userId: z.string().uuid(),
  amountCents: z.number().int().positive(),
});

const expenseSchema = z
  .object({
    description: z.string().min(1, "Description is required").max(200),
    amountCents: z.number().int().positive("Amount must be greater than 0"),
    paidBy: z.string().uuid("Invalid payer"),
    splitType: z.enum(["equal", "custom"]),
    splits: z.array(splitSchema).min(1, "At least one person must be included"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
    notes: z.string().max(500).optional(),
  })
  .refine(
    (data) =>
      data.splits.reduce((s, sp) => s + sp.amountCents, 0) === data.amountCents,
    { message: "Split amounts must sum to the total expense amount" }
  );

export async function createExpense(
  groupId: string,
  raw: {
    description: string;
    amountCents: number;
    paidBy: string;
    splitType: "equal" | "custom";
    splits: Array<{ userId: string; amountCents: number }>;
    date: string;
    notes?: string;
  }
): Promise<ActionResult> {
  const parsed = expenseSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { description, amountCents, paidBy, splitType, splits, date, notes } =
    parsed.data;

  // Insert the expense
  const { data: expense, error: expError } = await supabase
    .from("expenses")
    .insert({
      group_id: groupId,
      paid_by: paidBy,
      description,
      amount_cents: amountCents,
      split_type: splitType,
      date,
      notes: notes ?? null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (expError || !expense) {
    return { error: expError?.message ?? "Failed to create expense" };
  }

  // Insert splits
  const { error: splitsError } = await supabase.from("expense_splits").insert(
    splits.map((s) => ({
      expense_id: expense.id,
      user_id: s.userId,
      amount_cents: s.amountCents,
    }))
  );

  if (splitsError) {
    // Rollback: delete the expense (cascade deletes splits too)
    await supabase.from("expenses").delete().eq("id", expense.id);
    return { error: splitsError.message };
  }

  revalidatePath(`/groups/${groupId}`);
  redirect(`/groups/${groupId}/feed`);
}

export async function deleteExpense(
  expenseId: string,
  groupId: string
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("expenses")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", expenseId);

  if (error) return { error: error.message };

  revalidatePath(`/groups/${groupId}`);
  return { success: true };
}
