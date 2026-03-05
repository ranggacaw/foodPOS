# 🧠 Epic: PWA Enablement & Multi-Branch Management for FoodPOS

---

### 🎯 Epic Goal

We need to **convert FoodPOS into a Progressive Web App (PWA) and introduce multi-branch support** in order for **cashiers, branch managers, and company owners** to **install the app on Android devices and operate transactions independently across multiple company branches** — while maintaining centralized data visibility for management.

---

### 🚀 Definition of Done

- [ ] FoodPOS is installable as a PWA on Android devices (via Chrome browser "Add to Home Screen" prompt)
- [ ] The app passes a Lighthouse PWA audit with a score of ≥ 90
- [ ] The app works offline for basic browsing (cached pages/assets) and shows a meaningful offline fallback page
- [ ] Offline transactions are queued locally and synced automatically when connectivity is restored
- [ ] A `Branch` entity exists in the database with full CRUD management by Admin
- [ ] Every transaction, shift, and cashier is scoped to a specific branch
- [ ] Branch Managers can only view and operate data within their own branch
- [ ] Admin users can view aggregated data across all branches (global view)
- [ ] Branch selector is present on the UI for Admin users to filter data by branch
- [ ] Existing data is migrated and assigned to a default branch with zero data loss
- [ ] Admin can initiate inventory transfer requests between branches with status tracking
- [ ] Push notifications are sent to relevant users for key events (e.g., low stock, shift start/end, transfer status)

---

### 📌 High-Level Scope (Included)

**PWA Implementation**

- Add a `manifest.json` (Web App Manifest) with app name, icons, theme colors, and `display: standalone`
- Register a Vite-compatible **Service Worker** (using `vite-plugin-pwa` / Workbox) for asset caching
- Generate PWA icons in all required sizes (192×192, 512×512, maskable) for Android
- Implement an **offline fallback** page rendered by the service worker
- Add `<meta>` theme color and Apple/Android touch icon tags to the root Blade layout
- Configure HTTPS (required for PWA install prompt) — document for production environment
- Show an in-app **"Install App" banner** (beforeinstallprompt event) for eligible browsers

**Multi-Branch Management**

- Create `branches` database table (id, name, address, phone, is_active, created_at, updated_at)
- Add `branch_id` foreign key to: `users`, `transactions`, `shifts`, `cashier_sessions` (and any other relevant tables)
- Seed a default `Branch` ("Pusat" / Main Branch) and assign all existing records to it
- Build Branch CRUD pages (Admin only): List, Create, Edit, Deactivate
- Implement branch-scoped middleware / Eloquent global scopes for data isolation
- Update all relevant API endpoints and Inertia page props to be branch-aware
- Add a **Branch Switcher / Filter** component to the Admin dashboard and navigation
- Assign `branch_id` to Users (cashiers/branch managers) via the User management page
- Store the active branch context in the session for non-admin users (auto-scoped)
- Update reports and dashboard metrics to reflect branch-specific data

**Offline Transaction Processing (Offline-First Sync Queue)**

- Implement a **client-side queue** (IndexedDB via a library like Dexie.js or idb) to store transactions created while offline
- The service worker intercepts POST/transaction requests and enqueues them when there is no network connectivity
- On reconnection, the sync queue is automatically flushed and transactions are sent to the server in order
- Conflict resolution strategy defined: server timestamp wins; client is notified of any rejected transactions
- UI shows a pending/syncing badge on the transaction list for queued items
- Cashier is prevented from closing a shift if unsynced transactions remain in the queue

**Branch Inventory Transfer**

- Create `inventory_transfers` table tracking (id, from_branch_id, to_branch_id, item, quantity, status, requested_by, approved_by, timestamps)
- Admin / Branch Manager can create a **transfer request** from Branch A → Branch B
- Receiving branch manager can **accept or reject** the transfer request
- Inventory quantities are adjusted automatically on approval
- Transfer history is viewable per branch in the admin panel

**Custom PWA Push Notifications**

- Integrate **Web Push** notifications using Laravel Notification channels + `web-push-php` (or a service like Firebase Cloud Messaging)
- Service worker handles `push` events and displays notifications even when the app is closed
- Users can opt-in to notifications via an in-app permission prompt
- Notification triggers: low stock alert, shift start reminder, inventory transfer status update, daily sales summary

---

### ❌ Out of Scope

- iOS Safari PWA support (limited PWA support by Apple — document as a known limitation)
- Multi-company / multi-tenant support (this is single-company, multi-branch only)
- Real-time branch-to-branch **live chat** or direct messaging between branch staff

---

### 📁 Deliverables

1. **`manifest.json`** — Web App Manifest served from `/public`
2. **Service Worker** — Registered via `vite-plugin-pwa`, caching static assets and offering offline fallback
3. **PWA Icons** — All required sizes for Android home screen installation
4. **`branches` database migration** — New table with all required columns
5. **Branch model, controller, and resource routes** — Full CRUD with policy-based authorization
6. **Branch-scoped middleware** — Eloquent global scope or query scoping applied to all branch-aware models
7. **Branch management UI pages** — Admin-only React/Inertia pages (`Index`, `Create`, `Edit`)
8. **Branch Switcher component** — Dropdown in admin nav/dashboard to filter data by branch
9. **Updated migrations** — `branch_id` added to `users`, `transactions`, `shifts`, etc.
10. **Seeder** — Default branch seed + existing data migration script
11. **Updated dashboard & reports** — All metrics scoped to the selected branch

---

### 🧩 Dependencies

- **`vite-plugin-pwa`** npm package (Workbox integration for Vite) — needs to be added to `package.json`
- **HTTPS in production** — PWA install prompt requires a secure context; Laragon local dev can use self-signed cert
- **`laravel-vite-plugin`** — already installed; needs to be compatible with `vite-plugin-pwa`
- **Existing Auth & Role system** — Branch assignment depends on current user role architecture
- **Existing transaction & shift models** — Must be identified and updated with `branch_id`
- Tailwind CSS v4 (already configured) — no additional CSS dependency needed

---

### ⚠️ Risks / Assumptions

- **Risk**: `vite-plugin-pwa` and `laravel-vite-plugin` may have Vite 7 compatibility issues — verify before implementation
- **Risk**: Adding `branch_id` to existing tables without a default value will break existing records — must use nullable with seeder migration
- **Assumption**: Each user (cashier/manager) belongs to exactly **one branch** — no cross-branch user assignment in MVP
- **Assumption**: The company has exactly **2 branches** at launch, but the schema must support N branches for future growth
- **Risk**: Service worker cache invalidation on deploy — must configure proper cache-busting strategy
- **Assumption**: Android Chrome is the primary target browser for PWA installation; no iOS support required for this Epic
- **Risk**: Admin global-scope bypass must be explicitly implemented to prevent accidental data leakage between branches

---

### 🎯 Success Metrics

- ✅ Cashier can open Chrome on Android, tap "Add to Home Screen", and launch FoodPOS as a standalone app
- ✅ Lighthouse PWA score ≥ 90 in production
- ✅ App displays an offline page when there is no internet connection (instead of browser error)
- ✅ Transactions created in Branch A are **never visible** in Branch B's reports
- ✅ Admin can toggle branch filter and see metrics for Branch A, Branch B, or All Branches
- ✅ All existing transactions and data are correctly assigned to the default branch after migration
- ✅ Zero regression in existing POS transaction flow for cashiers

---

_Generated: 2026-03-05 | Project: FoodPOS (Laravel 12 + Inertia.js + React + TypeScript + Vite)_
