## ADDED Requirements

### Requirement: Inventory Transfer Request
The system SHALL allow an Admin or branch-scoped Admin to create an inventory transfer
request from one branch to another, specifying the ingredient, quantity, and destination.

#### Scenario: Admin creates a transfer request
- **WHEN** an Admin submits a transfer request form with valid `from_branch_id`,
  `to_branch_id`, `ingredient_id`, and `quantity` (> 0)
- **THEN** an `inventory_transfers` record is created with `status = pending`,
  `requested_by = auth user id`
- **AND** no inventory quantities are changed at this stage
- **AND** the Admin is redirected to the transfer list with a success flash message

#### Scenario: Transfer quantity must be positive
- **WHEN** an Admin submits a transfer request with `quantity = 0` or a negative value
- **THEN** a validation error is returned and no record is created

#### Scenario: From and to branch must differ
- **WHEN** an Admin submits a transfer request with `from_branch_id == to_branch_id`
- **THEN** a validation error is returned

### Requirement: Inventory Transfer Approval / Rejection
The system SHALL allow an Admin to approve or reject a pending inventory transfer request.
Approval SHALL atomically deduct from the source branch and credit the destination branch.

#### Scenario: Admin approves a transfer request
- **WHEN** an Admin approves a `pending` transfer
- **THEN** the transfer status is set to `approved`, `approved_by = admin user id`,
  `approved_at = now()`
- **AND** `inventory.quantity_on_hand` at `from_branch` is decremented by the transfer quantity
- **AND** `inventory.quantity_on_hand` at `to_branch` is incremented by the transfer quantity
- **AND** the entire operation is performed inside a `DB::transaction`

#### Scenario: Approval fails if inventory does not exist at source branch
- **WHEN** the source branch has no inventory record for the ingredient
- **THEN** a `422 Unprocessable Entity` error is returned
- **AND** no inventory changes are made

#### Scenario: Admin rejects a transfer request
- **WHEN** an Admin rejects a `pending` transfer
- **THEN** the transfer status is set to `rejected`, `rejected_by = admin user id`,
  `rejected_at = now()`
- **AND** no inventory quantities are changed

#### Scenario: Already-processed transfer cannot be re-approved or re-rejected
- **WHEN** an Admin attempts to approve or reject a transfer with status `approved` or
  `rejected`
- **THEN** the system returns a `422 Unprocessable Entity` response
- **AND** no changes are made

### Requirement: Inventory Transfer History View
The system SHALL display a paginated list of all inventory transfer records per branch,
showing request details, current status, and requester/approver information.

#### Scenario: Admin views transfer history for a branch
- **WHEN** an Admin navigates to `/admin/inventory-transfers`
- **THEN** the system displays a paginated list of all transfer records, sorted by
  `created_at` descending
- **AND** each row shows: date, from branch, to branch, ingredient, quantity, status,
  requested by, approved/rejected by

#### Scenario: Branch-scoped Admin sees only their branch's transfers
- **WHEN** a branch-scoped Admin views the transfer history
- **THEN** only transfers where `from_branch_id` or `to_branch_id` matches their
  `branch_id` are shown
