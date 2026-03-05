# AGENTS — Project Knowledge Base

> **Last updated:** 2026-03-06
> **Generated from:** Codebase analysis (no DOCS_ROOT_PATH found — see Section 23)

---

## 1. 📍 Project Summary

- **Business purpose:** FoodPOS is a food-service Point of Sale system that enables restaurants and food outlets to manage menus, process customer orders, track ingredient inventory, calculate cost of goods sold (COGS), and generate sales/profitability reports.
- **Product type:** POS (Point of Sale) — single-tenant, self-hosted web application.
- **Core modules:**
    - **POS Terminal** — Cashier-facing order creation with category/item browsing, cart management, and payment processing (cash / card / QRIS).
    - **Menu Management** — Admin CRUD for categories, menu items, pricing, and active/inactive toggling.
    - **Recipe / BOM (Bill of Materials)** — Links menu items to ingredients with per-unit quantities for automatic COGS calculation.
    - **Ingredient & Inventory** — Tracks raw ingredients, unit costs, on-hand quantities, and restock thresholds with low-stock alerts.
    - **Reporting** — Date-range–filtered sales reports showing revenue, order count, COGS, gross profit, and top-selling items.
    - **Dashboard** — Real-time KPIs: today's orders, today's revenue, low-stock count.
    - **User & Authentication** — Role-based access (admin / cashier) with Laravel Breeze scaffolding.
- **Target users:**
    - **Admin** — Restaurant owner or manager who configures menu, ingredients, recipes, inventory, and views reports.
    - **Cashier** — Front-line staff who creates orders via the POS terminal and views their own order history.

---

## 2. 🧱 Tech Stack

| Layer                            | Technology              | Version / Notes                                                                                             |
| -------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Backend framework**            | Laravel                 | 12.x (PHP ≥ 8.2)                                                                                            |
| **Backend language**             | PHP                     | 8.2+                                                                                                        |
| **Frontend framework**           | React                   | 18.x (via Inertia.js 2.x)                                                                                   |
| **Frontend language**            | TypeScript              | 5.x                                                                                                         |
| **Server-side rendering bridge** | Inertia.js              | 2.x (`@inertiajs/react`)                                                                                    |
| **Routing (client-aware)**       | Ziggy                   | 2.x (`tightenco/ziggy`)                                                                                     |
| **CSS framework**                | Tailwind CSS            | 3.x with `@tailwindcss/forms` plugin                                                                        |
| **Build tool**                   | Vite                    | 7.x with `laravel-vite-plugin` + `@vitejs/plugin-react` + `vite-plugin-pwa` (Workbox `generateSW`)         |
| **Database (production)**        | MySQL                   | 8.x (via `DB_CONNECTION=mysql`)                                                                             |
| **Database (testing)**           | SQLite                  | In-memory (`:memory:`)                                                                                      |
| **Session / Cache / Queue**      | Database-backed         | `SESSION_DRIVER=database`, `CACHE_STORE=database`, `QUEUE_CONNECTION=database`                              |
| **Authentication**               | Laravel Breeze          | 2.x (React + TypeScript stack)                                                                              |
| **Authorization**                | Custom `RoleMiddleware` | Simple `role:admin` / `role:cashier` enum check                                                             |
| **API auth (optional)**          | Laravel Sanctum         | 4.x (installed, not actively used for SPA)                                                                  |
| **Testing**                      | PHPUnit                 | 11.x (with `pest-plugin` allowed)                                                                           |
| **Code style**                   | Laravel Pint            | 1.x                                                                                                         |
| **Dev runner**                   | Concurrently            | Runs `php artisan serve`, queue worker, Pail log viewer, and Vite dev server in parallel via `composer dev` |
| **Infrastructure**               | Laragon (local)         | Self-hosted; no cloud CI/CD detected                                                                        |

---

## 3. 🏗️ Architecture Overview

### Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (React SPA)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │ POS      │  │ Admin    │  │ Dashboard│  │ Auth / Profile │  │
│  │ Terminal │  │ Panels   │  │          │  │                │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬───────────┘  │
│       │              │             │              │              │
│       └──────────────┴─────────────┴──────────────┘              │
│                          Inertia.js                              │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP (HTML + JSON props)
┌────────────────────────────┴────────────────────────────────────┐
│                     Laravel 12 Backend                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Controllers  │  │ Middleware   │  │ Models (Eloquent)    │   │
│  │ ─ POS\Order  │  │ ─ Auth       │  │ ─ User               │   │
│  │ ─ Admin\*    │  │ ─ Role       │  │ ─ Category           │   │
│  │ ─ Dashboard  │  │ ─ Inertia    │  │ ─ MenuItem           │   │
│  │ ─ Profile    │  │              │  │ ─ Ingredient         │   │
│  └──────┬───────┘  └──────────────┘  │ ─ Recipe             │   │
│         │                            │ ─ Inventory          │   │
│         │                            │ ─ Order / OrderItem  │   │
│         │                            └──────────┬───────────┘   │
│         └───────────────────────────────────────┘               │
│                              │                                   │
│                        Eloquent ORM                              │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │   MySQL Database    │
                    │   (foodpos)         │
                    └─────────────────────┘
```

### Service Boundaries

| Boundary                                                   | Responsibility                                                                                                         |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **POS** (`App\Http\Controllers\POS`)                       | Order creation, order detail view, cashier order history, transaction history, shift management, push subscriptions (branch-scoped) |
| **Admin** (`App\Http\Controllers\Admin`)                   | CRUD for categories, menu items, ingredients, recipes, inventory, **branches**, **inventory transfers**; sales reports; **order cancellation**; **audit log** |
| **Dashboard** (`App\Http\Controllers\DashboardController`) | Aggregated KPIs for authenticated users (branch-scoped for non-global admins)                                        |
| **Auth** (`App\Http\Controllers\Auth`)                     | Login, registration, password reset, email verification (Breeze)                                                       |
| **Profile** (`App\Http\Controllers\ProfileController`)     | User profile editing and account deletion                                                                              |

### Data Flow — Order Placement

```
Cashier selects items → POST /pos/orders
  → Validate items + payment_method
  → DB::transaction {
      1. Load MenuItem + recipes + ingredient costs
      2. Calculate unit_price, subtotal, COGS per line
      3. Deduct ingredient quantities from inventory
      4. Create Order + OrderItems
    }
  → Redirect to order detail with success flash
```

### Async Processing

- Queue connection is `database` — jobs table exists but no application-level jobs are currently dispatched.
- Concurrently-managed `queue:listen` is included in `composer dev` for future use.

---

## 4. 📁 Folder Structure & Key Files

```
foodPOS/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/
│   │   │   │   ├── BranchController.php       # CRUD branches
│   │   │   │   ├── CategoryController.php      # CRUD categories
│   │   │   │   ├── AuditLogController.php      # View activity logs
│   │   │   │   ├── CancelOrderController.php   # Void completed orders (admin-only)
│   │   │   │   ├── IngredientController.php     # CRUD ingredients + auto-create inventory
│   │   │   │   ├── InventoryController.php      # View & update stock levels
│   │   │   │   ├── InventoryTransferController.php  # Inter-branch stock transfer requests
│   │   │   │   ├── MenuItemController.php       # CRUD menu items
│   │   │   │   ├── RecipeController.php         # Manage BOM per menu item
│   │   │   │   └── ReportController.php         # Date-range sales & profit reports
│   │   │   ├── Auth/                            # Breeze auth controllers
│   │   │   ├── POS/
│   │   │   │   ├── OrderController.php          # POS terminal + order CRUD
│   │   │   │   ├── PushSubscriptionController.php   # Web push subscription store/delete
│   │   │   │   ├── ShiftController.php          # Cashier shift opening & closing
│   │   │   │   └── TransactionHistoryController.php  # Transaction history & daily summaries
│   │   │   ├── Controller.php                   # Base controller
│   │   │   ├── DashboardController.php          # KPI dashboard
│   │   │   └── ProfileController.php            # Profile edit/delete
│   │   ├── Middleware/
│   │   │   ├── HandleInertiaRequests.php         # Inertia shared data
│   │   │   ├── RoleMiddleware.php                # Simple role gate
│   │   │   └── SetBranchContext.php            # Branch scoping middleware
│   │   └── Requests/
│   │       ├── Auth/LoginRequest.php
│   │       └── ProfileUpdateRequest.php
│   ├── Models/
│   │   ├── Branch.php
│   │   ├── Category.php
│   │   ├── Ingredient.php
│   │   ├── Inventory.php
│   │   ├── InventoryTransfer.php
│   │   ├── MenuItem.php
│   │   ├── Order.php
│   │   ├── OrderItem.php
│   │   ├── PushSubscription.php
│   │   ├── Recipe.php
│   │   ├── Shift.php
│   │   └── User.php
│   ├── Services/
│   │   └── BranchContext.php                  # Active branch session helper
│   └── Providers/
│       └── AppServiceProvider.php
├── database/
│   ├── factories/UserFactory.php
│   ├── migrations/                              # 19 migration files
│   └── seeders/
│       ├── AdminSeeder.php                      # Default admin + cashier users
│       ├── DatabaseSeeder.php
│       └── SampleDataSeeder.php                 # Demo data (28 KB)
├── resources/
│   ├── css/app.css                              # Tailwind entry
│   ├── js/
│   │   ├── app.tsx                              # Inertia SPA bootstrap
│   │   ├── bootstrap.ts                         # Axios setup
│   │   ├── Components/                          # 13 reusable React components
│   │   ├── Layouts/
│   │   │   ├── AuthenticatedLayout.tsx          # Main app shell with nav and branch switcher
│   │   │   └── GuestLayout.tsx                  # Auth pages shell
│   │   ├── Pages/
│   │   │   ├── Admin/                           # Admin pages (Branches, Categories, Ingredients, Inventory, InventoryTransfers, MenuItems, Recipes, Reports)
│   │   │   ├── Auth/                            # Login, Register, ForgotPassword, etc.
│   │   │   ├── Dashboard.tsx                    # KPI dashboard page
│   │   │   ├── POS/                             # POS terminal, order history, order detail
│   │   │   ├── Profile/                         # Profile editing pages
│   │   │   └── Welcome.tsx                      # Landing page
│   │   └── types/
│   │       ├── index.d.ts                       # Domain type definitions
│   │       ├── global.d.ts                      # Global type augmentation (route, axios)
│   │       └── vite-env.d.ts
│   └── views/app.blade.php                      # Root Blade template
├── routes/
│   ├── web.php                                  # All web routes
│   ├── auth.php                                 # Breeze auth routes
│   └── console.php                              # Artisan commands
├── tests/
│   ├── Feature/                                 # Auth + profile tests
│   │   ├── Auth/                                # 6 auth feature tests
│   │   ├── ExampleTest.php
│   │   └── ProfileTest.php
│   ├── Unit/ExampleTest.php
│   └── TestCase.php
├── prompter/                                    # Spec-driven development tooling
│   ├── AGENTS.md                                # Prompter workflow instructions
│   ├── project.md                               # Project conventions (template)
│   └── core/prompts/                            # AI prompt templates
├── .agent/workflows/                            # AI workflow definitions
├── public/
│   ├── icons/                                   # PWA icon assets (generated)
│   │   ├── icon-192x192.png                     # Standard Android home-screen icon
│   │   ├── icon-512x512.png                     # Splash screen / high-res icon
│   │   ├── icon-maskable-192x192.png            # Maskable icon (10% safe-zone padding)
│   │   ├── apple-touch-icon.png                 # 180×180 iOS Safari bookmark icon
│   │   └── foodpos-logo.svg                     # Source SVG for icon generation
│   ├── offline.html                             # Static offline fallback (no JS dependencies)
│   ├── sw.js                                    # Workbox service worker (generated by vite-plugin-pwa, injectManifest strategy)
│   └── workbox-*.js                             # Workbox runtime chunk (generated)
├── .env                                         # Environment config
├── composer.json                                # PHP dependencies
├── package.json                                 # Node dependencies
├── vite.config.js                               # Vite build config (includes VitePWA plugin)
├── tailwind.config.js                           # Tailwind config
├── tsconfig.json                                # TypeScript config
├── phpunit.xml                                  # PHPUnit config
└── AGENTS.md                                    # ← THIS FILE
```

### Critical Configuration Files

| File                 | Purpose                                              |
| -------------------- | ---------------------------------------------------- |
| `.env`               | Database credentials, app URL, queue/cache drivers   |
| `bootstrap/app.php`  | Middleware registration, routing, exception handling |
| `vite.config.js`     | Frontend build entry point and plugins (PWA plugin configured here) |
| `tailwind.config.js` | Tailwind content paths and theme extensions          |
| `tsconfig.json`      | TypeScript compiler options                          |
| `phpunit.xml`        | Test database (SQLite in-memory), test suites        |

### DOCS_ROOT_PATH

No dedicated documentation directory (e.g., `docs/`, `specs/`) was found in the project root. The `prompter/` directory contains workflow instructions and spec-driven tooling but not traditional product documentation (PRD, FSD, ERD, etc.). See **Section 23** for details.

---

## 5. 🔑 Core Business Logic & Domain Rules

### Primary Workflows

#### Order Placement (POS)

```
[Cashier browses menu] → [Adds items to cart] → [Selects payment method]
  → POST /pos/orders
  → Validation: items[].menu_item_id exists, items[].quantity ≥ 1, payment_method ∈ {cash, card, qris}
  → Transaction:
      1. For each cart item:
         a. Load MenuItem with recipes → ingredients
         b. Calculate unit_price (from MenuItem.price at time of order)
         c. Calculate COGS = Σ(recipe.quantity × ingredient.cost_per_unit) × order_quantity
         d. Deduct inventory: inventory.quantity_on_hand -= recipe.quantity × order_quantity
      2. Calculate subtotal, tax (default 10%), total
      3. Generate order_number: ORD-YYYYMMDD-NNNN (sequential per day)
      4. Create Order (status: 'completed') + OrderItems
  → Redirect to order detail page
```

#### Tax Calculation

- Default tax rate: **10%** (configurable per order via `tax_rate` parameter, range 0–100%)
- `tax = round(subtotal × tax_rate, 2)`
- `total = round(subtotal - discount + tax, 2)`

#### Discount Calculation

- Optional discount field on orders (numeric, min: 0)
- Applied before tax: `total = round((subtotal - discount) + tax, 2)`
- Discount can be a fixed amount (e.g., 5000) or percentage

#### COGS Calculation

- **Per menu item:** `cost = Σ(recipe.quantity × ingredient.cost_per_unit)` for all recipe rows
- **Per order item:** `line_cost = unit_cost × quantity`
- **Per order:** `total_cost = Σ(order_items.cost)`
- **Food cost percentage:** `(cost / price) × 100`

#### Inventory Deduction

- Automatic on order placement — no manual approval step
- **Negative stock is allowed** (no validation prevents below-zero quantities)
- Low-stock alert: `quantity_on_hand ≤ restock_threshold`

### Validation Rules

| Entity     | Field          | Rules                         |
| ---------- | -------------- | ----------------------------- |
| Category   | name           | required, string, max:255     |
| Category   | sort_order     | nullable, integer, min:0      |
| Category   | is_active      | boolean                       |
| MenuItem   | name           | required, string, max:255     |
| MenuItem   | price          | required, numeric, min:0      |
| MenuItem   | category_id    | required, exists:categories   |
| Ingredient | name           | required, string, max:255     |
| Ingredient | unit           | required, string, max:50      |
| Ingredient | cost_per_unit  | required, numeric, min:0      |
| Recipe     | ingredient_id  | required, exists:ingredients  |
| Recipe     | quantity       | required, numeric, min:0.0001 |
| Order      | items          | required, array, min:1        |
| Order      | payment_method | required, in:cash,card,qris   |

### Side Effects

| Trigger            | Side Effect                                          |
| ------------------ | ---------------------------------------------------- |
| Order created      | Inventory quantities decremented per recipe BOM      |
| Order cancelled    | Inventory quantities restored (reversed per recipe) |
| Ingredient created | Inventory row auto-created (qty=0, threshold=0)      |
| MenuItem deleted   | Recipes cascade-deleted (FK constraint)              |
| Category deleted   | MenuItems cascade-deleted (FK constraint)            |
| Ingredient deleted | Recipes + Inventory cascade-deleted (FK constraints) |

---

## 6. 🗂️ Data Models / Entities

### Entity-Relationship Diagram

```
┌──────────────┐
│   branches   │
├──────────────┤
│ id           │
│ name         │
│ address      │ (nullable)
│ phone        │ (nullable)
│ is_active    │
│ timestamps   │
└──────┬───────┘
       │ 1:N
       │
       ▼
┌──────────┐       ┌─────────────┐       ┌──────────────┐
│  users   │       │  categories │       │  ingredients  │
├──────────┤       ├─────────────┤       ├──────────────┤
│ id       │       │ id          │       │ id           │
│ name     │       │ name        │       │ name         │
│ email    │       │ description │       │ unit         │
│ password │       │ sort_order  │       │ cost_per_unit│
│ role     │       │ is_active   │       │ timestamps   │
│ branch_id│ (FK)      │ timestamps  │       └──────┬───────┘
│ timestamps│      └──────┬──────┘              │
└────┬─────┘             │ 1:N                │ 1:1
     │ 1:N               │                   ▼
     │                   │            ┌──────────────┐
     │                   │            │  inventory   │
     │                   │            ├──────────────┤
     │                   │            │ id           │
     │                   │            │ ingredient_id│ (unique)
     │                   │            │ quantity_on_hand│
     │                   │            │ restock_threshold│
     │                   │            │ timestamps   │
     │                   │            └──────────────┘
     │                   │
     │                   ▼                      │
     │            ┌─────────────┐              │
     │            │ menu_items  │              │
     │            ├─────────────┤              │
     │            │ id          │              │
     │            │ category_id │ (FK)         │
     │            │ name        │              │
     │            │ description │              │
     │            │ price       │              │
     │            │ image       │              │
     │            │ is_active   │              │
     │            │ timestamps  │              │
     │            └──────┬──────┘              │
     │                   │                     │
     │                   │ 1:N                 │ 1:N
     │                   ▼                     │
     │            ┌──────────────┐             │
     │            │   recipes    │◄────────────┘
     │            ├──────────────┤
     │            │ id           │
     │            │ menu_item_id │ (FK)
     │            │ ingredient_id│ (FK)
     │            │ quantity     │
     │            │ timestamps   │
     │            └──────────────┘
     │            unique(menu_item_id, ingredient_id)
     │
     ▼
  ┌──────────┐
  │  orders  │
  ├──────────┤
  │ id       │
  │ order_number│
  │ user_id  │ (FK)
  │ shift_id │ (nullable FK)
  │ branch_id│ (FK)
  │ subtotal │
  │ tax      │
  │ total    │
  │ payment_ │
  │  method  │
  │ status   │
  │ timestamps│
  └────┬─────┘
       │ 1:N
       │
       ▼
  ┌──────────┐
  │  shifts  │
  ├──────────┤
  │ id       │
  │ user_id  │ (FK)
  │ branch_id│ (FK)
  │ opened_at│
  │ closed_at│ (nullable)
  │ opening_cash│
  │ closing_cash│ (nullable)
  │ notes    │ (nullable)
  │ status   │ (enum: open|closed)
  └──────────┘
       │ 1:N
       │
       ▼
  ┌──────────────┐
  │ order_items  │
  ├──────────────┤
  │ id           │
  │ order_id     │ (FK)
  │ menu_item_id │ (FK)
  │ quantity     │
  │ unit_price   │
  │ subtotal     │
  │ cost         │ (COGS snapshot)
  │ timestamps   │
  └──────────────┘

  ┌──────────────┐
  │ activity_logs│
  ├──────────────┤
  │ id           │
  │ user_id      │ (FK)
  │ branch_id    │ (nullable)
  │ action       │
  │ model_type   │
  │ model_id     │
  │ payload      │
  │ ip_address   │
  │ created_at   │
  └──────────────┘

  ┌──────────────────────┐
  │ inventory_transfers  │
  ├──────────────────────┤
  │ id                   │
  │ from_branch_id       │ (FK→branches)
  │ to_branch_id         │ (FK→branches)
  │ ingredient_id        │ (FK→ingredients)
  │ quantity             │ (decimal 10,4)
  │ status               │ (enum: pending|approved|rejected)
  │ requested_by         │ (FK→users)
  │ approved_by          │ (nullable FK→users)
  │ approved_at          │ (nullable)
  │ rejected_by          │ (nullable FK→users)
  │ rejected_at          │ (nullable)
  │ notes                │ (nullable text)
  │ timestamps           │
  └──────────────────────┘

  ┌──────────────────┐
  │ push_subscriptions│
  ├──────────────────┤
  │ id               │
  │ user_id          │ (FK→users)
  │ endpoint         │ (text unique)
  │ public_key       │ (text)
  │ auth_token       │ (text)
  │ timestamps       │
  └──────────────────┘
  ```

 ### Entity Definitions

| Entity          | Key Attributes                                                                                                                                       | Notes                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **User**        | id, name, email, password, role (`admin`\|`cashier`), **branch_id** (nullable FK→branches)                                                          | Authenticatable; factory-supported. `branch_id = null` → global admin, set → branch-scoped   |
| **Category**    | id, name, description, sort_order, is_active                                                                                                         | Soft-sortable; toggleable                                                                      |
| **MenuItem**    | id, category_id, name, description, price, image, is_active                                                                                          | Computed: `cost`, `food_cost_percentage`                                                       |
| **Ingredient**  | id, name, unit, cost_per_unit                                                                                                                        | Unit examples: `kg`, `liter`, `pcs`                                                            |
| **Recipe**      | id, menu_item_id, ingredient_id, quantity                                                                                                            | BOM junction table; unique constraint on (menu_item_id, ingredient_id)                         |
| **Inventory**   | id, ingredient_id, quantity_on_hand, restock_threshold                                                                                               | 1:1 with Ingredient; unique constraint on ingredient_id                                        |
| **Order**       | id, order_number, user_id, shift_id (nullable FK→shifts), **branch_id** (nullable FK→branches), subtotal, **discount**, tax, total, payment_method, status, **cancelled_by** (nullable FK→users), **cancelled_at** (nullable timestamp) | Auto-generated order_number: `ORD-YYYYMMDD-NNNN`. `shift_id` links order to cashier's active shift. `branch_id` links order to a branch. `cancelled_by` / `cancelled_at` set on void. Discount is optional (default 0). |
| **OrderItem**   | id, order_id, menu_item_id, quantity, unit_price, subtotal, cost                                                                                     | Price & COGS snapshots at time of order                                                        |
| **Shift**       | id, user_id (FK→users), opened_at, closed_at (nullable), opening_cash, closing_cash (nullable), notes (nullable), status (enum: open|closed), **branch_id** (nullable FK→branches) | Cashier work session for cash drawer accountability. One active shift per cashier at a time. Includes `expectedClosingCash()` method for reconciliation. `branch_id` links shift to a branch. |
| **ActivityLog** | id, user_id, action, model_type, model_id, payload, ip_address, created_at, **branch_id** (nullable, no FK)                                            | Immutable record of system changes. Models override `save()` and `delete()` to prevent modification. `branch_id` records which branch the action occurred in. |
| **Branch**      | id, name, address (nullable), phone (nullable), is_active (boolean default true), timestamps                                                        | Represents a restaurant location. Admin CRUD (create, edit, activate/deactivate, no delete).   |
| **InventoryTransfer** | id, from_branch_id (FK→branches), to_branch_id (FK→branches), ingredient_id (FK→ingredients), quantity (decimal 10,4), status (enum: pending\|approved\|rejected), requested_by (FK→users), approved_by (nullable FK→users), approved_at (nullable), rejected_by (nullable FK→users), rejected_at (nullable), notes (nullable), timestamps | Inter-branch stock movement request. Approve decrements source branch inventory and increments destination branch inventory atomically. |
| **PushSubscription** | id, user_id (FK→users), endpoint (text unique), public_key (text), auth_token (text), timestamps | Web Push API subscription for a user's browser. Used to deliver low-stock alerts, transfer status updates, and daily sales summaries. Upserted by endpoint. |

### Decimal Precision

| Field                         | Precision       |
| ----------------------------- | --------------- |
| Prices, totals, costs (money) | `DECIMAL(12,2)` |
| Shift opening/closing cash    | `DECIMAL(12,2)` |
| Recipe quantities             | `DECIMAL(10,4)` |
| Inventory quantities          | `DECIMAL(12,4)` |

---

## 7. 🧠 Domain Vocabulary / Glossary

| Term                  | Definition                                                                                           |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| **POS**               | Point of Sale — cashier-facing ordering interface                                                |
| **Menu Item**         | A sellable food/drink product with a price                                                           |
| **Category**          | A grouping for menu items (e.g., "Beverages", "Main Course")                                         |
| **Ingredient**        | A raw material used in recipes (e.g., "Flour", "Cooking Oil")                                        |
| **Recipe / BOM**      | Bill of Materials — the list of ingredients and quantities needed to produce one unit of a menu item |
| **COGS**              | Cost of Goods Sold — the total ingredient cost to produce a menu item                                |
| **Food Cost %**       | `(COGS / selling price) × 100` — measures profitability per item                                     |
| **Inventory**         | Current stock levels of ingredients                                                                  |
| **Restock Threshold** | Minimum quantity before a low-stock alert is triggered                                               |
| **Low Stock**         | When `quantity_on_hand ≤ restock_threshold`                                                          |
| **Order Number**      | Auto-generated unique identifier: `ORD-YYYYMMDD-NNNN`                                                |
| **QRIS**              | Quick Response Code Indonesian Standard — a digital payment method                                   |
| **Shift**             | A cashier work session tracking opening/closing cash for cash drawer accountability                  |
| **Opening Cash**      | Cash amount at the start of a shift                                                                   |
| **Closing Cash**      | Cash amount at the end of a shift, entered during shift close                                         |
| **Branch**            | A restaurant location or outlet that groups users, orders, shifts, and activity logs for data isolation. |

### Status Enumerations

| Entity | Field          | Values                              |
| ------ | -------------- | ----------------------------------- |
| User   | role           | `admin`, `cashier`                  |
| Order  | status         | `pending`, `completed`, `cancelled` |
| Order  | payment_method | `cash`, `card`, `qris`              |
| Shift  | status         | `open`, `closed`                    |

---

## 8. 👥 Target Users & Personas

### User Roles

| Role        | Description                                                                                                                  | Access Pattern                                         |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| **Admin**   | Restaurant owner/manager. Full system access. Configures menu, ingredients, recipes, inventory. Views reports and dashboard. Can be **global admin** (`branch_id = null`) with full visibility across all branches, or **branch-scoped admin** (`branch_id` set) acting as a branch manager with visibility limited to their branch. | Primarily uses `/admin/*` routes. Also has POS access. |
| **Cashier** | Front-line staff. Creates orders, views own order history. Scoped to their assigned branch only.                                                                   | Primarily uses `/pos/*` routes. Also sees dashboard.   |

### Permission Matrix

| Feature                                           | Admin    | Cashier  |
| ------------------------------------------------- | -------- | -------- |
| Dashboard (`/dashboard`)                          | ✅       | ✅       |
| POS Terminal (`/pos`)                             | ✅       | ✅       |
| Order History (`/pos/orders/history`)             | ✅ (own) | ✅ (own) |
| Shift Management (`/pos/shifts`)                  | ✅ (all) | ✅ (own) |
| Category CRUD (`/admin/categories`)               | ✅       | ❌ (403) |
| Menu Item CRUD (`/admin/menu-items`)              | ✅       | ❌ (403) |
| Ingredient CRUD (`/admin/ingredients`)            | ✅       | ❌ (403) |
| Recipe Management (`/admin/menu-items/*/recipes`) | ✅       | ❌ (403) |
| Inventory Management (`/admin/inventory`)         | ✅       | ❌ (403) |
| Reports (`/admin/reports`)                        | ✅       | ❌ (403) |
| Profile Edit (`/profile`)                         | ✅       | ✅       |

### Access Enforcement

- Middleware chain: `auth` → `verified` → `role:admin` for admin routes
- Middleware chain: `auth` → `verified` for POS and dashboard routes
- `RoleMiddleware` checks `$request->user()->role` against the required role; returns 403 on mismatch

---

## 9. ✨ UI/UX Principles

### Layout Patterns

- **Authenticated Layout** (`AuthenticatedLayout.tsx`): Persistent top navigation bar with logo, nav links (Dashboard, POS), profile dropdown. Responsive hamburger menu for mobile.
- **Guest Layout** (`GuestLayout.tsx`): Centered card layout for auth pages (login, register, etc.).
- **Page Resolution**: Inertia.js resolves pages from `./Pages/{name}.tsx` via `import.meta.glob`.

### Component Library

| Component           | Purpose                               |
| ------------------- | ------------------------------------- |
| `ApplicationLogo`   | Brand logo SVG                        |
| `Checkbox`          | Styled checkbox input                 |
| `DangerButton`      | Red destructive action button         |
| `Dropdown`          | Headless UI dropdown menu             |
| `InputError`        | Form field error message              |
| `InputLabel`        | Accessible form label                 |
| `Modal`             | Centered modal dialog                 |
| `NavLink`           | Active-state navigation link          |
| `PrimaryButton`     | Main action button                    |
| `ResponsiveNavLink` | Mobile navigation link                |
| `SecondaryButton`   | Alternative action button             |
| `TextInput`         | Styled text input with ref forwarding |

### Form Validation UX

- Server-side validation with Laravel's `validate()` method
- Errors passed to frontend via Inertia's automatic error bag sharing
- `InputError` component displays below respective form fields
- Flash messages (`success`, `error`) displayed after redirects

### Typography

- Primary font: **Figtree** (with system sans-serif fallback)

---

## 10. 🔒 Security & Privacy Rules

### Authentication

- **Model:** Session-based authentication (Laravel Breeze)
- **Password hashing:** bcrypt with 12 rounds (production), 4 rounds (testing)
- **Session driver:** Database-backed
- **Session lifetime:** 120 minutes
- **Session encryption:** Disabled (`SESSION_ENCRYPT=false`)

### Authorization / RBAC

- **Implementation:** Custom `RoleMiddleware` registered as `role` alias in `bootstrap/app.php`
- **Mechanism:** Enum-based role column on `users` table (`admin` | `cashier`)
- **Enforcement:** Route-group middleware `role:admin` protects all `/admin/*` routes
- **No granular permissions:** The system uses a simple binary role check, not a full RBAC/ACL system

### Audit Logging

- **Implemented via ActivityLog model.** The `activity_logs` table records all system changes with user_id, action, model_type, model_id, payload, and ip_address. ActivityLog model prevents updates/deletions to maintain immutability.

### Sensitive Data Handling

- Passwords are hashed (`HashedCast`)
- Password and remember_token are hidden from serialization (`$hidden` on User model)
- `.env` contains database credentials — excluded from git via `.gitignore`
- Default seeder passwords are `password` — **must be changed in production**

---

## 11. 🤖 Coding Conventions & Standards

### File & Directory Naming

| Type               | Convention                          | Example                                         |
| ------------------ | ----------------------------------- | ----------------------------------------------- |
| PHP classes        | PascalCase                          | `MenuItemController.php`                        |
| PHP methods        | camelCase                           | `generateOrderNumber()`                         |
| Eloquent accessors | `get{Attribute}Attribute`           | `getCostAttribute()`                            |
| Migrations         | `YYYY_MM_DD_HHMMSS_description.php` | `2026_02_26_061819_create_menu_items_table.php` |
| React components   | PascalCase `.tsx`                   | `Dashboard.tsx`, `TextInput.tsx`                |
| TypeScript types   | PascalCase interfaces               | `MenuItem`, `OrderItem`                         |
| Routes             | kebab-case URLs                     | `/admin/menu-items`                             |
| Route names        | dot-notation                        | `admin.menu-items.index`                        |
| Database tables    | snake_case, plural                  | `menu_items`, `order_items`                     |
| Database columns   | snake_case                          | `cost_per_unit`, `is_active`                    |

### Code Organization

- **Controllers:** Thin controllers with inline validation. No dedicated service classes or form request classes for most resources (except `ProfileUpdateRequest` and `LoginRequest`).
- **Models:** Business logic in Eloquent accessors and model methods. No repository pattern. Branch-scoped models use `BranchScope` global scope for automatic filtering.
- **Frontend pages:** Each page is a standalone `.tsx` file in `Pages/{Module}/{Action}.tsx`.
- **Type safety:** TypeScript interfaces in `resources/js/types/index.d.ts` mirror Eloquent models.

### Error Handling

- Laravel default exception handler (no customizations in `withExceptions`)
- 403 abort for unauthorized role access
- Database transactions (`DB::transaction()`) wrap order creation to ensure atomicity
- Validation errors via Laravel's built-in validation exception → Inertia error bag

### Logging

- Log channel: `stack` → `single` file
- Log level: `debug` (development)
- Laravel Pail available for real-time log tailing

### API Response Format

- **No REST API.** All responses are Inertia responses (server-rendered React pages with JSON props).
- Flash messages passed via `with('success', '...')` redirect responses.
- Paginated data uses Laravel's standard `paginate()` format with `data`, `links`, `meta` structure.

---

## 12. 🧩 AI Agent Development Rules

### Invention Prohibitions

- ❌ **Never invent database columns** not defined in the migration files under `database/migrations/`
- ❌ **Never invent models or relationships** not present in `app/Models/`
- ❌ **Never invent routes** not defined in `routes/web.php` or `routes/auth.php`
- ❌ **Never invent user roles** beyond `admin` and `cashier`
- ❌ **Never invent order statuses** beyond `pending`, `completed`, `cancelled`
- ❌ **Never invent payment methods** beyond `cash`, `card`, `qris`
- ❌ **Never add REST/API endpoints** unless explicitly requested — the app uses Inertia (server-rendered pages)
- ❌ **Never contradict the COGS calculation** logic (recipe.quantity × ingredient.cost_per_unit)
- ❌ **Never skip inventory deduction** when creating orders

### Document Dependency Enforcement

When a `DOCS_ROOT_PATH` is established, enforce the following:

- ❌ Never generate ERD without existing FSD
- ❌ Never generate API Contract without existing ERD
- ❌ Never invent fields not defined in ERD
- ❌ Never invent flows not defined in FSD
- ❌ Never invent endpoints not defined in API Contract
- ✅ If upstream document changes, flag all downstream documents for regeneration

### Style Matching

- PHP code must follow Laravel Pint conventions
- TypeScript must maintain strict typing (interfaces in `types/index.d.ts`)
- React components follow the existing pattern of functional components with Inertia's `usePage`, `useForm`, `router`
- Database columns use `snake_case`; TypeScript interfaces use `camelCase` for computed properties
- All money values use `DECIMAL(12,2)` in DB and `'decimal:2'` casts in models
- All quantity values use `DECIMAL(12,4)` or `DECIMAL(10,4)` in DB

### Modification Scope Limits

- Changes to database schema require a new migration file — never modify existing migrations
- Changes to routes must update `routes/web.php` and corresponding controllers
- New frontend pages must follow the `Pages/{Module}/{Action}.tsx` pattern
- New models must include appropriate `$fillable`, `casts()`, and relationship methods
- TypeScript types must be updated in `resources/js/types/index.d.ts` when models change

### Risk Acknowledgment

Before making these types of changes, explicitly state the risk and get confirmation:

- Schema migrations (irreversible in production)
- Cascade-delete foreign key changes
- Payment method enum modifications
- Role or permission changes
- Inventory calculation logic changes

### Output Format

- For proposals: Use the Prompter workflow (see `prompter/AGENTS.md`)
- For code changes: Standard git diff / patch format
- For documentation: Raw markdown

### Cascade Regeneration Triggers

When the following change, flag downstream items for review:

- **User model changes** → Update TypeScript `User` interface, auth middleware, seeders
- **Order model changes** → Update `OrderController`, `ReportController`, `DashboardController`, TypeScript `Order` interface
- **MenuItem model changes** → Update `MenuItemController`, `RecipeController`, `OrderController` (COGS calc), TypeScript `MenuItem` interface
- **Recipe/Ingredient changes** → Update COGS calculation in `OrderController.store()`, `MenuItem.getCostAttribute()`
- **Route changes** → Update `AuthenticatedLayout.tsx` navigation, Ziggy route references in frontend
- **Branch model changes** → Update `BranchController`, TypeScript `Branch` interface, all branch-scoped queries

---

## 13. 🗺️ Integration Map

### External Service Integrations

| Service              | Status                    | Notes                                                              |
| -------------------- | ------------------------- | ------------------------------------------------------------------ |
| QRIS payment gateway | **Not integrated**        | Payment method exists as enum value; no actual gateway integration |
| Card payment gateway | **Not integrated**        | Same — enum value only, no processing                              |
| Email service        | **Log driver**            | Configured to log emails, not send them (`MAIL_MAILER=log`)        |
| Redis                | **Configured but unused** | Client configured in `.env` but not used for cache/session/queue   |

### Internal Communication

- All communication is synchronous HTTP between browser and Laravel via Inertia.js
- No microservices, no inter-service messaging, no webhooks

### Async Job Dependencies

- Queue connection: `database` — infrastructure exists but no jobs are dispatched currently
- `queue:listen` is included in `composer dev` for when jobs are added

---

## 14. 🗺️ Roadmap & Future Plans

Based on conversation history and codebase analysis:

### Planned / In-Progress Features

| Feature                      | Status                     | Reference                 |
| ---------------------------- | -------------------------- | ------------------------- |
| Refund & void management     | Implemented                | `CancelOrderController`, `admin.orders.cancel` route |
| Cashier shift management     | Implemented                | `Shift` model, `ShiftController`, `/pos/shifts` routes |
| Transaction History          | Implemented                | `TransactionHistoryController`, `/pos/history` routes |
| Production batch management  | Implementation started     | Conversation history      |
| Business reports & analytics | Implemented                | `ReportController`, `/admin/reports` route |
| PWA Foundation (Phase 1)     | Implemented                | `vite-plugin-pwa`, `public/build/sw.js`, `public/icons/`, `PwaInstallBanner` component |
| Offline Sync Queue           | Implemented                | `useOfflineQueue.ts`, `OfflineSyncBadge.tsx`, IndexedDB `pos-order-queue`, Background Sync SW handler |
| Inventory Transfers          | Implemented                | `InventoryTransfer` model, `InventoryTransferController`, `/admin/inventory-transfers` routes |
| Push Notifications           | Implemented                | `PushSubscription` model, `WebPushChannel`, VAPID keys, `LowStockAlert` / `InventoryTransferStatusUpdate` / `DailySalesSummary` notifications, `PushNotificationPrompt` component |
| Supplier management          | Not started                | -                         |

### Deferred Scope

- Payment gateway integrations (QRIS, card processing)
- Customer management / loyalty program
- Receipt printing integration
- Comprehensive audit trail (audit logging is implemented; additional features like filters and reports can be added)

### Technical Debt Register

| Item                           | Severity | Description                                                                      |
| ------------------------------ | -------- | -------------------------------------------------------------------------------- |
| No service layer               | Medium   | Business logic lives in controllers; should be extracted to service classes      |
| No form requests               | Medium   | Most controllers use inline validation instead of FormRequest classes            |
| Negative inventory allowed     | Medium   | No guard prevents stock going below zero                                         |
| Default seeder passwords       | High     | Admin/cashier seeded with `password` — must change in production                 |
| No image upload                | Low      | MenuItem `image` field exists but no file upload implementation                  |
| Prompter `project.md` template | Low      | Still contains placeholder text, not filled in                                   |
| SQLite→MySQL inconsistency     | Low      | Tests use SQLite in-memory; production uses MySQL. May cause dialect mismatches. |
| `README.md` is boilerplate     | Low      | Default Laravel readme, not project-specific                                     |

---

## 15. ⚠️ Known Issues & Limitations

### Architectural Constraints

- **Single-tenant:** No multi-tenancy support. One database per installation.
- **No API layer:** Frontend is tightly coupled to backend via Inertia.js. No REST/GraphQL API for external consumers.
- **No WebSocket:** Real-time features (e.g., live order updates) are not supported.

### Performance Considerations

- **N+1 queries:** The `OrderController.store()` method loads each MenuItem individually inside a loop. Should use eager loading for bulk orders.
- **No database indexes** beyond primary keys and foreign keys. Large datasets may need indexes on `orders.created_at`, `orders.status`, `order_items.menu_item_id`.
- **No query caching:** All dashboard and report queries hit the database directly.

### Incomplete Implementations

- **Image upload:** The `MenuItem.image` column exists but no file upload/storage logic is implemented.
- **Pending status:** Orders are immediately set to `completed` — no pending → completed flow exists.
- **Pagination inconsistency:** Inventory uses `->get()` (loads all); other listings use `->paginate(15)`.

### Known Bugs / Workarounds

- **Migration enum modification:** The `change_payment_method_enum_in_orders_table` migration uses raw SQL (`ALTER TABLE ... MODIFY COLUMN`). It now guards on `DB::getDriverName() === 'sqlite'` and is skipped on SQLite. The base `create_orders_table` migration was updated to use `qris` directly, keeping SQLite test installs consistent. ✅ Fixed in `add-refund-void-management`.
- **File casing issues:** Windows case-insensitivity has caused import path mismatches (e.g., `Layouts` vs `layouts`). See conversation history.

---

## 16. 🧪 Testing Strategy

### Current State

| Type              | Coverage                    | Location                                               |
| ----------------- | --------------------------- | ------------------------------------------------------ |
| Feature tests     | Auth flows, profile updates | `tests/Feature/Auth/`, `tests/Feature/ProfileTest.php` |
| Unit tests        | Example only                | `tests/Unit/ExampleTest.php`                           |
| Integration tests | Not implemented             | —                                                      |
| E2E tests         | Not implemented             | —                                                      |

### Testing Configuration

- **Framework:** PHPUnit 11.x (Pest plugin allowed via composer config)
- **Database:** SQLite in-memory (`:memory:`) for test isolation
- **Queue:** Sync driver in tests
- **Cache/Session:** Array driver in tests

### Coverage Targets (Aspirational)

Based on conversation history, the team aims for:

- ≥ 80% coverage for critical services (CheckoutService, BomDeductionService, etc.)
- Feature tests for all CRUD operations
- Concurrency tests for order placement

### Missing Test Areas

- Order creation flow (most critical business logic)
- COGS calculation accuracy
- Inventory deduction correctness
- Role-based access control
- Report data accuracy
- Edge cases: empty cart, zero-price items, negative stock

---

## 17. 🧯 Troubleshooting Guide

### Common Failure Modes

| Problem                          | Cause                                                   | Solution                                                                     |
| -------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------- |
| "Page not found" in Inertia      | File casing mismatch (Windows)                          | Ensure `Pages/` directory and file names match exactly (PascalCase)          |
| Migration "table already exists" | Running migrations twice or conflicting migration files | Use `php artisan migrate:fresh` for dev; check for duplicate migration files |
| QRIS payment not accepted        | Enum mismatch between old `other` and new `qris`        | Ensure `change_payment_method_enum` migration has run                        |
| 403 on admin routes              | User role is `cashier`, not `admin`                     | Check user's `role` column; use `AdminSeeder` to create admin user           |
| Vite build fails                 | TypeScript errors or import path issues                 | Run `npx tsc` to check types; verify import paths match file system casing   |

### Debugging Procedures

```bash
# Check application status
php artisan about

# Clear all caches
php artisan config:clear && php artisan cache:clear && php artisan route:clear && php artisan view:clear

# Check routes
php artisan route:list

# Check database connection
php artisan db:show

# Run migrations
php artisan migrate

# Seed default data
php artisan db:seed --class=AdminSeeder
php artisan db:seed --class=SampleDataSeeder

# Tail logs in real-time
php artisan pail

# Run dev environment (all services)
composer dev

# Run tests
php artisan test
```

### Log File Locations

| Log             | Location                   |
| --------------- | -------------------------- |
| Application log | `storage/logs/laravel.log` |
| Vite dev server | Terminal output (stdout)   |
| Queue worker    | Terminal output via `pail` |

### Recovery Procedures

- **Database reset:** `php artisan migrate:fresh --seed` (destroys all data)
- **Cache corruption:** Delete `storage/framework/cache/data/*` and run `php artisan cache:clear`
- **Frontend build issues:** Delete `node_modules/` and `package-lock.json`, then `npm install && npm run build`

---

## 18. 📞 Ownership & Responsibility Map

### Module Ownership

| Module             | Owner                        | Notes                                     |
| ------------------ | ---------------------------- | ----------------------------------------- |
| Entire application | Single developer (ranggacaw) | Solo project based on git repository name |
| Prompter tooling   | External tool                | Spec-driven development framework         |

### Documentation Maintainers

| Document              | Maintainer                                               |
| --------------------- | -------------------------------------------------------- |
| `AGENTS.md` (root)    | AI agents — auto-generated, updated per codebase changes |
| `prompter/AGENTS.md`  | Prompter framework — do not modify                       |
| `prompter/project.md` | Project owner — needs to be filled in                    |

### Escalation Paths

- All decisions escalate to the project owner (single developer)
- No team structure or multi-person escalation needed

---

## 19. 📚 Canonical Documentation Flow

```
Product Brief
    ↓
   PRD (Product Requirements Document)
    ↓
   FSD (Functional Specification Document)
    ↓
   ERD (Entity Relationship Document)
    ↓
API Contract
    ↓
UI Wireframes
    ↓
 TDD-Lite (Technical Design Document)
    ↓
  Epics
    ↓
 Stories
```

> **Current status:** This flow is not yet established. No `DOCS_ROOT_PATH` directory exists with these documents. See Section 23.

---

## 20. 🧩 Document Dependency Rules

| Document      | Requires                                 |
| ------------- | ---------------------------------------- |
| PRD           | Product Brief                            |
| FSD           | PRD                                      |
| ERD           | FSD                                      |
| API Contract  | FSD + ERD                                |
| UI Wireframes | FSD + ERD + API Contract                 |
| TDD-Lite      | FSD + ERD + API Contract + UI Wireframes |
| Epics         | FSD + TDD-Lite                           |
| Stories       | Epics + FSD                              |

### Enforcement Rules

- ❌ Never generate ERD without an existing, approved FSD
- ❌ Never generate API Contract without an existing, approved ERD
- ❌ Never invent fields not defined in ERD
- ❌ Never invent flows not defined in FSD
- ❌ Never invent endpoints not defined in API Contract
- ❌ Never contradict TDD-Lite architectural decisions
- ✅ If an upstream document changes, flag all downstream documents for regeneration

---

## 21. 📐 Source-of-Truth Matrix

| Domain               | Authoritative Source                                                   |
| -------------------- | ---------------------------------------------------------------------- |
| Vision & Scope       | PRD (when created; currently inferred from codebase)                   |
| Behavior & Rules     | FSD (when created; currently in controller logic)                      |
| Data Model           | ERD (when created; currently in migrations + models)                   |
| API Surface          | API Contract (when created; currently in `routes/web.php`)             |
| UX & Screens         | UI Wireframes (when created; currently in React pages)                 |
| Architecture         | TDD-Lite (when created; currently described in this file Section 3)    |
| Work Breakdown       | Epics / Stories (when created; currently in Prompter changes)          |
| COGS Calculation     | `OrderController.store()` + `MenuItem.getCostAttribute()`              |
| Inventory Logic      | `OrderController.store()` + `Inventory.isLowStock()`                   |
| Offline Sync Queue   | `resources/js/hooks/useOfflineQueue.ts` + `resources/js/sw.js`        |
| Push Notifications   | `app/Channels/WebPushChannel.php` + `app/Notifications/` + `resources/js/Components/PushNotificationPrompt.tsx` |
| User Roles           | `database/migrations/*_add_role_to_users_table.php`                    |
| Payment Methods      | `database/migrations/*_change_payment_method_enum_in_orders_table.php` |
| TypeScript Types     | `resources/js/types/index.d.ts`                                        |
| Coding Style         | Laravel Pint configuration                                             |
| Spec-Driven Workflow | `prompter/AGENTS.md`                                                   |

---

## 22. 🔁 Regeneration Rules

When upstream documents or code artifacts change, the following downstream items must be reviewed and potentially regenerated:

| Change                | Regenerate                                                             |
| --------------------- | ---------------------------------------------------------------------- |
| Product Brief changes | → PRD, FSD, ERD, API Contract, UI Wireframes, TDD-Lite, Epics, Stories |
| PRD changes           | → FSD, ERD, API Contract, UI Wireframes, TDD-Lite, Epics, Stories      |
| FSD changes           | → ERD, API Contract, UI Wireframes, TDD-Lite, Epics, Stories           |
| ERD changes           | → API Contract, UI Wireframes, TDD-Lite, Epics, Stories                |
| API Contract changes  | → UI Wireframes, TDD-Lite, Epics, Stories                              |
| UI Wireframes changes | → TDD-Lite, Epics, Stories                                             |
| TDD-Lite changes      | → Epics, Stories                                                       |

### Code-Level Cascade Rules

| Code Change               | Must Update                                                                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Migration file added      | → Model `$fillable`, `casts()`, relationships; TypeScript interfaces in `types/index.d.ts`; Controllers using the model; Seeders if sample data needed |
| Model relationship added  | → Controller methods that should eager-load; TypeScript interface optional properties                                                                  |
| Route added/changed       | → Controller method; Frontend page component; `AuthenticatedLayout.tsx` navigation if top-level                                                        |
| Controller method changed | → Frontend page props; TypeScript `PageProps` definitions                                                                                              |
| Validation rules changed  | → Frontend form fields and error handling                                                                                                              |
| Role/permission changed   | → `RoleMiddleware`, `bootstrap/app.php`, frontend permission checks                                                                                    |

---

## 23. ⏳ Missing Information

### DOCS_ROOT_PATH Not Found

No documentation directory matching the expected `DOCS_ROOT_PATH` structure was found. The following documents do not exist anywhere in the project:

| Document           | Status     | Impact                                                |
| ------------------ | ---------- | ----------------------------------------------------- |
| `product_brief.md` | ❌ Missing | Vision and business context undocumented              |
| `prd.md`           | ❌ Missing | Product requirements undocumented                     |
| `fsd.md`           | ❌ Missing | Functional specifications undocumented                |
| `erd.md`           | ❌ Missing | ERD inferred from migrations + models (see Section 6) |
| `api_contract.md`  | ❌ Missing | Routes inferred from `routes/web.php` (see Section 4) |
| `ui_wireframes.md` | ❌ Missing | UI inferred from React pages                          |
| `tdd_lite.md`      | ❌ Missing | Architecture inferred from codebase (see Section 3)   |
| `epics.md`         | ❌ Missing | Work breakdown partially in Prompter changes          |
| `stories.md`       | ❌ Missing | Story-level breakdown not found                       |

**Recommendation:** Create a `docs/` directory at the project root and populate it with the above documents to enable the full documentation governance flow described in Sections 19–22. Use the `/product-brief`, `/proposal`, and `/epic-generator` workflows available in `.agent/workflows/` to bootstrap these documents.

### Other Missing Information

| Item                              | Details                                                                                                                          |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Deployment process**            | No deployment scripts, Dockerfiles, or CI/CD pipelines found (`.github/` contains only prompt templates, no workflow YAML files) |
| **Environment-specific configs**  | Only `.env` and `.env.example` exist; no staging/production configs                                                              |
| **Backup strategy**               | No database backup procedures documented                                                                                         |
| **Monitoring / observability**    | No APM, health checks (beyond `/up`), or error tracking configured                                                               |
| **API rate limiting**             | No rate limiting configured for order creation or admin operations                                                               |
| **Image upload implementation**   | `MenuItem.image` field exists but no file upload controller/storage logic                                                        |
| **Multi-language support**        | Conversation history mentions ID/EN language switching, but no i18n setup found in codebase                                      |
| **Production seeder credentials** | `AdminSeeder` uses plaintext `password` — production credentials not documented                                                  |
| **`prompter/project.md`**         | Still contains placeholder template text; project conventions not filled in                                                      |

---

<!-- PROMPTER:START -->

# Prompter Instructions

These instructions are for AI assistants working in this project.

Always open `@/prompter/AGENTS.md` when the request:

- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/prompter/AGENTS.md` to learn:

- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines
- Show Remaining Tasks

<!-- PROMPTER:END -->
