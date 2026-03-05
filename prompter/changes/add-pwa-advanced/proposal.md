# Change: Add PWA Advanced Features (Phase 3 of PWA & Branch Epic)

## Why
With the PWA foundation (Phase 1) and multi-branch data model (Phase 2) in place, the app
needs to work reliably in unstable-network branch environments. This phase delivers
offline transaction queuing so cashiers are never blocked by connectivity drops, branch
inventory transfer requests so stock can be moved between locations, and Web Push
notifications for critical operational events (low stock, shift reminders, transfer approvals).

## What Changes
- **Offline sync queue**: IndexedDB-based client queue (via `idb` library) that stores
  `POST /pos/orders` payloads when the device is offline; the service worker background-sync
  handler flushes the queue on reconnection; the POS UI shows a pending-sync badge;
  cashiers are blocked from closing a shift while unsynced transactions remain
- **Branch inventory transfer**: New `inventory_transfers` table; Admin/branch-scoped Admin
  can create transfer requests (from_branch → to_branch); receiving manager approves or
  rejects; inventory quantities are adjusted on approval; transfer history page per branch
- **Web Push notifications**: Laravel notification channel using `web-push-php` (or FCM);
  service worker `push` event handler; in-app opt-in permission prompt; notification
  triggers: low stock alert, shift start reminder, inventory transfer status, daily summary

## Depends On
- `add-pwa-foundation` (Phase 1) — service worker and Workbox infrastructure required
- `add-multi-branch-management` (Phase 2) — `branch_id` on orders, shifts, and inventory required

## Impact
- Affected specs:
  - `pwa-offline-sync` (new)
  - `branch-inventory-transfer` (new)
  - `pwa-push-notifications` (new)
  - `cashier-shift-management` (MODIFIED — shift close blocked if unsynced queue)
- Affected code (backend):
  - New migration: `create_inventory_transfers_table`
  - `app/Models/InventoryTransfer.php` (new)
  - `app/Http/Controllers/Admin/InventoryTransferController.php` (new)
  - `app/Notifications/LowStockAlert.php`, `ShiftReminder.php`, `TransferStatusUpdate.php`,
    `DailySalesSummary.php` (new Laravel notifications)
  - `app/Http/Controllers/POS/PushSubscriptionController.php` (new)
  - `routes/web.php` — transfer routes, push subscription route
- Affected code (frontend):
  - `idb` npm package added
  - `resources/js/hooks/useOfflineQueue.ts` (new)
  - `resources/js/Components/OfflineSyncBadge.tsx` (new)
  - `resources/js/Components/PushNotificationPrompt.tsx` (new)
  - `resources/js/Pages/Admin/InventoryTransfers/` (new: Index, Create)
  - Service worker: background sync registration + push event handler

## Pre-implementation Risks
- Background Sync API has limited browser support (Chrome/Android only); graceful polling
  fallback needed for other browsers
- `web-push-php` VAPID key generation and storage must be handled in `.env`; keys must not
  be rotated without re-subscribing all clients
- Transfer approval must be atomic (DB transaction) to prevent double-deduction of stock
