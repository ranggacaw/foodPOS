# pwa-offline-sync Specification

## Purpose
TBD - created by archiving change add-pwa-advanced. Update Purpose after archive.
## Requirements
### Requirement: Offline Order Queue (IndexedDB)
The system SHALL maintain a client-side IndexedDB queue that stores `POST /pos/orders`
payloads when the device has no network connectivity, ensuring cashiers can continue
creating orders without interruption.

#### Scenario: Order created while offline is enqueued
- **WHEN** a Cashier submits an order while the device is offline
- **THEN** the order payload is stored in the IndexedDB `pending-orders` store with
  status `pending`
- **AND** a visual indicator (badge or banner) appears in the POS UI showing the number
  of unsynced transactions

#### Scenario: Queued orders are automatically flushed on reconnection
- **WHEN** the device regains network connectivity
- **THEN** all `pending` orders in the IndexedDB queue are sent to `POST /pos/orders` in
  FIFO order
- **AND** successfully synced orders are removed from the queue
- **AND** the sync badge count decrements to zero on completion

#### Scenario: Server rejects a queued order
- **WHEN** a queued order is flushed and the server responds with a 4xx error
  (e.g., menu item no longer exists)
- **THEN** the order is marked as `failed` in the IndexedDB queue
- **AND** the cashier is notified via a UI alert with the rejection reason
- **AND** the remaining pending orders continue to sync

### Requirement: Offline Sync Badge UI
The system SHALL display a persistent badge on the POS terminal page indicating the
count of transactions pending sync, and a syncing animation while flush is in progress.

#### Scenario: Badge shows pending count
- **WHEN** there are one or more `pending` orders in the local queue
- **THEN** a badge displaying the count is visible in the POS navigation or terminal header

#### Scenario: Badge disappears when queue is empty
- **WHEN** all queued orders have been successfully synced
- **THEN** the badge is hidden

### Requirement: Shift Close Blocked by Unsynced Queue
The system SHALL prevent a Cashier from closing their shift while there are
unsynced (pending) transactions in the local offline queue.

#### Scenario: Shift close blocked with pending orders
- **WHEN** a Cashier attempts to close their shift and the local IndexedDB queue has one
  or more `pending` orders
- **THEN** the close shift button is disabled
- **AND** a warning message informs the cashier to wait for sync to complete before closing

#### Scenario: Shift close allowed when queue is empty
- **WHEN** the local IndexedDB queue has zero pending orders
- **THEN** the shift close flow proceeds normally with no restriction

### Requirement: Background Sync via Service Worker
The system's service worker SHALL register a Background Sync task (`pos-order-queue`)
that triggers an automatic queue flush even if the app tab was closed when connectivity
was restored.

#### Scenario: Background sync fires when app is closed
- **WHEN** orders are queued offline and the user closes the app tab, then connectivity
  is restored
- **THEN** the browser fires the `sync` event for the `pos-order-queue` tag
- **AND** the service worker flushes pending orders from the IndexedDB queue to the server

#### Scenario: Fallback for browsers without Background Sync API
- **WHEN** the browser does not support `SyncManager`
- **THEN** the app listens for the `window` `online` event and flushes the queue
  when the app tab is open

