# 🧠 Epic: Transaction History – Daily View with Drill-Down Detail

## 🎯 Epic Goal

We need to build a **Transaction History** page that groups completed orders by day and allows cashiers/admins to drill down into each order's line items, in order for **cashiers and managers** to **review, audit, and track sales activity across any date with full transaction detail**.

---

## 🚀 Definition of Done

- [ ] The Transaction History page displays a list of past transaction days, sorted newest first
- [ ] Each day entry shows a summary (date label, total transactions count, daily revenue total)
- [ ] Clicking a day expands or navigates to a list of all orders placed on that day (order number, time, payment method, status, total)
- [ ] Each order row in the daily list is clickable and navigates to the existing Order Detail page (`/pos/orders/{id}`)
- [ ] The order detail page shows all line items (menu name, qty, unit price, subtotal), payment info, cashier, and order status
- [ ] The page handles empty states gracefully (no transactions for a given day)
- [ ] Pagination or infinite scroll is applied if the number of days or daily orders is large
- [ ] The feature is accessible via the existing POS navigation menu
- [ ] All data is served via an Inertia.js controller using the existing `Order` + `OrderItem` models
- [ ] The UI matches the existing POS design system (Tailwind CSS, Inertia/React, IDR currency formatting)

---

## 📌 High-Level Scope (Included)

- **Day-grouped Transaction List**: A parent view listing all days that have at least one order. Each day row shows: date, number of orders, total revenue for the day, and an expand/navigate action.
- **Daily Order List**: When a day is selected, render all `Order` records for that date as a table (order number, time, items count, total IDR, payment method, status). Each row is clickable.
- **Order Detail Drill-Down**: Clicking an order row navigates to the existing `OrderDetail.tsx` page, which shows full line items via `pos.orders.show` route — no new detail page needed.
- **Backend Controller / Route**: A new `TransactionHistoryController` (or extension of `OrderController`) with an `index` method that groups orders by `DATE(created_at)` and returns paginated day summaries; plus a `byDate` method returning all orders for a specific date.
- **Navigation Integration**: Add a "Transaction History" link to the POS sidebar/nav.
- **Empty & Loading States**: Skeleton loaders and empty-day illustration.

---

## ❌ Out of Scope

- Editing or modifying past transactions from the history view
- Exporting transaction history to CSV/PDF (separate Epic)
- Filtering by cashier, payment method, or status from this view (can be a follow-up)
- Real-time / live updates to the history list
- Admin-role-only access control changes (assumes existing auth)

---

## 📁 Deliverables

| #   | Deliverable                                        | Notes                                                                              |
| --- | -------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 1   | `TransactionHistoryController.php`                 | `index()` returns day-grouped summaries; `show(date)` returns orders for that date |
| 2   | `resources/js/Pages/POS/TransactionHistory.tsx`    | Parent page – day list view                                                        |
| 3   | `resources/js/Pages/POS/TransactionHistoryDay.tsx` | Day drill-down – orders list for a single date                                     |
| 4   | Backend route additions in `routes/web.php`        | `GET /pos/history` and `GET /pos/history/{date}`                                   |
| 5   | Navigation link update                             | Add "Transaction History" to POS nav menu                                          |
| 6   | Inertia shared types update                        | Extend `@/types` if new data shapes are needed                                     |

---

## 🧩 Dependencies

- Existing `Order` model with `items()`, `cashier()`, and `shift()` relationships (`app/Models/Order.php`)
- Existing `OrderDetail.tsx` page and `pos.orders.show` named route — used for the final drill-down
- Existing `AuthenticatedLayout` and POS navigation structure
- Inertia.js + React stack already configured
- IDR currency formatter (`Intl.NumberFormat 'id-ID'`) already established in `History.tsx`

---

## ⚠️ Risks / Assumptions

- **Assumption**: The existing `History.tsx` page only shows _today's_ orders. The new Transaction History feature should replace or complement it with a multi-day view — clarify with stakeholder whether to replace or add a new route.
- **Assumption**: "Transaction" is synonymous with "Order" in this project context.
- **Risk**: If there are thousands of past orders, day-level grouping queries may be slow — consider adding a DB index on `orders.created_at` if not already present.
- **Assumption**: Only `completed` and `cancelled` orders are shown in history (not `pending` in-progress orders) — confirm business rule.
- **Risk**: Date timezone handling — the server may store UTC while the POS operates in `Asia/Jakarta` (WIB, UTC+7). Grouping must account for local date conversion.

---

## 🎯 Success Metrics

- Cashier/admin can navigate to Transaction History and see all past days within **< 2 seconds** page load on LAN
- Clicking any day loads that day's orders within **< 1 second**
- Clicking any order opens the Order Detail page with correct line items
- Zero regressions to the existing POS `Index.tsx` or today's `History.tsx` flow
- All transaction totals per day are arithmetically correct (sum of `orders.total` for that date)
