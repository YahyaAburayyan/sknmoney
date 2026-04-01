"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type ActionResult = { error: string } | { success: true };

const createGroupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  description: z.string().max(200).optional(),
});

export async function createGroup(formData: FormData): Promise<ActionResult> {
  const parsed = createGroupSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Use security-definer RPC so RLS doesn't block the insert
  // (before the user is a member, SELECT on groups is blocked)
  const { data: groupId, error } = await supabase.rpc("create_group", {
    p_name: parsed.data.name,
    p_description: parsed.data.description ?? null,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  redirect(`/groups/${groupId}`);
}

export async function joinGroup(formData: FormData): Promise<ActionResult> {
  const inviteCode = (formData.get("inviteCode") as string)
    ?.trim()
    .toUpperCase();

  if (!inviteCode || inviteCode.length < 4) {
    return { error: "Please enter a valid invite code" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Use a security-definer RPC so we can look up the group by invite code
  // before the user is a member (direct SELECT would be blocked by RLS)
  const { data: groupId, error: joinError } = await supabase.rpc(
    "join_group_by_invite_code",
    { p_invite_code: inviteCode }
  );

  if (joinError) {
    if (joinError.message.includes("Invalid invite code")) {
      return { error: "Invalid invite code. Check with your group admin." };
    }
    return { error: joinError.message };
  }

  revalidatePath("/dashboard");
  redirect(`/groups/${groupId}`);
}

export async function leaveGroup(groupId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateGroupName(
  groupId: string,
  name: string
): Promise<ActionResult> {
  if (!name || name.trim().length < 2) {
    return { error: "Name must be at least 2 characters" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("groups")
    .update({ name: name.trim(), updated_at: new Date().toISOString() })
    .eq("id", groupId);

  if (error) return { error: error.message };

  revalidatePath(`/groups/${groupId}`);
  return { success: true };
}
