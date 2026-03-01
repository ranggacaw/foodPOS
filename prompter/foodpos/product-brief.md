# FoodPOS

## Executive Summary

**An all-in-one restaurant point-of-sale system that unifies ordering, menu management, recipe costing, inventory tracking, and profitability reporting into a single, modern web application.**

---

## At a Glance

|                   |                                                              |
| ----------------- | ------------------------------------------------------------ |
| **Product Type**  | Point of Sale (POS) — Food & Beverage                        |
| **Target Market** | Restaurants, cafés, and food outlets (single-location)       |
| **Platform**      | Web Application (Browser-based SPA)                          |
| **Technology**    | Laravel 12 · React 18 · TypeScript · Inertia.js · MySQL      |
| **Status**        | Active Development — Core POS operational, modules expanding |

---

## Product Overview

### What is FoodPOS?

FoodPOS is a self-hosted, web-based Point of Sale system purpose-built for the food service industry. It goes beyond simple order-taking by integrating **recipe-level cost tracking (COGS)**, **real-time inventory deduction**, and **profitability analytics** — giving restaurant owners complete visibility into both their sales and their margins from a single dashboard.

### The Problem We Solve

| Challenge                                       | Impact                                                                                     |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Manual order processing is slow and error-prone | Lost revenue from mistakes, long wait times, poor customer experience                      |
| Ingredient costs are tracked separately         | Owners don't know true profitability per dish until monthly accounting reviews             |
| Inventory is managed on spreadsheets            | Stockouts surprise kitchen staff mid-service; over-ordering wastes perishable ingredients  |
| Sales data lives in disconnected systems        | Decision-making is delayed and based on gut feeling rather than real-time data             |
| Existing POS solutions are expensive            | High monthly SaaS fees or hardware lock-in makes modern POS inaccessible for small outlets |

### Our Solution

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  POS Terminal │────▶│  Order Engine │────▶│  Inventory   │
│  (Cashier UI) │     │  (COGS Calc)  │     │  Auto-Deduct │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                    ┌───────▼───────┐
                    │   Reporting   │
                    │   & Analytics │
                    └───────────────┘

Order Flow: Browse Menu → Add to Cart → Select Payment → Auto-calculate COGS
            → Auto-deduct Inventory → Generate Order Number → View Reports
```

---

## Core Capabilities

### 1️⃣ POS Terminal — Fast, Intuitive Ordering

- Category-based menu browsing with active/inactive filtering
- Real-time cart management with quantity adjustment
- Multiple payment methods: **Cash**, **Card**, **QRIS** (Indonesian digital payment)
- Auto-generated sequential order numbers (`ORD-YYYYMMDD-NNNN`)
- Configurable tax rate (default 10%)
- Cashier-specific order history with detail views

### 2️⃣ Menu & Recipe Management — Full Bill-of-Materials

- CRUD for categories with sort ordering and active/inactive toggling
- Menu item management with pricing, descriptions, and category assignment
- **Recipe / BOM (Bill of Materials)** per menu item linking ingredients with precise quantities
- Automatic COGS calculation: `Σ(recipe.quantity × ingredient.cost_per_unit)`
- Food cost percentage display per item for margin visibility

### 3️⃣ Ingredient & Inventory Control — Automated Stock Tracking

- Ingredient registry with unit types (`kg`, `liter`, `pcs`) and cost-per-unit
- Automatic inventory record creation when ingredients are added
- **Real-time inventory deduction** on every order based on recipe BOM
- Configurable restock thresholds with low-stock alerts
- Dashboard KPI for at-a-glance low-stock count

### 4️⃣ Reporting & Analytics — Data-Driven Decisions

- Date-range filtered sales reports
- Revenue breakdown with order counts
- COGS and gross profit calculation per period
- Top-selling items ranking
- Real-time dashboard with today's orders, revenue, and stock alerts

### 5️⃣ User & Access Control — Role-Based Security

- Two-tier role system: **Admin** (full access) and **Cashier** (POS only)
- Session-based authentication via Laravel Breeze
- Middleware-enforced route protection (`role:admin` for management routes)
- Profile management with secure password handling

---

## Key Benefits

| Icon | Benefit                 | Description                                                                                      |
| ---- | ----------------------- | ------------------------------------------------------------------------------------------------ |
| ⏱️   | **Speed of Service**    | Streamlined POS terminal reduces order processing time with category browsing and quick-add cart |
| ✅   | **Accurate Costing**    | Automatic COGS calculation per order ensures you know your true margins on every ticket          |
| 📊   | **Real-Time Insights**  | Dashboard KPIs and filterable reports replace guesswork with data-driven decision making         |
| 🔐   | **Role-Based Access**   | Admin and Cashier roles ensure staff only access what they need — no accidental data changes     |
| 📁   | **Automated Inventory** | Every order automatically deducts ingredients; low-stock alerts prevent mid-service stockouts    |
| 🔄   | **Self-Hosted Control** | Full ownership of data and infrastructure — no recurring SaaS fees or vendor lock-in             |

---

## User Roles Supported

| Role        | Primary Functions                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------------ |
| **Admin**   | Configure menu items, manage ingredients & recipes, control inventory, view reports, manage users, and operate POS |
| **Cashier** | Create orders via POS terminal, view own order history, access dashboard KPIs                                      |

---

## System Architecture / Modules

```
┌──────────────────────────────────────────────────────────┐
│                   Browser (React SPA)                     │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌────────┐  │
│  │   POS    │  │   Admin   │  │ Dashboard│  │  Auth  │  │
│  │ Terminal │  │  Panels   │  │   KPIs   │  │Profile │  │
│  └──────────┘  └───────────┘  └──────────┘  └────────┘  │
│                     Inertia.js + Ziggy                    │
└─────────────────────────┬────────────────────────────────┘
                          │  HTTP (HTML + JSON props)
┌─────────────────────────┴────────────────────────────────┐
│                  Laravel 12 Backend                        │
│  ┌────────────────┐  ┌─────────────────────────────────┐  │
│  │  Controllers   │  │  Models (Eloquent ORM)           │  │
│  │  ─ POS/Order   │  │  ─ User, Category, MenuItem     │  │
│  │  ─ Admin/*     │  │  ─ Ingredient, Recipe, Inventory│  │
│  │  ─ Dashboard   │  │  ─ Order, OrderItem             │  │
│  │  ─ Auth/Profile│  │                                  │  │
│  └────────────────┘  └─────────────────────────────────┘  │
│                    Middleware (Auth + Role)                 │
└─────────────────────────┬────────────────────────────────┘
                          │
                ┌─────────┴─────────┐
                │   MySQL Database  │
                │    (8 tables)     │
                └───────────────────┘
```

**Total Modules:** 7 core modules — POS Terminal, Menu Management, Recipe/BOM, Ingredient & Inventory, Reporting, Dashboard, User & Auth

---

## Infrastructure Highlights

- **Self-Hosted Architecture** — Runs on Laragon (or any LAMP/LEMP stack) with zero cloud dependency
- **Modern Build Pipeline** — Vite 7.x for lightning-fast HMR and production builds
- **Type-Safe Full Stack** — TypeScript on the frontend mirrors Eloquent models for compile-time safety
- **Database-Backed Sessions** — Reliable session persistence without Redis dependency
- **Atomic Transactions** — Order placement wrapped in `DB::transaction()` for data integrity
- **Concurrent Dev Server** — Single `composer dev` command starts backend, queue worker, log tailer, and Vite simultaneously

---

## Food & Beverage Feature Highlights

### Menu Management

- ✅ Category-based organization with sort ordering
- ✅ Active/inactive menu item toggling (seasonal menus)
- ✅ Price management with decimal precision (`DECIMAL(12,2)`)
- ✅ Item descriptions and image field support

### Recipe & Costing

- ✅ Bill of Materials (BOM) per menu item
- ✅ Multi-ingredient recipes with precise quantities (`DECIMAL(10,4)`)
- ✅ Automatic COGS calculation per item and per order
- ✅ Food cost percentage tracking for margin optimization

### Inventory Workflow

```
Ingredient Created → Inventory Record Auto-Created (qty=0)
        │
Order Placed → Recipe BOM Evaluated → Inventory Deducted
        │
Stock Check → quantity_on_hand ≤ restock_threshold → ⚠️ Low-Stock Alert
```

### Payment Processing

- ✅ Cash payments
- ✅ Card payments
- ✅ QRIS (Quick Response Code Indonesian Standard) digital payments
- ✅ Configurable tax rate (default 10%, adjustable 0–100%)

---

## Dashboard & Analytics

| Widget               | Purpose                                              |
| -------------------- | ---------------------------------------------------- |
| **Today's Orders**   | Real-time count of orders placed today               |
| **Today's Revenue**  | Running total of today's sales revenue               |
| **Low-Stock Alerts** | Count of ingredients below restock threshold         |
| **Sales Report**     | Date-range revenue, orders, COGS, and gross profit   |
| **Top Sellers**      | Ranking of best-performing menu items by volume      |
| **Profitability**    | Gross profit trends calculated from sales minus COGS |

---

## Competitive Advantages

| Feature                    | FoodPOS                       | Traditional POS / Spreadsheets |
| -------------------------- | ----------------------------- | ------------------------------ |
| Integrated COGS Tracking   | ✅ Automatic per-order        | ❌ Manual monthly calculation  |
| Recipe-Based Inventory     | ✅ Auto-deduction on order    | ❌ Manual stock counting       |
| Real-Time Analytics        | ✅ Live dashboard KPIs        | ❌ End-of-day batch reports    |
| Self-Hosted / No SaaS Fees | ✅ One-time setup             | ❌ Monthly subscription fees   |
| Multi-Payment Support      | ✅ Cash + Card + QRIS         | ❌ Often cash-only or limited  |
| Food Cost % Visibility     | ✅ Per-item margin tracking   | ❌ Aggregated at best          |
| Modern Web Interface       | ✅ React SPA, mobile-friendly | ❌ Legacy desktop software     |
| Open-Source / Customizable | ✅ Full source code access    | ❌ Vendor-locked features      |

---

## Roadmap Considerations

### Current State

- Core POS terminal is fully operational with order creation and history
- Menu, ingredient, recipe, and inventory CRUD is complete
- Sales reporting with date-range filtering is functional
- Dashboard with real-time KPIs is live
- Role-based access control (Admin / Cashier) is enforced

### Potential Enhancements

| Priority  | Enhancement                  | Description                                                     |
| --------- | ---------------------------- | --------------------------------------------------------------- |
| 🔴 High   | Refund & Void Management     | Allow admins to cancel or refund completed orders               |
| 🔴 High   | Cashier Shift Management     | Track shifts with open/close totals and cash reconciliation     |
| 🟡 Medium | Production Batch Management  | Manage prep batches for high-volume ingredient usage            |
| 🟡 Medium | Business Reports & Analytics | Advanced analytics with trend visualization and export          |
| 🟡 Medium | Supplier Management          | Track suppliers, purchase orders, and cost history              |
| 🟢 Low    | Payment Gateway Integration  | Connect to real QRIS and card processing providers              |
| 🟢 Low    | Multi-Branch / Multi-Tenant  | Support multiple restaurant locations under one instance        |
| 🟢 Low    | Customer Loyalty Program     | Track repeat customers and offer rewards/discounts              |
| 🟢 Low    | Receipt Printing             | Thermal printer integration for customer receipts               |
| 🟢 Low    | Audit Trail                  | Comprehensive logging of all data changes with user attribution |

---

## Technical Foundation

| Component           | Choice                | Why                                                                     |
| ------------------- | --------------------- | ----------------------------------------------------------------------- |
| Backend Framework   | Laravel 12 (PHP 8.2+) | Rapid development, rich ecosystem, Eloquent ORM for clean data modeling |
| Frontend Framework  | React 18 + TypeScript | Type-safe, component-driven UI with massive community support           |
| SSR Bridge          | Inertia.js 2.x        | Eliminates need for separate API layer; server-rendered SPA UX          |
| CSS Framework       | Tailwind CSS 3.x      | Utility-first CSS for rapid, consistent UI styling                      |
| Database            | MySQL 8.x             | Battle-tested relational DB with DECIMAL precision for financial data   |
| Build Tool          | Vite 7.x              | Instant HMR, fast builds, native ES module support                      |
| Authentication      | Laravel Breeze        | Secure, scaffolded auth with minimal overhead                           |
| Client-Side Routing | Ziggy 2.x             | Named route references in JavaScript matching Laravel routes            |

---

## Getting Started

### For New Implementations

1. Clone the repository and install dependencies:
    ```bash
    composer install && npm install
    ```
2. Configure environment: copy `.env.example` to `.env` and set `DB_*` credentials
3. Generate application key: `php artisan key:generate`
4. Run migrations and seed data:
    ```bash
    php artisan migrate --seed
    ```
5. Start the development environment:
    ```bash
    composer dev
    ```
6. Access the application at `http://localhost:8000`
7. Login with seeded admin credentials (Email: from `AdminSeeder`, Password: `password`)

### For Existing Users

- Run `php artisan migrate` after pulling updates to apply new database migrations
- Use `php artisan db:seed --class=SampleDataSeeder` to populate demo data
- Check `php artisan route:list` to view all available endpoints
- Review `AGENTS.md` for complete system documentation

---

## Summary

**FoodPOS transforms restaurant operations by:**

1. **Unifying ordering and costing** — Every order automatically calculates ingredient costs, giving instant visibility into per-ticket profitability
2. **Automating inventory management** — Recipe-based stock deduction eliminates manual counting and prevents stockout surprises
3. **Enabling data-driven decisions** — Real-time dashboard KPIs and filterable sales reports replace gut-feeling management
4. **Reducing operational costs** — Self-hosted architecture with zero monthly SaaS fees and full data ownership
5. **Scaling with the business** — Modular architecture with a clear roadmap for shifts, suppliers, multi-branch, and payment gateway integrations

---

## Document Information

|                        |                             |
| ---------------------- | --------------------------- |
| **Version**            | 1.0                         |
| **Date**               | 2026-03-02                  |
| **Classification**     | Internal — Product Overview |
| **Full Specification** | `AGENTS.md` (root)          |
| **Owner**              | ranggacaw                   |
