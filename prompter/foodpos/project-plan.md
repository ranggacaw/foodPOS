# Project Plan: FoodPOS

> **Status:** Verified ✅
> **Date:** 2026-03-02
> **Owner:** ranggacaw
> **Source documents:** `product-brief.md`, `AGENTS.md`

---

## Project Overview

**FoodPOS** is a self-hosted, single-tenant, browser-based Point of Sale system purpose-built for the food service industry (restaurants, cafés, food outlets). It unifies ordering, menu/recipe management, ingredient-level COGS tracking, real-time inventory deduction, and profitability analytics into a single modern web application — with zero recurring SaaS fees and full data ownership. Currently in **active development**; core POS is operational with several modules expanding.

---

## MVP Scope

### In Scope (Already Implemented)

- [x] POS Terminal — category-based menu browsing, cart management, order placement
- [x] Multiple payment methods: Cash, Card, QRIS
- [x] Menu & Category CRUD with active/inactive toggling
- [x] Recipe / BOM management with per-ingredient quantities
- [x] Automatic COGS calculation per order (Σ recipe.qty × cost_per_unit)
- [x] Ingredient registry with unit types and cost-per-unit
- [x] Real-time inventory auto-deduction on each order
- [x] Low-stock alerts with configurable restock thresholds
- [x] Date-range sales reports (revenue, COGS, gross profit, top sellers)
- [x] Real-time dashboard KPIs (today's orders, revenue, low-stock count)
- [x] Role-based access: Admin + Cashier (middleware-enforced)
- [x] Session-based authentication via Laravel Breeze

### In Progress (Active Development)

- [ ] **Refund & Void Management** — cancel/refund completed orders — 🔴 High
- [ ] **Cashier Shift Management** — open/close shift with cash reconciliation — 🔴 High
- [ ] **Production Batch Management** — prep batch tracking — 🟡 Medium
- [ ] **Business Reports & Analytics** — advanced charts + export — 🟡 Medium
- [ ] **Supplier Management** — purchase orders & cost history — 🟡 Medium

### Out of Scope (Deferred)

- Payment gateway integration (QRIS/card processing) — _enum values exist; no real gateway yet_
- Multi-branch / multi-tenant support — _significant rearchitecting required_
- Real-time push notifications (WebSocket) — _no WebSocket infrastructure today_
- Customer loyalty program — _v3+ feature_
- Receipt / thermal printer integration — _hardware dependency_
- Comprehensive audit trail — _logged as tech debt; should be prioritized pre-production_

---

## User Roles

| Role        | Description                                                                                | MVP?   |
| ----------- | ------------------------------------------------------------------------------------------ | ------ |
| **Admin**   | Restaurant owner/manager. Full access: menu, ingredients, recipes, inventory, reports, POS | ✅ Yes |
| **Cashier** | Front-line staff. POS terminal, own order history, dashboard KPIs only                     | ✅ Yes |

> The two-role system is well-sized for single-location operations. Multi-role granularity (manager, supervisor) is a clean v2 addition via the existing enum-based `role` column — no rearchitecting needed.

---

## Core Features (Prioritized)

| #   | Feature                               | Priority     | Complexity | Status         |
| --- | ------------------------------------- | ------------ | ---------- | -------------- |
| 1   | POS Terminal (cart + order placement) | Must-have    | High       | ✅ Done        |
| 2   | COGS Calculation (recipe BOM)         | Must-have    | High       | ✅ Done        |
| 3   | Inventory Auto-deduction              | Must-have    | High       | ✅ Done        |
| 4   | Sales Reports + Dashboard             | Must-have    | Med        | ✅ Done        |
| 5   | Role-based Auth (Admin/Cashier)       | Must-have    | Med        | ✅ Done        |
| 6   | Refund & Void Management              | Must-have    | Med        | 🔄 In progress |
| 7   | Cashier Shift Management              | Must-have    | Med        | 🔄 In progress |
| 8   | Supplier Management                   | Nice-to-have | Med        | 🔄 In progress |
| 9   | Advanced Analytics / Export           | Nice-to-have | High       | 🔄 In progress |
| 10  | Image Upload for Menu Items           | Nice-to-have | Low        | ⏳ Deferred    |
| 11  | Payment Gateway Integration           | Nice-to-have | High       | ⏳ Deferred    |
| 12  | Multi-branch Support                  | Future       | Very High  | ⏳ Deferred    |

---

## Data Model Sketch

### Core Entities (8 tables)

- **User**: `id, name, email, password, role (admin|cashier)`
- **Category**: `id, name, description, sort_order, is_active`
- **MenuItem**: `id, category_id, name, description, price (DECIMAL 12,2), image, is_active`
- **Ingredient**: `id, name, unit (kg|liter|pcs), cost_per_unit (DECIMAL 12,2)`
- **Recipe**: `id, menu_item_id, ingredient_id, quantity (DECIMAL 10,4)` — BOM junction; unique on (menu_item_id, ingredient_id)
- **Inventory**: `id, ingredient_id (unique), quantity_on_hand (DECIMAL 12,4), restock_threshold`
- **Order**: `id, order_number (ORD-YYYYMMDD-NNNN), user_id, subtotal, tax, total, payment_method, status`
- **OrderItem**: `id, order_id, menu_item_id, quantity, unit_price, subtotal, cost` — price/COGS snapshot at time of order

### Key Relationships

- User has many Orders → OrderItems
- Category has many MenuItems → Recipes → Ingredients → Inventory (1:1)
- Order has many OrderItems; prices and COGS are snapshotted at order creation time

---

## Integrations & Services

| Capability               | Needed?          | Service/Tool      | Notes                                                        |
| ------------------------ | ---------------- | ----------------- | ------------------------------------------------------------ |
| Caching                  | No               | —                 | Database-backed; <1k users, no CDN needed yet                |
| Queues / Background Jobs | No (infra ready) | Database queue    | Infrastructure configured; no jobs dispatched yet            |
| Real-Time                | No               | —                 | No WebSocket; deferred scope                                 |
| Full-Text Search         | No               | —                 | Not applicable at POS scale                                  |
| File Storage             | No (planned)     | Local storage     | `menu_items.image` column exists; upload not yet implemented |
| Email / SMS              | No (log driver)  | Log → future SMTP | Currently logs emails only; no live sending                  |
| Analytics                | Built-in         | Laravel queries   | Native sales reports; no 3rd-party tracking                  |
| Payments                 | Enum only        | None (deferred)   | Cash/Card/QRIS as enum values; no active gateway             |
| Third-Party              | No               | —                 | No social login, maps, etc.                                  |

---

## Tech Stack

| Layer          | Choice                                | Rationale                                              |
| -------------- | ------------------------------------- | ------------------------------------------------------ |
| Frontend       | React 18 + TypeScript                 | Type-safe, component-driven SPA via Inertia            |
| Backend        | Laravel 12 (PHP 8.2+)                 | Rapid dev, Eloquent ORM, Breeze auth, rich ecosystem   |
| SSR Bridge     | Inertia.js 2.x                        | Eliminates REST API layer; server-rendered SPA UX      |
| Client Routing | Ziggy 2.x                             | Named Laravel route references in TypeScript           |
| ORM            | Eloquent (built-in)                   | Clean relations, accessors for live COGS calculation   |
| Database       | MySQL 8.x                             | DECIMAL precision for financial data; battle-tested    |
| Styling        | Tailwind CSS 3.x + @tailwindcss/forms | Utility-first, consistent; forms plugin for POS inputs |
| Build Tool     | Vite 7.x                              | Instant HMR, fast builds, ES module native             |
| Auth           | Laravel Breeze 2.x                    | Scaffolded auth with React + TypeScript stack          |
| Docker         | **No**                                | Running on Laragon (local). Self-hosted on LAMP/LEMP.  |

---

## Deployment & Environments

| Environment | Platform               | URL                   | Notes                                                  |
| ----------- | ---------------------- | --------------------- | ------------------------------------------------------ |
| Development | Laragon (local)        | `http://foodpos.test` | `composer dev` starts all services concurrently        |
| Staging     | Not configured         | TBD                   | **Recommended:** set up before first production deploy |
| Production  | Self-hosted (VPS/LAMP) | TBD                   | No cloud CI/CD detected                                |

> For a self-hosted restaurant POS, a single VPS (DigitalOcean, Hetzner) running Nginx + PHP-FPM + MySQL is ideal. A staging environment should be set up before the first live deployment.

---

## Non-Functional Requirements

| Requirement | Detail                                                                                                                                                                                                                 |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Security    | Session-based auth, bcrypt (12 rounds), role middleware, `.env` secrets. **Gap:** no audit trail — flagged as High-severity tech debt. Default seeder passwords must be rotated before production.                     |
| Performance | Designed for <1k concurrent users (single-location restaurant). Known N+1 in `OrderController.store()` — should eager-load ingredients. No indexes beyond PKs/FKs; add index on `orders.created_at` before production. |
| SEO         | **Not required** — internal SPA tool; not customer-facing.                                                                                                                                                             |

---

## Open Questions / Risks

1. **Audit Trail** — No `who changed what` logging. High-risk gap for a financial system. Must implement before production.
2. **Negative Inventory** — No guard prevents stock going below zero. Could mislead kitchen staff mid-service.
3. **Default Passwords** — `AdminSeeder` creates users with `password`. Must rotate before going live.
4. **SQLite vs MySQL tests** — Test suite uses SQLite in-memory; the `ALTER TABLE MODIFY COLUMN` migration is MySQL-only and will fail in tests.
5. **Image Upload** — `MenuItem.image` column exists with no upload logic. An invisible dead field until implemented.
6. **No Staging Environment** — Changes pushed directly to production without a staging validation layer.

---

## Recommended Next Steps

### 1. The project already exists — no scaffold needed

```bash
# Start the full development environment
composer dev
# → Starts: php artisan serve + queue:listen + pail + vite (concurrently)
```

### 2. Immediate priorities

- 🔴 **Implement Refund & Void Management** — most impactful operational gap for live use
- 🔴 **Implement Cashier Shift Management** — required for real-world cash reconciliation
- 🛡️ **Add Audit Trail** (`activity_log` table) — High-severity security gap
- 🛡️ **Prevent negative inventory** — add a guard in `OrderController.store()`
- 🧪 **Write feature tests for `OrderController.store()`** — most critical business logic; currently untested
- 📸 **Implement image upload** for MenuItem — `image` column is a dead field

### 3. Pre-production checklist

- [ ] Rotate all default seeder passwords (`password` → secure credentials)
- [ ] Add DB indexes: `orders.created_at`, `order_items.menu_item_id`
- [ ] Set up a staging environment (VPS clone or Railway)
- [ ] Resolve SQLite/MySQL test inconsistency
- [ ] Write feature tests: COGS accuracy, inventory deduction, RBAC enforcement
- [ ] Fix N+1 query in `OrderController.store()` with eager loading
