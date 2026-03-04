# order-management Specification

## Purpose
TBD - created by archiving change add-refund-void-management. Update Purpose after archive.
## Requirements
### Requirement: Order Void (Cancel Completed Order)

The system SHALL allow an Admin to cancel a completed order, reverting
its status to `cancelled` and restoring ingredient inventory quantities
as defined by the order's recipe BOM at time of cancellation.

#### Scenario: Admin cancels a completed order

- **WHEN** an Admin submits a cancel request for a `completed` order
- **THEN** the order status is set to `cancelled`
- **AND** `cancelled_at` is set to the current timestamp
- **AND** `cancelled_by` is set to the authenticated Admin's `user_id`
- **AND** each ingredient's `quantity_on_hand` is incremented by `(recipe.quantity × order_item.quantity)` for all order items
- **AND** the Admin is redirected to the order detail page with a success flash message

#### Scenario: Cashier attempts to cancel an order

- **WHEN** a Cashier submits a cancel request for any order
- **THEN** the system returns a `403 Forbidden` response
- **AND** the order status remains unchanged

#### Scenario: Admin attempts to cancel an already-cancelled order

- **WHEN** an Admin submits a cancel request for an order with status `cancelled`
- **THEN** the system returns a `422 Unprocessable Entity` response
- **AND** no inventory changes are made

#### Scenario: Cancel operation is atomic

- **WHEN** the cancel transaction encounters an error (e.g., DB failure mid-inventory-restore)
- **THEN** the entire operation is rolled back
- **AND** the order status remains `completed`
- **AND** no partial inventory changes are persisted

### Requirement: Cancelled Order Exclusion from Financials

The system SHALL exclude cancelled orders from all revenue, COGS, and
profit calculations across the Dashboard and Reports.

#### Scenario: Dashboard excludes cancelled orders

- **WHEN** the Dashboard KPIs are calculated for today
- **THEN** orders with status `cancelled` are not counted in `today_orders` or `today_revenue`

#### Scenario: Reports exclude cancelled orders

- **WHEN** a sales report is generated for a date range
- **THEN** orders with status `cancelled` are not included in revenue, COGS, profit, or top-sellers calculations

