## ADDED Requirements

### Requirement: Branch Entity CRUD
The system SHALL allow Admin users to create, list, edit, and deactivate branches via
dedicated admin pages (`/admin/branches`). Each branch SHALL have a `name` (required),
`address` (optional), `phone` (optional), and `is_active` flag.

#### Scenario: Admin creates a new branch
- **WHEN** an Admin submits the Create Branch form with a valid `name`
- **THEN** a new `Branch` record is created with `is_active = true`
- **AND** the Admin is redirected to the branch list with a success flash message

#### Scenario: Admin deactivates a branch
- **WHEN** an Admin toggles `is_active = false` on an existing branch
- **THEN** the branch record is updated and no longer appears as a selectable option for new users
- **AND** existing users assigned to the branch are unaffected

#### Scenario: Cashier attempts to access branch management
- **WHEN** a Cashier navigates to `/admin/branches`
- **THEN** the system returns a `403 Forbidden` response

#### Scenario: Branch name is required
- **WHEN** an Admin submits the Create Branch form without a `name`
- **THEN** a validation error is returned and no branch is created

### Requirement: Branch-Scoped Data Isolation
The system SHALL automatically filter all `Order`, `Shift`, and `User` queries to the
user's assigned branch, unless the acting user is a global Admin (`branch_id = null`).

#### Scenario: Cashier only sees their own branch's orders
- **WHEN** a Cashier with `branch_id = 2` views the POS order history
- **THEN** only orders with `branch_id = 2` are returned
- **AND** orders from other branches are never exposed

#### Scenario: Global Admin sees all branches' data by default
- **WHEN** a global Admin (`branch_id = null`) accesses reports or the dashboard with no
  branch filter active
- **THEN** all branches' data is aggregated and returned
- **AND** no global scope filter is applied to the query

#### Scenario: Branch-scoped Admin sees only their branch
- **WHEN** an Admin with `branch_id = 3` accesses reports
- **THEN** only data from `branch_id = 3` is returned
- **AND** the behaviour is identical to a cashier-level branch filter

### Requirement: Branch Context Session Management
The system SHALL persist the active branch selection in the user's session. Global Admins
SHALL be able to switch between "All Branches" and any specific branch. Non-global users
SHALL always be locked to their assigned branch.

#### Scenario: Global Admin switches to a specific branch
- **WHEN** a global Admin selects "Branch A" from the Branch Switcher dropdown
- **THEN** `session('active_branch_id')` is set to Branch A's ID
- **AND** all subsequent queries are filtered to Branch A until switched again

#### Scenario: Global Admin resets to all-branches view
- **WHEN** a global Admin selects "All Branches" from the Branch Switcher dropdown
- **THEN** `session('active_branch_id')` is set to `null`
- **AND** all subsequent queries return aggregated data across all branches

#### Scenario: Non-global user cannot override branch context
- **WHEN** a cashier or branch-scoped Admin makes a request to switch branches
- **THEN** the system ignores the switch and keeps `session('active_branch_id')` equal to
  the user's assigned `branch_id`

### Requirement: Branch Switcher UI Component
The system SHALL display a Branch Switcher dropdown in the navigation bar for global Admin
users, showing the current active branch and allowing selection of any active branch or
"All Branches".

#### Scenario: Branch Switcher appears in nav for global Admin
- **WHEN** a global Admin views any authenticated page
- **THEN** a Branch Switcher dropdown is visible in the navigation bar
- **AND** it lists all active branches plus an "All Branches" option
- **AND** the currently active selection is highlighted

#### Scenario: Branch Switcher is hidden for cashiers and branch-scoped Admins
- **WHEN** a cashier or branch-scoped Admin views any authenticated page
- **THEN** no Branch Switcher is visible in the navigation bar

### Requirement: Default Branch Seeder and Data Migration
The system SHALL seed a default "Pusat" branch on first setup and assign all existing
`users`, `orders`, and `shifts` records to it with zero data loss.

#### Scenario: Default branch is seeded
- **WHEN** `php artisan db:seed --class=BranchSeeder` is run on a fresh or existing database
- **THEN** a `branches` record with `name = "Pusat"` and `is_active = true` is created (if
  it does not already exist)
- **AND** all existing `users`, `orders`, and `shifts` rows with `branch_id = null` are
  updated to the "Pusat" branch ID

#### Scenario: Seeder is idempotent
- **WHEN** `BranchSeeder` is run twice
- **THEN** only one "Pusat" branch exists
- **AND** no duplicate assignments or errors occur

### Requirement: Branch-Aware Dashboard and Reports
The system SHALL filter all Dashboard KPIs and Report calculations to the active branch
context from the session. Global Admins with no branch filter see aggregated totals.

#### Scenario: Dashboard reflects active branch context
- **WHEN** the Dashboard loads with `active_branch_id = 2` in session
- **THEN** `today_orders`, `today_revenue`, and `low_stock_count` reflect only Branch 2 data

#### Scenario: Reports filtered by active branch
- **WHEN** an Admin runs a date-range report with `active_branch_id = 3` in session
- **THEN** revenue, COGS, and top-sellers reflect only Branch 3 orders

### Requirement: Branch ID on Orders and Shifts
The system SHALL stamp `branch_id` on every new `Order` and `Shift` at creation time,
derived from the creating user's `branch_id` (or the global Admin's active branch session).

#### Scenario: Order is created with branch_id
- **WHEN** a Cashier with `branch_id = 2` creates an order
- **THEN** the order is saved with `branch_id = 2`

#### Scenario: Shift is opened with branch_id
- **WHEN** a Cashier with `branch_id = 2` opens a shift
- **THEN** the shift is saved with `branch_id = 2`
