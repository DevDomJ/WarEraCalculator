# WarEra Calculator - Project Documentation

## Table of Contents
- [Overview](#overview)
- [What is WarEra.io?](#what-is-wareraio)
- [Project Purpose](#project-purpose)
- [Architecture](#architecture)
- [Feature Status](#feature-status)
- [Related Documentation](#related-documentation)

---

## Overview

The **WarEra Calculator** is a companion web application for the browser game [WarEra.io](https://warera.io). It provides market analytics, production tracking, and profit calculation tools that the game itself does not offer.

**Repository:** [github.com/DevDomJ/WarEraCalculator](https://github.com/DevDomJ/WarEraCalculator)

---

## What is WarEra.io?

WarEra.io is a browser-based geopolitical simulation game where:
- The entire economy is **player-driven** — all resources and goods traded on the market must be produced by players in their factories
- Players belong to countries and can participate in elections to join the government
- Government members vote on war declarations, alliances, and tax rates
- Countries earn money through trade taxes, salary taxes, and direct player donations
- The game is still in active development and lacks many quality-of-life features, especially around statistics and financial tracking

---

## Project Purpose

The game currently lacks tools for players to:
1. **Track market trends** — How do prices change over time?
2. **View market depth** — What buy/sell orders exist for each item?
3. **Calculate profitability** — Given wage level X, production bonus Y, and selling price Z, what would the profit be?
4. **Track production efficiency** — How does actual production compare to expected output?
5. **Understand bonus sources** — What production bonuses come from country, party ethics, and deposits?

This application fills those gaps by:
- Periodically fetching market data from the WarEra API and storing it historically
- Providing interactive visualizations of price trends with multiple data series
- Offering calculators for production profitability with scenario comparison
- Tracking production history and efficiency metrics
- Calculating production bonuses from country specialization, party ethics, and regional deposits

---

## Architecture

### Technology Stack

| Component      | Technology                    | Notes                                    |
|----------------|-------------------------------|------------------------------------------|
| **Backend**    | NestJS (TypeScript)           | REST API + scheduled data collection     |
| **Frontend**   | React + Vite (TypeScript)     | SPA with charts, tables, drag & drop     |
| **Database**   | SQLite with Prisma ORM        | Deliberate decision — see below          |
| **Deployment** | Raspberry Pi 4                | Runs 24/7 for continuous data collection |
| **Process Mgr**| pm2                           | Keeps production backend running         |

> ### Design Decision — SQLite (final)
>
> **Status: Final decision — no migration to PostgreSQL planned.**
>
> The original plan (requirements.md) specified PostgreSQL as the database.
> After evaluation, **SQLite was deliberately and permanently chosen**.
>
> **Rationale:**
>
> | Criterion              | SQLite                          | PostgreSQL                     |
> |------------------------|---------------------------------|--------------------------------|
> | Deployment complexity  | No separate DB needed           | Requires own server process    |
> | Resource consumption   | Minimal (ideal for Raspberry Pi)| Higher (RAM, CPU, Disk I/O)    |
> | Backup                 | Copy a single file              | pg_dump / pg_basebackup        |
> | Usage scenario         | Single-user application         | Multi-user / high concurrency  |
> | Maintenance            | Maintenance-free                | Vacuuming, monitoring, updates |
>
> **Deviation from requirements.md:**
> The `requirements.md` still lists PostgreSQL as the original requirement
> and is kept as a historical document. The actual implementation uses
> SQLite — this deviation is deliberate and documented here.
>
> Should the usage scenario fundamentally change in the future
> (e.g., multi-user, remote access with high concurrency), a migration
> can be re-evaluated. Until then, SQLite is the production database.

### Environment Separation

| Aspect       | Development          | Production            |
|--------------|----------------------|-----------------------|
| Backend Port | 3000                 | 4000                  |
| Frontend Port| 5173                 | —                     |
| Database     | `backend/prisma/dev.db` | Separate location (see PRODUCTION_DEPLOY.md) |
| Start        | `cd backend && npm run start:dev` | pm2 (process: `warera-prod`) |
| Lifecycle    | Manual start/stop    | Runs 24/7             |

> **CRITICAL:** Development and production are completely isolated in separate directories. Production location is documented in `PRODUCTION_DEPLOY.md` (private, not in repo).

### Project Structure

```
WarEraCalculator/
├── AGENTS.md                 # AI agent guidelines (operational)
├── README.md                 # Quick start guide
├── docs/                     # Project documentation
│   ├── PROJECT.md            # This file — main documentation
│   ├── FEATURES.md           # Detailed feature documentation
│   ├── GAME_MECHANICS.md     # WarEra game mechanics reference
│   ├── DEVELOPMENT.md        # Developer & contributor guide
│   ├── warEraApiDocumentation.md  # WarEra API reference
│   ├── plan.md               # Original implementation plan (historical)
│   ├── requirements.md       # Original requirements (historical)
│   └── techStack.md          # Technology stack reference (historical)
├── .kiro/                    # Kiro AI agent configuration
│   └── steering/             # Agent behavior rules
├── backend/                  # NestJS backend application
│   ├── src/
│   │   ├── config/           # Static configuration files
│   │   │   ├── item-categories.ts    # Item category mappings
│   │   │   ├── item-display-names.ts # Item display name mappings
│   │   │   └── ethics.json           # Party ethics bonus config
│   │   ├── modules/
│   │   │   ├── warera-api/           # HTTP client with rate limiting
│   │   │   ├── game-config/          # Game configuration & items
│   │   │   ├── market-price/         # Price fetching & storage
│   │   │   ├── trading-order/        # Order fetching with batch support
│   │   │   ├── items/                # Items REST API
│   │   │   ├── price-history/        # Price history REST API
│   │   │   ├── data-collection/      # Cron job scheduler (every 5 min)
│   │   │   ├── company/              # Company management & workers
│   │   │   ├── production-calculator/# Production metrics & profit
│   │   │   ├── production-analytics/ # Production tracking & history
│   │   │   ├── production-bonus/     # Bonus calculation (country, party, deposit)
│   │   │   └── ethics/               # Party ethics bonus resolution
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   └── prisma.service.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
└── frontend/                 # React frontend application
    ├── src/
    │   ├── api/
    │   │   └── client.ts             # API client with TypeScript interfaces
    │   ├── pages/
    │   │   ├── GoodsOverview.tsx      # Market overview with categories
    │   │   ├── ItemDetail.tsx         # Item detail with charts & orders
    │   │   ├── CompaniesList.tsx      # Companies list with drag & drop
    │   │   └── CompanyDetail.tsx      # Company detail with metrics & profit
    │   ├── components/
    │   │   ├── ProductionTracker.tsx          # Daily production input
    │   │   ├── ProductionHistoryChart.tsx     # Production history chart
    │   │   ├── ProductionBonusTooltip.tsx     # Bonus breakdown tooltip
    │   │   ├── ProfitSection.tsx              # Profit scenario display
    │   │   ├── InfoTooltip.tsx                # Reusable info tooltip
    │   │   └── ItemIcon.tsx                   # Reusable item icon
    │   ├── utils/
    │   │   └── format.ts             # Formatting utilities
    │   ├── App.tsx
    │   └── main.tsx
    └── package.json
```

---

## Feature Status

This table tracks all planned features and their implementation status.

| # | Feature | Status | Details |
|---|---------|--------|---------|
| F-01 | Market price data collection | ✅ Implemented | Cron job every 5 min, stores prices with volume & order data |
| F-02 | Historical price storage | ✅ Implemented | SQLite via Prisma, includes volume, highest buy, lowest sell |
| F-03 | API integration (WarEra API) | ✅ Implemented | Authentication, rate limiting, retry, batch support |
| F-04 | Dev/Prod environment separation | ✅ Implemented | Isolated directories, separate ports and databases |
| F-05 | Production deployment (pm2) | ✅ Implemented | 24/7 data collection on Raspberry Pi |
| F-06 | Trading order display (buy/sell) | ✅ Implemented | Top buy/sell orders shown in item detail page |
| F-07 | Price trend charts | ✅ Implemented | Interactive charts with avg price, highest buy, lowest sell, volume |
| F-08 | Production profit calculator | ✅ Implemented | Scenario A (buy inputs) vs Scenario B (self-produce) |
| F-09 | Salary expense tracking | ❌ Not started | Track how much spent on worker salaries |
| F-10 | Trade income tracking | ❌ Not started | Track revenue from selling goods |
| F-11 | Financial dashboard / overview | ❌ Not started | Combined view of income, expenses, profit |
| F-12 | Responsive UI | ✅ Implemented | Tailwind CSS responsive grid, works on desktop and mobile |
| F-13 | Item catalog with game config | ✅ Implemented | Categories, display names, icons, full item grid |
| F-14 | Batch API requests | ✅ Implemented | Trading orders batched (30 items per batch) |
| F-15 | Company management | ✅ Implemented | Fetch companies by userId, worker details, drag & drop reorder |
| F-16 | Production analytics | ✅ Implemented | Track actual vs expected PP, efficiency metrics, 30-day chart |
| F-17 | Production bonus calculation | ✅ Implemented | Country specialization, party ethics, regional deposits |
| F-18 | Ethics system integration | ✅ Implemented | Industrialism & agrarianism bonuses from ruling party |

> **For detailed feature documentation including requirements and design decisions, see [FEATURES.md](./FEATURES.md).**

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| [FEATURES.md](./FEATURES.md) | Detailed feature requirements, design decisions, and implementation notes |
| [GAME_MECHANICS.md](./GAME_MECHANICS.md) | WarEra.io game mechanics reference (formulas, rules) |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Setup guide, coding conventions, contribution guidelines |
| [warEraApiDocumentation.md](./warEraApiDocumentation.md) | WarEra API endpoint reference |
| [AGENTS.md](../AGENTS.md) | Operational guidelines for AI coding agents |

### Historical Documents

These documents reflect the original planning phase and are kept for reference. The actual implementation may differ (e.g., SQLite instead of PostgreSQL).

| Document | Purpose |
|----------|---------|
| [plan.md](./plan.md) | Original phased implementation plan |
| [requirements.md](./requirements.md) | Original requirements specification |
| [techStack.md](./techStack.md) | Original technology stack evaluation |

---

## Maintaining This Documentation

When implementing new features or making changes:

1. **Update the Feature Status table** in this file
2. **Add/update the feature entry** in [FEATURES.md](./FEATURES.md)
3. **Update [GAME_MECHANICS.md](./GAME_MECHANICS.md)** if new game formulas are discovered
4. **Update [DEVELOPMENT.md](./DEVELOPMENT.md)** if setup steps or conventions change
5. **Update [AGENTS.md](../AGENTS.md)** if operational parameters change (ports, paths, etc.)

> **Note for AI Coding Agents:** After implementing a feature, always update the corresponding documentation. The feature status table in this file is the single source of truth for what is and isn't implemented.
