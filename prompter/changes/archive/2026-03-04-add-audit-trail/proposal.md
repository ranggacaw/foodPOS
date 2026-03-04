# Change: Add Audit Trail

## Why

No record currently exists of who changed what and when. For a financial system handling orders, inventory, and user accounts, this is a high-severity gap — it makes it impossible to investigate discrepancies, detect tampering, or satisfy basic operational accountability requirements.

## What Changes

- New `activity_logs` table: `id`, `user_id` (nullable), `action` (string), `model_type`, `model_id`, `payload` (JSON — before/after or relevant context), `ip_address`, `created_at`
- New `ActivityLog` Eloquent model (no `updated_at` — logs are immutable)
- New `AuditLogger` service class (`App\Services\AuditLogger`) with static `log()` helper
- Log the following events automatically via Model Observers or explicit calls:
    - **Order created** (`order.created`) — who, order number, total, payment method
    - **Order cancelled** (`order.cancelled`) — who cancelled, which order
    - **Inventory updated** (manual stock edit) (`inventory.updated`) — ingredient, old qty, new qty
    - **Ingredient created/updated/deleted** — admin action with field values
    - **MenuItem created/updated/deleted** — admin action
    - **User created/updated/deleted** — admin action (password field excluded from payload)
- New admin page `GET /admin/audit-log` — paginated, filterable log list (admin-only)
- `AuditLogController` under `App\Http\Controllers\Admin\`
- No sensitive data in payload (password, remember_token always stripped)

## Impact

- Affected specs: `audit-trail` (new capability)
- Affected code:
    - `routes/web.php` — add `GET /admin/audit-log` route
    - `app/Http/Controllers/Admin/AuditLogController.php` — new controller
    - `app/Models/ActivityLog.php` — new model
    - `app/Services/AuditLogger.php` — new service
    - `app/Observers/` — new observers for Order, Inventory, Ingredient, MenuItem, User
    - `app/Providers/AppServiceProvider.php` — register observers
    - `resources/js/Pages/Admin/AuditLog/Index.tsx` — new admin page
    - `resources/js/types/index.d.ts` — add `ActivityLog` interface
    - `database/migrations/` — new `create_activity_logs_table`
