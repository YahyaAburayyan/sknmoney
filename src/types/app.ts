import type { Database } from "./database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Group = Database["public"]["Tables"]["groups"]["Row"];
export type GroupMember = Database["public"]["Tables"]["group_members"]["Row"];
export type Expense = Database["public"]["Tables"]["expenses"]["Row"];
export type ExpenseSplit =
  Database["public"]["Tables"]["expense_splits"]["Row"];
export type Settlement = Database["public"]["Tables"]["settlements"]["Row"];

export interface GroupMemberWithProfile extends GroupMember {
  profiles: Profile;
}

export interface ExpenseWithDetails extends Expense {
  profiles: Profile; // paid_by profile
  expense_splits: Array<ExpenseSplit & { profiles: Profile }>;
}

export interface SettlementWithProfiles extends Settlement {
  payer: Profile;
  payee: Profile;
}

export interface Balance {
  userId: string;
  net: number; // cents — positive = owed to you, negative = you owe
}

export interface SimplifiedTransaction {
  from: string; // userId who pays
  to: string; // userId who receives
  amount: number; // cents
}

export interface ActivityItem {
  type: "expense" | "settlement";
  id: string;
  date: string;
  created_at: string;
  data: ExpenseWithDetails | SettlementWithProfiles;
}
