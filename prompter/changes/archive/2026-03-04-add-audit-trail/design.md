## Context

The current system has zero audit logging. Any data change (orders, inventory,
users, menu) is untracked. This is a high-severity risk for a financial POS:
discrepancies cannot be investigated, tampering cannot be detected, and
regulatory accountability (even informal) is impossible.

## Goals / Non-Goals

- **Goals:**
    - Log all financially relevant data changes with actor, timestamp, and context
    - Guarantee log immutability (no editing or deleting entries)
    - Provide an admin-only log viewer with basic filtering
    - Keep implementation simple and low-overhead (no external log service)

- **Non-Goals:**
    - No real-time alerting or notifications on suspicious activity
    - No log export to external SIEM
    - No row-level access control on individual log entries
    - No retention policy / automatic archiving (logs grow indefinitely — acceptable at this scale)

## Decisions

- **Single `activity_logs` table, not per-model tables:** Simpler to query,
  fewer migrations, and sufficient for the expected log volume of a single
  restaurant outlet.

- **`AuditLogger` service class (static `log()`):** Easy to call from observers,
  controllers, or anywhere in the app without DI setup. Returns void — failures
  are logged to the Laravel log channel but do NOT throw exceptions to callers
  (audit failure must not break the primary operation).

- **Eloquent Observers for automatic capture:** Observers are the cleanest
  hook point — they fire on model events without polluting controller code.
  Manual `AuditLogger::log()` calls are used where context (e.g., old vs new values)
  isn't available from observer alone (e.g., inventory update with old qty).

- **`payload` as JSON:** Flexible — each event type can store different context.
  No rigid schema per event. Downside: no structured querying, but the admin
  viewer only needs to display the payload, not query inside it.

- **Immutability enforced at model level:** Override `save()` and `delete()` to
  throw `RuntimeException` when called on an existing record (`$this->exists === true`).
  This is a PHP-level guard; DB-level constraints (e.g., no UPDATE privilege) are
  not configured since we use a shared DB user.

- **No `updated_at` column:** `$model::UPDATED_AT = null` signals to Eloquent
  not to manage this column. Reinforces immutability.

## Risks / Trade-offs

- **Observer performance:** Each model event creates a DB write to `activity_logs`.
  At <1k users/day this is negligible. If volume grows, a queue-based async logger
  can be swapped in without changing call sites.
- **Payload is not schema-validated:** Wrong fields in payload are silently stored.
  Conventions documented in this design doc; enforced by code review.

## Migration Plan

Single additive migration — new table only. No changes to existing tables.
Zero risk to existing data.

```sql
CREATE TABLE activity_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  action VARCHAR(100) NOT NULL,
  model_type VARCHAR(100) NOT NULL,
  model_id BIGINT UNSIGNED NOT NULL,
  payload JSON NULL,
  ip_address VARCHAR(45) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
);
```

## Open Questions

- Should the audit log also capture READ access (e.g., "Admin viewed the report")? →
  **Recommendation:** No for MVP. Read-access logging is expensive and low-value
  at this scale. Only capture data-changing actions.
