# audit-trail Specification

## Purpose

The Audit Trail system provides a robust, immutable record of all significant data-changing actions within the FoodPOS application. It ensures accountability, supports forensic investigations, and maintains a history of system state changes by logging who performed what action, when it occurred, and what data was involved (excluding sensitive fields).
## Requirements
### Requirement: Activity Log Record

The system SHALL record an immutable log entry for every significant
data-changing action performed by an authenticated user, capturing
who acted, what changed, and when. Each log entry SHALL also capture
the `branch_id` of the acting user (nullable for global admins and
unauthenticated system events).

#### Scenario: Order is created

- **WHEN** a new order is successfully placed
- **THEN** an `activity_logs` entry is created with `action = order.created`, `model_type = Order`,
  `model_id = order.id`, `user_id = cashier id`, `branch_id = cashier branch_id`,
  `payload = { order_number, total, payment_method }`

#### Scenario: Order is cancelled

- **WHEN** an admin cancels a completed order
- **THEN** an `activity_logs` entry is created with `action = order.cancelled`, `model_type = Order`,
  `model_id = order.id`, `user_id = admin id`, `branch_id = admin branch_id`,
  `payload = { order_number, total }`

#### Scenario: Inventory is manually updated

- **WHEN** an admin updates an inventory record
- **THEN** an `activity_logs` entry is created with `action = inventory.updated`,
  `model_type = Inventory`, `model_id = inventory.id`,
  `payload = { ingredient_name, old_quantity, new_quantity }`

#### Scenario: Ingredient is created, updated, or deleted

- **WHEN** an admin creates, updates, or deletes an ingredient
- **THEN** an `activity_logs` entry is created with the appropriate action
  (`ingredient.created`, `ingredient.updated`, `ingredient.deleted`) and relevant
  field values in payload

#### Scenario: MenuItem is created, updated, or deleted

- **WHEN** an admin creates, updates, or deletes a menu item
- **THEN** an `activity_logs` entry is created with the appropriate action and relevant payload

#### Scenario: User is created, updated, or deleted

- **WHEN** an admin creates, updates, or deletes a user
- **THEN** an `activity_logs` entry is created with appropriate action and payload
- **AND** `password` and `remember_token` fields are NEVER included in the payload

#### Scenario: Unauthenticated action (system event)

- **WHEN** a loggable event occurs with no authenticated user (e.g., a seeder)
- **THEN** the log entry is created with `user_id = null` and `branch_id = null`

### Requirement: Activity Log Immutability

The system SHALL prevent modification or deletion of activity log records
to preserve audit integrity.

#### Scenario: Attempt to update an activity log

- **WHEN** any code attempts to call `update()` on an `ActivityLog` model
- **THEN** the operation is blocked and an exception is thrown

#### Scenario: Attempt to delete an activity log

- **WHEN** any code attempts to call `delete()` on an `ActivityLog` model
- **THEN** the operation is blocked and an exception is thrown

### Requirement: Audit Log Viewer (Admin)

The system SHALL provide an Admin-only paginated view of all activity
log entries, filterable by action type, date range, and optionally by
branch. Global Admins see all branches; branch-scoped Admins see only
their branch's log entries.

#### Scenario: Admin views audit log list

- **WHEN** an Admin navigates to `/admin/audit-log`
- **THEN** the system displays a paginated list of activity log entries (20 per page)
  sorted by `created_at` descending
- **AND** each row shows: timestamp, acting user name, action, affected model type and ID
- **AND** results are filtered by the active branch context (global Admin sees all)

#### Scenario: Admin filters audit log by date range

- **WHEN** an Admin applies a date range filter
- **THEN** only entries within the date range are displayed

#### Scenario: Cashier attempts to access audit log

- **WHEN** a Cashier navigates to `/admin/audit-log`
- **THEN** the system returns a `403 Forbidden` response

