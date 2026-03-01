## 1. Database

- [x] 1.1 Create migration: `create_activity_logs_table` with columns: `id`, `user_id` (nullable FK → users, nullOnDelete), `action` (string, indexed), `model_type` (string), `model_id` (unsignedBigInteger), `payload` (JSON, nullable), `ip_address` (string, nullable), `created_at` (timestamp only — no `updated_at`)

## 2. Backend — Model & Service

- [x] 2.1 Create `App\Models\ActivityLog` with: `$fillable`, `UPDATED_AT = null` (immutable), `belongsTo(User)` , and override `save()`/`delete()` to throw `RuntimeException` if called on existing record
- [x] 2.2 Create `App\Services\AuditLogger` with a static `log(string $action, ?Model $model = null, array $payload = [], ?int $userId = null): void` method that creates an `ActivityLog` entry, capturing `auth()->id()` as default user, and `request()->ip()` when a request context is available

## 3. Backend — Observers

- [x] 3.1 Create `App\Observers\OrderObserver`: fire `order.created` on `created`, `order.cancelled` on `updated` (when `status` changes to `cancelled`)
- [x] 3.2 Create `App\Observers\InventoryObserver`: fire `inventory.updated` on `updated` with `old_quantity` / `new_quantity` in payload (use `$model->getOriginal()`)
- [x] 3.3 Create `App\Observers\IngredientObserver`: fire `ingredient.created/updated/deleted` on respective events
- [x] 3.4 Create `App\Observers\MenuItemObserver`: fire `menu-item.created/updated/deleted`
- [x] 3.5 Create `App\Observers\UserObserver`: fire `user.created/updated/deleted`; strip `password` and `remember_token` from payload
- [x] 3.6 Register all observers in `AppServiceProvider::boot()`

## 4. Backend — Controller & Routes

- [x] 4.1 Create `App\Http\Controllers\Admin\AuditLogController` with `index(Request $request)`: paginate `ActivityLog` (20/page), support `from`/`to` date filter and `action` filter, eager-load `user:id,name`
- [x] 4.2 Add route: `GET /admin/audit-log` → `AuditLogController@index` under `role:admin` middleware group

## 5. Frontend

- [x] 5.1 Add `ActivityLog` TypeScript interface to `resources/js/types/index.d.ts`
- [x] 5.2 Create `Pages/Admin/AuditLog/Index.tsx` — paginated table with columns: timestamp, user, action, model, payload summary; date range filter; action type filter

## 6. Validation

- [x] 6.1 Write feature test: placing an order creates an `activity_logs` entry with `action = order.created`
- [x] 6.2 Write feature test: cancelling an order creates an `activity_logs` entry with `action = order.cancelled`
- [x] 6.3 Write feature test: updating inventory creates a log with old/new quantities in payload
- [x] 6.4 Write feature test: creating a user logs the event and payload does NOT contain `password`
- [x] 6.5 Write feature test: Admin can access `/admin/audit-log` → 200
- [x] 6.6 Write feature test: Cashier cannot access `/admin/audit-log` → 403

## Post-Implementation

- [x] Update `AGENTS.md` to document the audit trail, `activity_logs` table schema, `AuditLogger` service, and new admin route
