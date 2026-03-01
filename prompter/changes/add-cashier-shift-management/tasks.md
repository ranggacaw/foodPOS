## 1. Database

- [x] 1.1 Create migration: `create_shifts_table` with columns: `id`, `user_id` (FK → users), `opening_cash` (DECIMAL 12,2), `closing_cash` (nullable DECIMAL 12,2), `notes` (nullable text), `status` (enum: `open`,`closed`, default `open`), `opened_at` (timestamp), `closed_at` (nullable timestamp), `timestamps()`
- [x] 1.2 Create migration: `add_shift_id_to_orders_table` — nullable FK `shift_id` → `shifts.id` (nullOnDelete)

## 2. Backend — Models

- [x] 2.1 Create `App\Models\Shift` model with `$fillable`, `casts()` (decimals + timestamps), `belongsTo(User)`, `hasMany(Order)`
- [x] 2.2 Add `shifts()` HasMany relationship to `User` model
- [x] 2.3 Add `shift()` BelongsTo relationship and `shift_id` to `Order::$fillable`
- [x] 2.4 Add helpers to `Shift`: `isOpen(): bool`, `expectedClosingCash(): float` (opening_cash + sum of cash orders)

## 3. Backend — Controller & Routes

- [x] 3.1 Create `App\Http\Controllers\POS\ShiftController` with: `create()`, `store()`, `close()`, `update()`, `index()`, `show()`
- [x] 3.2 `store()`: validate one open shift per user; create shift; redirect to POS terminal
- [x] 3.3 `update()` (close): validate ownership or admin role; set `closed_at`, `closing_cash`, `notes`, `status = closed`; redirect to shift detail
- [x] 3.4 Add routes under `pos` middleware group: `GET /pos/shifts`, `POST /pos/shifts`, `GET /pos/shifts/{shift}`, `PATCH /pos/shifts/{shift}/close`
- [x] 3.5 Update `OrderController::store()` to auto-attach the current user's active shift via `$shift_id = auth()->user()->shifts()->where('status','open')->value('id')`
- [x] 3.6 Update `DashboardController` to pass active shift status for logged-in cashier

## 4. Frontend

- [x] 4.1 Add `Shift` TypeScript interface in `resources/js/types/index.d.ts`; update `Order` interface to include `shift_id`
- [x] 4.2 Create `POS/Shift/Open.tsx` — form with `opening_cash` field and "Start Shift" submit button
- [x] 4.3 Create `POS/Shift/Close.tsx` — shows shift summary, `closing_cash`, `notes` fields, "Close Shift" button
- [x] 4.4 Create `POS/Shift/History.tsx` — paginated shift list (own shifts for cashier, all for admin)
- [x] 4.5 Create `POS/Shift/Detail.tsx` — shift summary: orders, revenue, payment breakdown, expected vs actual cash
- [x] 4.6 Add "My Shift" link to `AuthenticatedLayout.tsx` navigation

## 5. Validation

- [x] 5.1 Write feature test: Cashier opens shift → shift record created with `status = open`
- [x] 5.2 Write feature test: Cashier opens second shift while one is already open → 422
- [x] 5.3 Write feature test: Cashier closes their own shift → `status = closed`, `closed_at` set
- [x] 5.4 Write feature test: Cashier cannot close another cashier's shift → 403
- [x] 5.5 Write feature test: Order placed during open shift → `shift_id` is populated
- [x] 5.6 Write feature test: Order placed with no open shift → `shift_id` is null, no error

## Post-Implementation

- [x] Update `AGENTS.md` to reflect new `shifts` table, `shift_id` on orders, shift routes, and updated permission matrix
