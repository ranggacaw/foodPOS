## 1. Backend Foundation

- [x] 1.1 Add `DaySummary` TypeScript interface to `resources/js/types/index.d.ts` (`date: string`, `order_count: number`, `total_revenue: number`)
- [x] 1.2 Create `app/Http/Controllers/POS/TransactionHistoryController.php` with `index()` method that groups orders by `DATE(created_at)` in Asia/Jakarta timezone, returning paginated `DaySummary` data via `Inertia::render('POS/TransactionHistory', ...)`
- [x] 1.3 Add `show(string $date)` method to `TransactionHistoryController` that validates the date format, queries all orders for that date (timezone-aware), eager-loads `items.menuItem`, and returns paginated orders via `Inertia::render('POS/TransactionHistoryDay', ...)`
- [x] 1.4 Register routes in `routes/web.php` inside the POS group: `GET /pos/history` → `TransactionHistoryController@index` (named `pos.history.index`) and `GET /pos/history/{date}` → `TransactionHistoryController@show` (named `pos.history.show`)

## 2. Frontend – Transaction History Day List

- [x] 2.1 Create `resources/js/Pages/POS/TransactionHistory.tsx` — parent page displaying the paginated day-grouped summary list (date, order count, revenue in IDR) with each date row clickable to navigate to `pos.history.show`
- [x] 2.2 Implement empty state (no historical orders) with illustration and a "Go to POS" link
- [x] 2.3 Implement pagination controls matching existing `History.tsx` pattern

## 3. Frontend – Daily Order Drill-Down

- [x] 3.1 Create `resources/js/Pages/POS/TransactionHistoryDay.tsx` — orders table for a single date (order number, time, items count, total IDR, payment method, status badge)
- [x] 3.2 Each order row links to `pos.orders.show` (existing `OrderDetail.tsx`)
- [x] 3.3 Include breadcrumb or back-link to the parent Transaction History list
- [x] 3.4 Implement empty state for a date with no orders, with link back to history
- [x] 3.5 Implement pagination controls for daily orders

## 4. Navigation Integration

- [x] 4.1 Add "Transaction History" nav link in `AuthenticatedLayout.tsx` POS section (both desktop and mobile navigation), with active state when on `pos.history.*` routes

## 5. Validation & Polish

- [x] 5.1 Verify IDR currency formatting matches existing patterns (`Intl.NumberFormat 'id-ID'`)
- [x] 5.2 Verify timezone-correct grouping with orders near midnight WIB
- [x] 5.3 Verify pagination works correctly at both levels (day list ≥15, daily orders ≥20)
- [x] 5.4 Verify clickthrough: history → day → order detail → back navigation all work
- [x] 5.5 Verify empty states render correctly for both views
- [x] 5.6 Verify no regressions to existing `History.tsx` or `OrderDetail.tsx`

## Post-Implementation

- [x] Update AGENTS.md in the project root for new changes in this specs
