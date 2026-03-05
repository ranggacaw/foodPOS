## 1. Database Schema
- [x] 1.1 Create migration `create_branches_table`:
      `id, name (string), address (text nullable), phone (string nullable), is_active (boolean default true), timestamps`
- [x] 1.2 Create migration `add_branch_id_to_users_table`:
      `branch_id (unsignedBigInteger nullable, FK → branches.id, onDelete SET NULL)`
- [x] 1.3 Create migration `add_branch_id_to_orders_table`:
      `branch_id (unsignedBigInteger nullable, FK → branches.id, onDelete SET NULL)`
- [x] 1.4 Create migration `add_branch_id_to_shifts_table`:
      `branch_id (unsignedBigInteger nullable, FK → branches.id, onDelete SET NULL)`
- [x] 1.5 Create migration `add_branch_id_to_activity_logs_table`:
      `branch_id (unsignedBigInteger nullable, no FK — log is immutable)`
- [x] 1.6 Run `php artisan migrate` and verify new columns exist

## 2. Branch Model and Seeder
- [x] 2.1 Create `app/Models/Branch.php` with `$fillable`, `casts()`, and
      `users()`, `orders()`, `shifts()` hasMany relationships
- [x] 2.2 Create `database/seeders/BranchSeeder.php`:
      - `firstOrCreate(['name' => 'Pusat'], [...])` to create the default branch
      - `UPDATE users/orders/shifts SET branch_id = X WHERE branch_id IS NULL`
- [x] 2.3 Register `BranchSeeder` in `DatabaseSeeder`
- [x] 2.4 Run `php artisan db:seed --class=BranchSeeder` and verify all existing records
      have `branch_id` set

## 3. Branch Context Infrastructure
- [x] 3.1 Create `app/Services/BranchContext.php` (static helper):
      `static setActiveBranchId(int|null $id)`, `static getActiveBranchId(): int|null`
      backed by `session('active_branch_id')`
- [x] 3.2 Create `app/Http/Middleware/SetBranchContext.php`:
      - If user is global admin (`branch_id = null`): read from session (may be null)
      - Otherwise: lock to user's `branch_id`, ignore session override
      - Register in `bootstrap/app.php` inside the `auth` middleware group
- [x] 3.3 Create `app/Models/Scopes/BranchScope.php` implementing `Scope`:
      - Applies `->where('branch_id', BranchContext::getActiveBranchId())` when not null
- [x] 3.4 Register `BranchScope` in `booted()` of `Order`, `Shift`, `User` models
- [x] 3.5 Update `app/Http/Middleware/HandleInertiaRequests.php` to share `branches`
      (all active branches) and `active_branch_id` (from session) in `share()`

## 4. Branch Controller and Routes
- [x] 4.1 Create `app/Http/Controllers/Admin/BranchController.php` with
      `index`, `create`, `store`, `edit`, `update` methods (no delete — deactivate only)
- [x] 4.2 Add `Route::resource('branches', BranchController::class)->except(['show', 'destroy'])`
      inside the `admin` route group in `routes/web.php`
- [x] 4.3 Add branch switch route:
      `Route::post('branches/switch', [BranchController::class, 'switch'])->name('branches.switch')`
      — updates `session('active_branch_id')`; returns redirect back

## 5. Branch CRUD Frontend Pages
- [x] 5.1 Create `resources/js/Pages/Admin/Branches/Index.tsx` — paginated branch list
      with name, status, edit action; deactivate toggle button
- [x] 5.2 Create `resources/js/Pages/Admin/Branches/Create.tsx` — form: name, address,
      phone, is_active
- [x] 5.3 Create `resources/js/Pages/Admin/Branches/Edit.tsx` — same fields, pre-filled
- [x] 5.4 Create `resources/js/Components/BranchSwitcher.tsx`:
      - Reads `branches` and `active_branch_id` from `usePage<PageProps>().props`
      - Renders a dropdown: "All Branches" + each active branch
      - On selection, submits `POST /admin/branches/switch` via Inertia `router.post`
      - Visible only when `user.role === 'admin' && user.branch_id === null`
- [x] 5.5 Mount `<BranchSwitcher />` in `AuthenticatedLayout.tsx` nav bar

## 6. TypeScript Types
- [x] 6.1 Add `Branch` interface to `resources/js/types/index.d.ts`
- [x] 6.2 Add `branch_id: number | null` to `User`, `Order`, `Shift` interfaces
- [x] 6.3 Add `branches?: Branch[]` and `active_branch_id?: number | null` to `PageProps`

## 7. Branch-Aware Query Updates
- [x] 7.1 `DashboardController`: remove manual filters; let `BranchScope` handle scoping;
      add `->withoutGlobalScope(BranchScope::class)` for global-admin totals
- [x] 7.2 `ReportController`: same pattern — rely on scope for branch context;
      use `withoutGlobalScope` for all-branches report
- [x] 7.3 `TransactionHistoryController`: scope is applied automatically; verify no raw
      `DB::` queries bypass the scope
- [x] 7.4 `AuditLogController`: add `branch_id` filter based on active branch context
      (ActivityLog is not Eloquent-scoped because it is append-only; filter manually)
- [x] 7.5 `OrderController.store()`: stamp `branch_id = $user->branch_id ?? BranchContext::getActiveBranchId()`
      on the new order
- [x] 7.6 `ShiftController.store()`: stamp `branch_id` similarly

## 8. Order Void Branch Guard
- [x] 8.1 `CancelOrderController`: verify the cancelling admin's branch scope matches the
      order's `branch_id` (or is global admin) before allowing cancellation

## 9. Navigation Update
- [x] 9.1 Add "Branches" nav link in `AuthenticatedLayout.tsx` admin section pointing to
      `admin.branches.index`

## 10. Verification
- [x] 10.1 Run `php artisan test` — all existing tests must pass
- [ ] 10.2 Manually verify: cashier in Branch 1 cannot see orders from Branch 2
- [ ] 10.3 Manually verify: global admin with "All Branches" sees aggregated data
- [x] 10.4 Manually verify: BranchSeeder is idempotent (run twice, no duplicates)
- [x] 10.5 Run `npm run build` — no TypeScript errors

## Post-Implementation
- [x] Update `AGENTS.md` in the project root to reflect:
      - New `Branch` entity and `branches` table
      - New `manager` semantics (admin with branch_id set)
      - `BranchScope` global scope convention
      - `branch_id` on users, orders, shifts, activity_logs
