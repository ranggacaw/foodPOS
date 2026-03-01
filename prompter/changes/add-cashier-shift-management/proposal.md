# Change: Add Cashier Shift Management

## Why

There is currently no concept of a cashier "shift" — the POS has no way to track when a cashier begins work, how much cash they opened with, how much they processed, or how to reconcile their cash drawer at the end of a shift. This makes cash-handling accountability impossible and is a required operational control before live deployment.

## What Changes

- New `shifts` table: `id`, `user_id`, `opened_at`, `closed_at`, `opening_cash`, `closing_cash`, `notes`, `status (open|closed)`
- New `Shift` Eloquent model with relationships to `User` and `Order`
- Associate `orders` with a `shift_id` via migration (nullable FK — historical orders are not shift-linked)
- New `ShiftController` under `App\Http\Controllers\POS\`:
    - `POST /pos/shifts` — open a new shift (cashier must open a shift before taking orders)
    - `PATCH /pos/shifts/{shift}/close` — close shift, record closing cash and notes
    - `GET /pos/shifts` — shift history (admin sees all; cashier sees own)
    - `GET /pos/shifts/{shift}` — shift summary: orders taken, total revenue, payment breakdown, expected cash
- New Inertia pages: `POS/Shift/Open.tsx`, `POS/Shift/Close.tsx`, `POS/Shift/History.tsx`, `POS/Shift/Detail.tsx`
- Guard: only one open shift per cashier at a time
- Dashboard shows active shift status for logged-in cashier

## Impact

- Affected specs: `order-management`, `pos-terminal`, `dashboard`
- Affected code:
    - `routes/web.php` — new shift routes under `/pos/shifts`
    - `app/Http/Controllers/POS/ShiftController.php` — new controller
    - `app/Models/Shift.php` — new model
    - `app/Models/Order.php` — add `shift_id` nullable FK
    - `app/Models/User.php` — add `shifts()` HasMany relationship
    - `resources/js/Pages/POS/` — new shift pages
    - `resources/js/types/index.d.ts` — add `Shift` interface, update `Order`
    - `database/migrations/` — new `create_shifts_table` + `add_shift_id_to_orders_table`
    - `app/Http/Controllers/DashboardController.php` — add active shift status
