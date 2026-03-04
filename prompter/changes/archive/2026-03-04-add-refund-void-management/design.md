## Context

Order void is a financially sensitive operation. Reversing a completed order
affects revenue reporting, inventory levels, and accountability.
The current system has no cancel mechanism despite `cancelled` being a valid
status enum value in the DB. Inventory deduction is irreversible today.

## Goals / Non-Goals

- **Goals:**
    - Allow admin to mark a `completed` order as `cancelled`
    - Restore inventory quantities on cancellation (reverse the deduction done at order creation)
    - Record who cancelled and when
    - Exclude cancelled orders from all financial summaries

- **Non-Goals:**
    - No payment gateway refund (cash refunds are manual/offline)
    - No partial cancellation (cancel whole order only, not individual line items)
    - No cashier-initiated cancellations (admin-only for accountability)

## Decisions

- **Inventory restore via recipe BOM at cancel time:** We re-derive the deduction
  amounts from `order_items.quantity` × the stored `recipe.quantity` per ingredient.
  This is correct because `OrderItem` stores the snapshot of `menu_item_id` and
  `quantity` — the original recipe quantities are still in `recipes`. If a recipe
  has since been changed, the restore will use current recipe quantities, not
  historical ones. This is an acceptable trade-off for MVP; a full audit trail
  (separate proposal) provides the record-of-truth.

- **`cancelled_by` FK to users:** Enables accountability — admins can see which
  admin processed the void. Uses `nullOnDelete` so the log survives user deletion.

- **Atomic DB transaction:** Cancel + inventory-restore is wrapped in a single
  `DB::transaction()` to ensure no partial state.

- **Admin-only cancel:** Cashiers cannot cancel. This matches the existing
  permission pattern (`role:admin` middleware) and prevents accidental or
  fraudulent voids.

## Risks / Trade-offs

- **Inventory restore uses current recipe:** If an ingredient's cost or quantity in
  the recipe changed since the order was placed, the restore amount may differ from
  the original deduction. Accepted for MVP; full COGS snapshotting is a v2 concern.
- **Negative stock remains possible:** Cancel restores stock, but if stock is already
  negative, the restore just makes it less negative. No guard added here.

## Migration Plan

New migration adds two nullable columns — safe to run on live DB with zero downtime:

```
$table->foreignId('cancelled_by')->nullable()->constrained('users')->nullOnDelete();
$table->timestamp('cancelled_at')->nullable();
```

## Open Questions

- Should cancelled orders appear in the order history list with a visual indicator,
  or be hidden entirely? → **Recommendation:** Show with a `CANCELLED` badge (better UX).
