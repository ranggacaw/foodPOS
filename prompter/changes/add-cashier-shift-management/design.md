## Context

A "shift" in a restaurant POS tracks the period a cashier is on duty.
It anchors order history to a time window, enables cash drawer reconciliation
(opening float vs closing takings), and provides a summary for handover.
This is a standard operational requirement before live deployment.

## Goals / Non-Goals

- **Goals:**
    - Allow a cashier or admin to open and close a shift
    - Associate orders placed during a shift with that shift
    - Provide a shift summary: orders, revenue, payment method breakdown, expected closing cash
    - Admin can view all shifts; cashier sees only their own

- **Non-Goals:**
    - No shift scheduling (no future/pre-planned shifts)
    - No multi-shift overlap per user (one open shift at a time per user)
    - No shift transfer (a shift cannot be reassigned to another user)
    - No automatic shift closure (remains open until manually closed)

## Decisions

- **`shifts` table, separate from `orders`:** Shifts are first-class entities.
  Joining shifts to orders via `shift_id` on the orders table is the cheapest
  relation that keeps the migration additive and non-breaking.

- **`shift_id` is nullable on `orders`:** Historical orders (before this feature)
  have no shift; new orders placed without an open shift also get `null`.
  This avoids a hard gate that would break existing POS usage.

- **One open shift per user enforced at application level:** Checked in
  `ShiftController::store()` with a `422` response. No DB unique constraint
  (would complicate the `closed` state coexistence).

- **Expected closing cash = opening_cash + SUM of cash-payment order totals:**
  This is the amount the cash drawer should contain. Card and QRIS are non-cash.

- **Shift pages under `/pos/shifts`:** Consistent with `pos.*` namespace.
  Admin can also access via the same URLs since admin has full `auth+verified` access.

## Risks / Trade-offs

- **Soft coupling:** Because `shift_id` is nullable, it's possible to place
  orders without an open shift. This is intentional for backward compatibility
  but means shift-based reporting will have gaps for orders placed outside a shift.
  Future enforcement (require open shift before POS) is a separate proposal.

## Migration Plan

Two additive migrations, safe for live DB:

1. `create_shifts_table` — new table, no existing-table changes
2. `add_shift_id_to_orders_table` — adds nullable FK column to `orders`

Rollback is safe: dropping the FK and the shifts table causes no data loss.

## Open Questions

- Should the POS terminal block order creation if no shift is open? →
  **Recommendation:** Not for MVP. Show a warning banner instead ("No active shift").
  Hard-blocking is a follow-up proposal once shift adoption is established.
