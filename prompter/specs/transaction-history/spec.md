# transaction-history Specification

## Purpose
TBD - created by archiving change add-transaction-history. Update Purpose after archive.
## Requirements
### Requirement: Day-Grouped Transaction Summary List

The system SHALL provide a paginated list of past transaction days, sorted newest-first,
where each day entry displays the date label, total number of completed orders, and total
revenue (sum of `orders.total` for non-cancelled orders) for that date. Only dates with at
least one completed order SHALL appear. All queries SHALL be filtered to the active branch
context from the session.

#### Scenario: Viewing the transaction history page with data

- **WHEN** a user navigates to `GET /pos/history`
- **THEN** the system displays a paginated list of dates (most recent first)
- **AND** each date entry shows: formatted date label, count of completed orders, and total revenue in IDR
- **AND** only dates with at least one completed or cancelled order are listed
- **AND** results are filtered to the user's active branch context

#### Scenario: Viewing the transaction history page with no historical orders

- **WHEN** a user navigates to `GET /pos/history` and there are no orders in the system
  (or no orders for the active branch)
- **THEN** the system displays an empty state message indicating no transaction history is available

#### Scenario: Pagination of day summaries

- **WHEN** the number of distinct order dates exceeds the page size (15 per page)
- **THEN** the system provides pagination controls to navigate between pages of day summaries

### Requirement: Daily Order Drill-Down

The system SHALL provide a view showing all orders for a specific date, displaying each
order's order number, time, items count, total (IDR), payment method, and status. Each
order row SHALL be clickable, navigating to the existing Order Detail page via the
`pos.orders.show` route. Results SHALL be filtered to the active branch context.

#### Scenario: Viewing all orders for a specific date

- **WHEN** a user navigates to `GET /pos/history/{date}` with a valid date (format `YYYY-MM-DD`)
- **THEN** the system displays a paginated table of all orders created on that date (in Asia/Jakarta timezone)
- **AND** each row shows: order number, time, items count, total in IDR, payment method, and status badge
- **AND** each row links to `pos.orders.show` for the corresponding order
- **AND** results are filtered to the active branch context

#### Scenario: Viewing a date with no orders

- **WHEN** a user navigates to `GET /pos/history/{date}` and no orders exist for that date
  (or no orders for the active branch on that date)
- **THEN** the system displays an empty state message for that date with a link back to the
  transaction history list

#### Scenario: Invalid date format in URL

- **WHEN** a user navigates to `GET /pos/history/{date}` with an invalid date string
- **THEN** the system returns a 404 response

#### Scenario: Pagination of daily orders

- **WHEN** a date has more orders than the page size (20 per page)
- **THEN** the system provides pagination controls to navigate between pages of orders for that date

### Requirement: Transaction History Navigation Integration

The system SHALL include a "Transaction History" navigation link in the POS section of
the application's authenticated layout, accessible to both admin and cashier roles.

#### Scenario: Navigation link is visible and functional

- **WHEN** an authenticated user views any POS page
- **THEN** a "Transaction History" link is visible in the POS navigation
- **AND** clicking the link navigates to `GET /pos/history`

#### Scenario: Active state on navigation

- **WHEN** the user is on the Transaction History page or a daily drill-down page
- **THEN** the "Transaction History" nav link is displayed in its active/highlighted state

### Requirement: Backend Transaction History Controller

The system SHALL serve transaction history data via a dedicated `TransactionHistoryController`
with `index` and `show` methods, using Inertia.js responses with the existing `Order` and
`OrderItem` models. All queries SHALL apply the active branch scope.

#### Scenario: Index method returns day-grouped summaries

- **WHEN** the `index` method is called
- **THEN** it returns an Inertia response rendering `POS/TransactionHistory` with paginated day summaries
- **AND** each summary contains: `date` (string, YYYY-MM-DD), `order_count` (integer), `total_revenue` (float)
- **AND** date grouping uses Asia/Jakarta timezone (UTC+7)
- **AND** results are scoped to the active branch

#### Scenario: Show method returns orders for a specific date

- **WHEN** the `show` method is called with a valid date parameter
- **THEN** it returns an Inertia response rendering `POS/TransactionHistoryDay` with paginated orders for that date
- **AND** each order includes eager-loaded `items.menuItem` relationship
- **AND** the response includes a `date` prop for display on the drill-down page
- **AND** results are scoped to the active branch

### Requirement: Timezone-Correct Date Grouping

The system SHALL group orders by their local date in the Asia/Jakarta timezone (UTC+7)
rather than by UTC date, ensuring that orders placed near midnight are attributed to the
correct business day.

#### Scenario: Order near midnight is correctly grouped

- **WHEN** an order is created at 2026-03-02 23:30 WIB (2026-03-02 16:30 UTC)
- **THEN** the order appears under the date entry for 2026-03-02 in the transaction history
- **AND** it does not appear under 2026-03-03

### Requirement: Transaction History Type Definitions

The system SHALL extend the TypeScript type definitions in `@/types` to include a
`DaySummary` interface representing the day-grouped data shape returned by the backend.

#### Scenario: DaySummary type is available for frontend components

- **WHEN** the `TransactionHistory.tsx` or `TransactionHistoryDay.tsx` components are compiled
- **THEN** they can import and use the `DaySummary` type from `@/types`
- **AND** the `DaySummary` type includes: `date` (string), `order_count` (number), `total_revenue` (number)

