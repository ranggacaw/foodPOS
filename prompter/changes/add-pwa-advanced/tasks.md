## Prerequisites
- `add-pwa-foundation` must be fully implemented (service worker + Workbox infrastructure)
- `add-multi-branch-management` must be fully implemented (`branch_id` on orders/shifts/inventory)

## 1. Offline Sync Queue — Backend
- [ ] 1.1 Verify `POST /pos/orders` returns structured JSON error responses (not redirects)
      when validation fails — required for the client-side queue to handle rejections

## 2. Offline Sync Queue — Frontend
- [ ] 2.1 Add `idb` npm package to `package.json`
- [ ] 2.2 Create `resources/js/hooks/useOfflineQueue.ts`:
      - `openDB('foodpos-queue', 1)` with `pending-orders` object store
      - `enqueue(payload)`: adds order payload with `status: 'pending'` to IndexedDB
      - `flush()`: iterates pending items, POSTs each to `/pos/orders`, marks `synced` or
        `failed`
      - `getPendingCount()`: returns count of `pending` items
      - Register `navigator.serviceWorker.ready.then(sw => sw.sync.register('pos-order-queue'))`
        if `SyncManager` is supported; otherwise call `flush()` on `window.addEventListener('online')`
- [ ] 2.3 Update `resources/js/Pages/POS/Index.tsx` (or equivalent POS page):
      - Intercept order form submission
      - If `!navigator.onLine`, call `useOfflineQueue.enqueue(payload)` instead of
        the Inertia form submit
      - Show a toast notification "Order saved offline. Will sync when connected."
- [ ] 2.4 Create `resources/js/Components/OfflineSyncBadge.tsx`:
      - Reads `pendingCount` from `useOfflineQueue`
      - Renders a badge showing count; hidden when 0
      - Shows spinner animation during flush

## 3. Service Worker Background Sync
- [ ] 3.1 Migrate `vite-plugin-pwa` from `generateSW` to `injectManifest` strategy
      to allow custom service worker code
- [ ] 3.2 Create `resources/js/sw.ts` (custom service worker source):
      - Import Workbox precaching from the `injectManifest` virtual module
      - Add `sync` event listener for tag `pos-order-queue`
      - In the sync handler: open IndexedDB, POST each pending order, update status
      - Add `push` event listener (wired in Phase 3.7)
- [ ] 3.3 Update `vite.config.js` to point `injectManifest.swSrc` to `resources/js/sw.ts`

## 4. Shift Close Guard
- [ ] 4.1 Update `resources/js/Pages/POS/Shifts/Close.tsx` (or shift close form):
      - Import `useOfflineQueue` and read `pendingCount`
      - Disable the close-shift submit button when `pendingCount > 0`
      - Render warning: "You have {n} unsynced order(s). Wait for sync before closing."

## 5. Inventory Transfers — Backend
- [ ] 5.1 Create migration `create_inventory_transfers_table`:
      `id, from_branch_id (FK→branches), to_branch_id (FK→branches), ingredient_id (FK),
       quantity (decimal 10,4), status (enum: pending|approved|rejected),
       requested_by (FK→users), approved_by (FK→users nullable),
       approved_at (timestamp nullable), rejected_by (FK→users nullable),
       rejected_at (timestamp nullable), notes (text nullable), timestamps`
- [ ] 5.2 Create `app/Models/InventoryTransfer.php` with `$fillable`, `casts()`, and
      relationships: `fromBranch`, `toBranch`, `ingredient`, `requestedBy`, `approvedBy`
- [ ] 5.3 Create `app/Http/Controllers/Admin/InventoryTransferController.php`:
      - `index`: paginated list filtered by branch context
      - `create`: form
      - `store`: validation + create record with `status = pending`
      - `approve`: DB::transaction — decrement source, increment destination, update status
      - `reject`: update status to `rejected`
- [ ] 5.4 Add routes in `routes/web.php` under `admin` group:
      - `Route::resource('inventory-transfers', InventoryTransferController::class)->only(['index', 'create', 'store'])`
      - `Route::patch('inventory-transfers/{transfer}/approve', [InventoryTransferController::class, 'approve'])->name('inventory-transfers.approve')`
      - `Route::patch('inventory-transfers/{transfer}/reject', [InventoryTransferController::class, 'reject'])->name('inventory-transfers.reject')`

## 6. Inventory Transfers — Frontend
- [ ] 6.1 Create `resources/js/Pages/Admin/InventoryTransfers/Index.tsx` — paginated
      transfer list with status badges and approve/reject action buttons
- [ ] 6.2 Create `resources/js/Pages/Admin/InventoryTransfers/Create.tsx` — form with
      from_branch, to_branch, ingredient, quantity, notes fields
- [ ] 6.3 Add `InventoryTransfer` TypeScript interface to `types/index.d.ts`
- [ ] 6.4 Add "Inventory Transfers" nav link in admin navigation

## 7. Push Notifications — Backend
- [ ] 7.1 Add `minishlink/web-push` (or equivalent) to `composer.json`
- [ ] 7.2 Create migration `create_push_subscriptions_table`:
      `id, user_id (FK→users), endpoint (text unique), public_key (text),
       auth_token (text), timestamps`
- [ ] 7.3 Create `app/Models/PushSubscription.php` with `$fillable` and `user()` relationship
- [ ] 7.4 Create `app/Http/Controllers/POS/PushSubscriptionController.php`:
      - `store`: validate + upsert subscription by endpoint
      - `destroy`: delete by endpoint
- [ ] 7.5 Add routes:
      - `POST /push-subscriptions` → `PushSubscriptionController@store` (auth middleware)
      - `DELETE /push-subscriptions/{endpoint}` → `PushSubscriptionController@destroy`
- [ ] 7.6 Add VAPID keys to `.env` and `.env.example`:
      `VAPID_PUBLIC_KEY=`, `VAPID_SUBJECT=`, `VAPID_PRIVATE_KEY=`
- [ ] 7.7 Create `app/Notifications/LowStockAlert.php` (via custom WebPush channel)
- [ ] 7.8 Create `app/Notifications/InventoryTransferStatusUpdate.php`
- [ ] 7.9 Create `app/Notifications/DailySalesSummary.php`
- [ ] 7.10 Hook `LowStockAlert` into `OrderController.store()` post-order-creation for
       ingredients that cross the restock threshold
- [ ] 7.11 Hook `InventoryTransferStatusUpdate` into `InventoryTransferController.approve/reject`
- [ ] 7.12 Create a scheduled Artisan command `app:send-daily-summary` and register in
       `console.php` to run at 23:59 Asia/Jakarta daily

## 8. Push Notifications — Frontend
- [ ] 8.1 Create `resources/js/Components/PushNotificationPrompt.tsx`:
      - Check `Notification.permission`
      - If `default`: show opt-in banner with "Enable Notifications" button
      - On click: `Notification.requestPermission()` → subscribe via
        `navigator.serviceWorker.ready.then(sw => sw.pushManager.subscribe({...}))`
      - POST subscription to `/push-subscriptions`
- [ ] 8.2 Mount `<PushNotificationPrompt />` in `AuthenticatedLayout.tsx`
- [ ] 8.3 Add `push` event handler to `resources/js/sw.ts` (the custom service worker):
      - Parse JSON payload from `event.data.json()`
      - Call `self.registration.showNotification(title, { body, icon, data: { url } })`
- [ ] 8.4 Add `notificationclick` event handler in `sw.ts`:
      - `clients.openWindow(event.notification.data.url)` or focus existing window

## 9. Verification
- [ ] 9.1 Run `php artisan test` — all existing tests must pass
- [ ] 9.2 Manually test offline order creation: disable network, create order, re-enable,
       verify order appears in history
- [ ] 9.3 Manually test inventory transfer: create request, approve, verify stock changes
- [ ] 9.4 Manually test push notification: subscribe, trigger a low-stock order, verify
       browser notification appears
- [ ] 9.5 Test shift close blocked when queue has pending orders
- [ ] 9.6 Run `npm run build` — no TypeScript errors

## Post-Implementation
- [ ] Update `AGENTS.md` in the project root to reflect:
      - `InventoryTransfer` model and `inventory_transfers` table
      - `push_subscriptions` table
      - Offline sync queue architecture (IndexedDB, Background Sync)
      - Push notification infrastructure (VAPID, web-push-php)
