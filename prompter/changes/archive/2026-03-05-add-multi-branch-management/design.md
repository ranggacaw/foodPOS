## Context
FoodPOS currently has a single-tenant data model with no branch concept. The `users`, `orders`,
and `shifts` tables have no `branch_id` column. Admin users have full visibility into all data;
cashiers are not filtered by branch. The existing `role` enum on `users` is `admin | cashier`.

## Goals / Non-Goals
- Goals: branch data isolation for cashiers and branch-scoped admins; global view for
  null-branch admins; Branch CRUD; branch switcher in nav; zero data loss migration
- Non-Goals: per-branch menu/pricing overrides; cross-branch user assignment; branch-level
  billing/accounting

## Decisions

### Decision: Admin with branch_id = null is the global admin; branch_id set = branch manager
Rather than adding a third role value (`manager`), we extend the semantics of the `admin` role:
- `role = admin, branch_id = null` → global admin (full visibility, can switch between branches)
- `role = admin, branch_id = <id>` → branch-scoped admin (sees only their branch; acts as manager)
- `role = cashier, branch_id = <id>` → cashier (POS only, scoped to their branch)

This avoids a schema-breaking role enum modification and keeps middleware logic simple:
`BranchScope` checks `auth()->user()->branch_id`; if null, no scope is applied (global view).

Alternatives considered:
- New `manager` role — requires migrating the `role` enum (risk: raw SQL `MODIFY COLUMN` on
  MySQL, skip on SQLite as seen in existing migrations), plus updating all middleware checks.
- Separate permission table — over-engineered for this scale.

### Decision: Eloquent global scope on Order, Shift, User (not middleware-level filtering)
A `BranchScope` global scope is registered in each model's `booted()` method. It reads the
active branch ID from the session (via a static `BranchContext` helper). Global admins
bypass the scope via `->withoutGlobalScope(BranchScope::class)` explicitly in controllers
that need cross-branch aggregation (e.g., reports, dashboard global view).

Alternatives considered:
- Middleware that modifies the query builder globally — fragile, affects every query
  including joins and eager loads.
- Controller-level `->where('branch_id', ...)` — easy to forget; no safety net.

### Decision: branch_id FK is nullable in migration; backfilled by BranchSeeder before any constraint
All three `branch_id` columns start as `nullable()`. The `BranchSeeder` runs the "Pusat" seed
and backfills existing rows immediately. A follow-up migration (outside this change's scope)
can make the columns non-nullable once all records are confirmed populated.

### Decision: Active branch stored in session, exposed via HandleInertiaRequests shared data
`SetBranchContext` middleware (applied to `auth` group) reads/writes `session('active_branch_id')`.
`HandleInertiaRequests::share()` includes `branches` (array of all active branches for the
switcher dropdown) and `active_branch_id` in the global Inertia props. This keeps the
branch switcher component stateless and avoids a dedicated API call.

## Risks / Trade-offs
- Global scope bypass: every admin-facing aggregation query must explicitly call
  `withoutGlobalScope` or it will accidentally be scoped. Document this as a coding convention.
- BranchSeeder order: must run after the migration that creates the `branches` table and before
  the FK columns are populated. `DatabaseSeeder` orchestration matters.
- Vite casing: new `Pages/Admin/Branches/` directory must match exactly on case-sensitive
  file systems (Linux production). Use PascalCase for all new filenames.

## Migration Plan
1. Migration A: `create_branches_table`
2. Migration B: `add_branch_id_to_users_table` (nullable FK)
3. Migration C: `add_branch_id_to_orders_table` (nullable FK)
4. Migration D: `add_branch_id_to_shifts_table` (nullable FK)
5. `BranchSeeder`: INSERT "Pusat" branch, UPDATE all existing users/orders/shifts to set branch_id
6. Register `BranchScope` in models
7. Add middleware, controllers, routes, frontend pages

Rollback: drop the four new columns (migrations down) and remove the `branches` table.
No data loss on rollback because branch_id is nullable and backfilled data is non-critical metadata.

## Open Questions
- Should "Pusat" (Main Branch) be hardcoded in the seeder, or should the first admin user be
  prompted to name the default branch during setup?
- Should the branch switcher be persistent across sessions, or reset to "All Branches" on login?
