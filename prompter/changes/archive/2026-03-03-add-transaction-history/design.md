## Context

The POS system currently has a `History.tsx` page that shows **only today's orders for the logged-in cashier** via `OrderController::history()`. Managers and cashiers need a multi-day transaction history to review sales, audit orders, and reconcile daily totals. The epic describes a two-level drill-down: days → orders → order detail (existing).

### Stakeholders

- Cashiers: view their own historical orders across days
- Admins/Managers: view **all** orders across days for auditing

## Goals / Non-Goals

### Goals

- Day-grouped transaction list with summary stats (date, order count, total revenue)
- Daily drill-down showing all orders for a specific date
- Re-use existing `OrderDetail.tsx` for final drill-down (no new detail page)
- Pagination at both levels (day list + daily orders)
- Timezone-correct date grouping (Asia/Jakarta / WIB)

### Non-Goals

- Editing or modifying past transactions from the history view
- Exporting to CSV/PDF (separate Epic)
- Filtering by cashier, payment method, or status (follow-up)
- Real-time / live updates
- Role-based access control changes (uses existing auth)

## Decisions

### 1. Separate Controller vs. Extending OrderController

**Decision**: Create a new `TransactionHistoryController` in `App\Http\Controllers\POS`.

**Rationale**: The existing `OrderController` handles POS operations (index, store, show, today's history). Transaction history is a distinct read-only analytical view with different query patterns (GROUP BY date). Separating concerns keeps each controller focused.

**Alternatives considered**:

- Extend `OrderController` with more methods → rejected: controller already has 4 methods; adding 2 more with different query patterns would bloat it.

### 2. Date Grouping Strategy

**Decision**: Use `DATE(CONVERT_TZ(created_at, '+00:00', '+07:00'))` (or Laravel equivalent with `Carbon` timezone) to group orders by local Jakarta date.

**Rationale**: The server may store UTC timestamps. Grouping must reflect the local business day (Asia/Jakarta, UTC+7) to match cashier expectations and shift boundaries.

**Implementation**: Use Laravel's `DB::raw()` with timezone-aware date extraction, or convert in PHP using `Carbon::setTimezone('Asia/Jakarta')` before grouping.

### 3. All Orders vs. Current User's Orders

**Decision**: Show **all users' orders** (not filtered by `user_id`). Both admin and cashier roles can see the full history.

**Rationale**: The epic states this is for "review, audit, and track sales activity" — an all-users view. The existing `History.tsx` already serves the "my orders today" use case. If per-user filtering is needed later, it can be added as an out-of-scope follow-up filter.

### 4. Which Order Statuses to Include

**Decision**: Include `completed` and `cancelled` orders. Exclude `pending` orders.

**Rationale**: Transaction history represents finalized orders. Pending orders are in-progress POS operations and should not appear in historical views. Cancelled orders are included for auditability.

### 5. Navigation Placement

**Decision**: Add "Transaction History" as a new nav link in the POS section of `AuthenticatedLayout.tsx`, below the existing "Order History" link.

**Rationale**: Minimal disruption to existing nav. The two links serve different purposes: "Order History" = today's cashier orders; "Transaction History" = all-time multi-day view.

### 6. Frontend Data Flow

**Decision**: Use server-side Inertia.js props (not client-side API calls). The controller returns paginated data via `Inertia::render()`, consistent with every other page in the app.

**Rationale**: Aligns with the existing stack pattern. No need for a separate API layer.

## Risks / Trade-offs

| Risk                                                       | Mitigation                                                                                               |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Slow GROUP BY query on large `orders` table                | Add DB index on `orders.created_at` if not already present; paginate day summaries (15 per page default) |
| Timezone mismatch between DB and display                   | Use explicit `Asia/Jakarta` timezone in both SQL grouping and frontend formatting                        |
| Naming confusion: "Order History" vs "Transaction History" | Clear labeling in nav; consider renaming "Order History" to "Today's Orders" in a follow-up              |

## Open Questions

1. Should the existing "Order History" nav link be renamed to "Today's Orders" for clarity? (Deferred — out of scope for this change)
2. Confirm: should cancelled orders be included in daily revenue totals, or excluded? (Assumption: **excluded**, consistent with `add-refund-void-management` spec)
