# Change: Add Multi-Branch Management (Phase 2 of PWA & Branch Epic)

## Why
The company operates multiple restaurant branches and needs data isolation between them.
Transactions, shifts, inventory, and reports must be scoped to a specific branch so that
Branch A's staff cannot see Branch B's data. Admins require a global view across all branches
for consolidated reporting. This change introduces the `branches` entity, branch-scoping
middleware, and all related CRUD and UI updates.

## What Changes
- **BREAKING** (schema): New `branches` migration; `branch_id` FK added to `users`, `orders`,
  `shifts` tables via additive migrations
- `Branch` model, `BranchController`, and resource routes under `admin.branches.*`
- `BranchScope` global Eloquent scope applied to `User`, `Order`, `Shift` models for
  automatic branch filtering
- `SetBranchContext` middleware stores the active branch in the session; bypassed for Admin
  global view
- Admin role extended: users with `role = admin` may have `branch_id = null` (global admin)
  or a non-null `branch_id` (branch-scoped admin acting as branch manager)
- Branch CRUD pages (Admin only): `Admin/Branches/Index`, `Create`, `Edit`
- Branch Switcher dropdown component added to `AuthenticatedLayout.tsx` (Admin only)
- Dashboard and Report queries updated to filter by active branch context from session
- `BranchSeeder`: creates "Pusat" (main branch) and assigns all existing `users`, `orders`,
  `shifts` records to it
- TypeScript types updated: `Branch` interface, `User.branch_id`, `Order.branch_id`,
  `Shift.branch_id`, `PageProps.branches`

## Impact
- Affected specs:
  - `branch-management` (new)
  - `cashier-shift-management` (MODIFIED — shifts are now branch-scoped)
  - `order-management` (MODIFIED — orders are now branch-scoped)
  - `transaction-history` (MODIFIED — history filtered by branch context)
  - `audit-trail` (MODIFIED — log entries tagged with branch_id)
- Affected code (backend):
  - New migration files (×3)
  - `app/Models/Branch.php` (new)
  - `app/Models/User.php`, `Order.php`, `Shift.php` — `branch_id` fillable/cast + scope
  - `app/Http/Controllers/Admin/BranchController.php` (new)
  - `app/Http/Middleware/SetBranchContext.php` (new)
  - `app/Http/Controllers/DashboardController.php` — branch-aware queries
  - `app/Http/Controllers/Admin/ReportController.php` — branch-aware queries
  - `app/Http/Controllers/POS/TransactionHistoryController.php` — branch filter
  - `database/seeders/BranchSeeder.php` (new)
  - `routes/web.php` — branch resource route
- Affected code (frontend):
  - `resources/js/types/index.d.ts` — new `Branch` type; updated `User`, `Order`, `Shift`
  - `resources/js/Layouts/AuthenticatedLayout.tsx` — branch switcher
  - `resources/js/Pages/Admin/Branches/` (new: Index, Create, Edit)
  - `resources/js/Components/BranchSwitcher.tsx` (new)

## Pre-implementation Risks
- **BREAKING**: Adding non-nullable `branch_id` to existing tables with data will fail.
  Must use nullable FK + seeder to backfill before potentially making non-nullable in a
  follow-up migration.
- Global admin bypass: Eloquent global scopes must be explicitly removed for Admin users
  with `branch_id = null` to prevent data leakage.
- `HandleInertiaRequests.php` shared data must expose `branches` and `active_branch_id`
  so the branch switcher component can render without extra HTTP calls.
