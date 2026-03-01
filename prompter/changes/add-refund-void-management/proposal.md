# Change: Add Refund & Void Management

## Why

Completed orders currently cannot be reversed. When a cashier makes a mistake or a customer requests a cancellation, there is no mechanism to void or refund an order — leaving the POS in an inconsistent state where revenue is overstated and inventory remains under-deducted.

## What Changes

- Add a `PATCH /admin/orders/{order}/cancel` route (admin-only) to void a completed order
- Set order status to `cancelled` and restore ingredient inventory quantities on void
- Add a `cancelled_at` timestamp and `cancelled_by` (user_id) to the `orders` table via a new migration
- Expose a void/cancel action on the Order Detail page (admin only), with confirmation modal
- Exclude cancelled orders from revenue totals in Dashboard and Reports (already filtered — confirm behaviour holds)
- Add `CancelOrderController` under `App\Http\Controllers\Admin\`

**No new payment gateway or refund processing** — this is an internal void (cash reconciliation is manual). Physical cash refunds are handled offline.

## Impact

- Affected specs: `order-management`, `inventory-management`
- Affected code:
    - `routes/web.php` — new admin PATCH route
    - `app/Http/Controllers/Admin/CancelOrderController.php` — new controller
    - `app/Models/Order.php` — `cancelled_at`, `cancelled_by` fillable + casts
    - `resources/js/Pages/POS/OrderDetail.tsx` — cancel button + confirmation modal (admin only)
    - `database/migrations/` — new migration for `cancelled_at`, `cancelled_by`
    - `resources/js/types/index.d.ts` — update `Order` TypeScript interface
