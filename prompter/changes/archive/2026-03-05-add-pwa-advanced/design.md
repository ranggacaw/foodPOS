## Context
Phase 3 builds on Phase 1 (Workbox service worker, vite-plugin-pwa) and Phase 2 (branch_id
on orders and shifts). The app needs to work in environments with unreliable connectivity.
Cashiers must be able to create orders even without network access, and branch managers need
to request stock transfers and receive push notifications for operational events.

## Goals / Non-Goals
- Goals: offline order queuing + automatic sync; branch inventory transfers with approval flow;
  Web Push notification subscription and delivery for four event types
- Non-Goals: real-time WebSocket push; iOS push notifications (APNs requires separate
  entitlements); multi-device sync conflict resolution beyond "server wins"

## Decisions

### Decision: IndexedDB via `idb` library for the offline queue
Use the lightweight `idb` npm package (3 kB gzipped) rather than Dexie.js (26 kB) for the
offline transaction queue. Phase 3 only needs a simple key-value store for pending order
payloads; `idb` is sufficient and avoids bloating the bundle.

Alternatively, using the Background Sync API (`SyncManager`) for the queue flush:
- Register a `sync` tag `pos-order-queue` in the service worker.
- The browser fires the `sync` event when network is restored, even if the app is closed.
- Graceful fallback: if `SyncManager` is not supported (non-Chromium), flush on next `online`
  event in the React app via `window.addEventListener('online', ...)`.

### Decision: Server-wins conflict resolution for offline orders
When a queued order is flushed, the server processes it identically to an online order.
If the server rejects (e.g., menu item deleted while offline, ingredient out of stock), the
server returns a structured error; the client marks the queued item as `failed` and notifies
the cashier. There is no merge strategy — the cashier must re-review failed orders manually.

### Decision: Web Push via `web-push-php` VAPID approach (not FCM)
Using `web-push-php` (matthiasmullie/web-push or minishlink/web-push) with VAPID keys
stored in `.env` avoids a Firebase dependency and keeps the stack self-hosted. Push
subscriptions are stored in a `push_subscriptions` table (user_id, endpoint, public_key,
auth_token). Notifications are dispatched as Laravel Notifications with a custom
`WebPushChannel`.

Alternative (FCM) considered: adds Google dependency, requires service account JSON secret,
but supports iOS in future. Deferred to a later phase if iOS support is required.

### Decision: Inventory transfer approval is admin/branch-manager only; atomic DB transaction
`InventoryTransfer` status flow: `pending` → `approved` (inventory adjusted) or `rejected`.
Approval atomically decrements `inventory.quantity_on_hand` at `from_branch` and increments
at `to_branch` inside a `DB::transaction`. Rejections do not touch inventory. Only users with
`role = admin` can approve or reject transfers.

## Risks / Trade-offs
- Background Sync API: only available in Chromium browsers. The `online` event fallback
  covers Safari/Firefox but requires the app tab to be open. Document this limitation.
- VAPID key rotation: if `.env` VAPID keys are changed, all push subscriptions become invalid
  and users must re-subscribe. Provide a re-subscription flow.
- Inventory transfer negative stock: approving a transfer where `from_branch` has insufficient
  stock could push inventory below zero (currently allowed by design per AGENTS.md). Add a
  warning but do not block — consistent with existing behaviour.

## Migration Plan
1. Migration: `create_inventory_transfers_table`
2. Migration: `create_push_subscriptions_table`
3. Generate VAPID keys: `php artisan webpush:vapid` → store in `.env`
4. Implement IndexedDB queue + service worker background sync
5. Implement notification classes + channel
6. Wire up routes, controllers, frontend pages

## Open Questions
- Which four notification types are P1 for MVP? (Epic lists: low stock, shift start reminder,
  inventory transfer status, daily sales summary — all four are in scope)
- Should push notification opt-in be per-user (stored in DB) or per-device (stored in
  localStorage only)?
