# SknMoney — Shared Expense Tracker for Roommates

> Stop arguing about who owes what. SknMoney keeps everyone on the same page.

**Live Demo → [sknmoney.vercel.app](https://sknmoney.vercel.app)**

---

## The Problem

When you share an apartment, someone is always covering groceries, internet, or electricity on behalf of the group. After a few weeks, no one remembers who owes how much, and awkward WhatsApp reminders become the norm. SknMoney solves this by replacing messy verbal tracking with a transparent, shared record that everyone can see and update in real time.

---

## Features

### Core
- **Multi-group support** — join or create separate groups for different apartments or shared households
- **Expense logging** — record who paid, how much, and exactly who benefited
- **Equal or custom splits** — split evenly with one click, or assign custom amounts per person
- **Real-time balance tracking** — always see the current state of who owes whom
- **Mark as Paid** — when money changes hands, one tap updates the balance for everyone
- **Soft-delete with audit trail** — deleted expenses are archived, not erased

### Smart
- **Debt simplification algorithm** — instead of 10 separate debts, the system computes the minimum number of transactions needed to settle everything (at most N-1 for N people)
- **Greedy creditor-debtor matching** — balances are simplified mathematically, not just displayed
- **Integer-cent precision** — all monetary values stored as integer cents, eliminating floating-point rounding errors

### UX
- **Arabic / English language toggle** — full RTL support for Arabic
- **Profile analytics dashboard** — charts showing your spending over time and breakdown by group
- **Invite codes** — 6-character codes to invite roommates with no email required
- **Mobile-friendly** — responsive layout with bottom tab bar on small screens

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email + password) |
| Styling | Tailwind CSS |
| Validation | Zod |
| Deployment | Vercel |

---

## Architecture

### Data Flow
All mutations go through **Next.js Server Actions** — no REST API layer needed. Pages are React Server Components that query Supabase directly. The browser Supabase client is only used for Realtime subscriptions.

```
User Action → Server Action (validate with Zod) → Supabase DB → Redirect / Revalidate
```

### Security Model
**Row Level Security (RLS)** is enforced at the PostgreSQL layer. Every table has policies backed by an `is_group_member(gid)` helper function — users can only read or write data for groups they belong to. The service role key is never exposed to the client.

### Money Handling
All monetary values are **integer cents** throughout — in the database, server actions, and component state. The `splitEqually()` function assigns any rounding remainder to the payer, ensuring splits always sum exactly to the total.

### Debt Simplification
`src/lib/algorithms/debt-simplification.ts` implements:
1. `computeNetBalances()` — converts raw pair-wise DB rows into per-person net amounts
2. `simplifyDebts()` — greedy algorithm that produces the minimum number of transactions to clear all debts

---

## Project Structure

```
src/
├── actions/          # Server Actions (auth, groups, expenses, settlements)
├── app/
│   ├── (auth)/       # Login / signup pages
│   ├── (app)/        # Authenticated app (dashboard, groups, profile)
│   └── api/          # Auth callback route
├── components/
│   ├── charts/       # Recharts-based analytics charts
│   ├── expenses/     # Expense form, split selector, delete button
│   ├── groups/       # Group settings UI
│   ├── layout/       # Sidebar, group tabs
│   ├── providers/    # Language context (AR/EN)
│   └── settlements/  # Mark as Paid button, settlement form
├── lib/
│   ├── algorithms/   # Debt simplification algorithm
│   ├── supabase/     # Browser + server Supabase clients
│   └── utils/        # Currency formatting, date helpers
└── types/            # DB types, app-level derived types
```

---


## Roadmap

- [ ] Push notifications when a new expense is added
- [ ] Recurring expenses (rent, internet)
- [ ] Export to PDF / CSV
- [ ] Mobile app (React Native)
- [ ] Payment integration (pay directly through the app)

---

## Author

**Yahya Abu Rayyan**
Built as a real-world full-stack project demonstrating Next.js 15, Supabase, TypeScript, and modern web application architecture.

[GitHub](https://github.com/YahyaAburayyan) · [Live Demo](https://sknmoney.vercel.app)

---

## License

MIT — free to use, fork, and build on.
