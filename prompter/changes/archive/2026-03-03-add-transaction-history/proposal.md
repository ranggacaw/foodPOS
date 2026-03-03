# Change: Add Transaction History – Daily View with Drill-Down Detail

## Why

The existing `History.tsx` page only shows the current **cashier's orders for today**. There is no way for cashiers or managers to review, audit, or track sales activity across past dates. This creates a gap in operational visibility and daily reconciliation workflows.

## What Changes

- **New controller**: `TransactionHistoryController` with `index()` (day-grouped summary list) and `show(date)` (orders for a specific date)
- **New routes**: `GET /pos/history` → day-grouped summary page; `GET /pos/history/{date}` → orders for a single date
- **New frontend page**: `TransactionHistory.tsx` – parent view listing all days with at least one order (date, order count, daily revenue)
- **New frontend page**: `TransactionHistoryDay.tsx` – daily drill-down showing all orders for a selected date, with clickable rows navigating to existing `OrderDetail.tsx`
- **New TypeScript type**: `DaySummary` interface added to `@/types` for the day-grouped data shape
- **Navigation update**: Add "Transaction History" link to POS sidebar alongside existing "Order History"
- **Empty & loading states**: Skeleton loaders and empty-state illustrations for both views

## Impact

- Affected specs: `transaction-history` (new capability)
- Affected code:
    - `app/Http/Controllers/POS/TransactionHistoryController.php` (new)
    - `routes/web.php` (2 new routes in POS group)
    - `resources/js/Pages/POS/TransactionHistory.tsx` (new)
    - `resources/js/Pages/POS/TransactionHistoryDay.tsx` (new)
    - `resources/js/types/index.d.ts` (new `DaySummary` type)
    - `resources/js/Layouts/AuthenticatedLayout.tsx` (nav link addition)
- No breaking changes to existing pages or APIs
- Existing `History.tsx` (today's orders) and `OrderDetail.tsx` remain unchanged
