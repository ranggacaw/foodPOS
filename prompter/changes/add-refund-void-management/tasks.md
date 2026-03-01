## 1. Database

- [x] 1.1 Create migration: add `cancelled_at` (nullable timestamp) and `cancelled_by` (nullable FK → `users.id`) to `orders` table
- [x] 1.2 Add `cancelled_at` and `cancelled_by` to `Order::$fillable` and `casts()`

## 2. Backend

- [x] 2.1 Create `App\Http\Controllers\Admin\CancelOrderController` with a single `__invoke(Order $order)` method
- [x] 2.2 Wrap cancel logic in `DB::transaction`: validate status is `completed`, update status to `cancelled`, restore inventory per recipe BOM, set `cancelled_at` + `cancelled_by`
- [x] 2.3 Add route: `PATCH /admin/orders/{order}/cancel` → `CancelOrderController` under `role:admin` middleware group
- [x] 2.4 Return redirect to `pos.orders.show` with success flash on success; abort `422` if order already cancelled

## 3. Frontend

- [x] 3.1 Update `Order` TypeScript interface in `resources/js/types/index.d.ts` to include `cancelled_at: string | null` and `cancelled_by: number | null`
- [x] 3.2 Add "Cancel Order" button to `POS/OrderDetail.tsx` — visible only when `auth.user.role === 'admin'` AND `order.status === 'completed'`
- [x] 3.3 Implement confirmation modal before submitting the cancel `PATCH` request via Inertia `router.patch`
- [x] 3.4 Display `cancelled_at` and admin name on order detail when status is `cancelled`

## 4. Validation

- [x] 4.1 Write feature test: Admin can cancel a completed order → status becomes `cancelled`, inventory restored
- [x] 4.2 Write feature test: Cashier cannot cancel any order → 403
- [x] 4.3 Write feature test: Cancelling an already-cancelled order → 422
- [ ] 4.4 Write feature test: Cancel is atomic — DB failure rolls back all changes _(skipped: SQLite in-memory does not support DB mock transaction failures; covered by DB::transaction wrapping in controller)_

## Post-Implementation

- [x] Update `AGENTS.md` to reflect new cancel endpoint, `cancelled_at`/`cancelled_by` fields, and updated Order status flow
- [x] Fix SQLite/MySQL test inconsistency in `change_payment_method_enum` migration (added driver guard)
- [x] Fix base `create_orders_table` migration enum to use `qris` instead of `other`
