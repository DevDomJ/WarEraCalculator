# WarEra Calculator - Development Guide

## Table of Contents
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Conventions](#coding-conventions)
- [Database](#database)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Notes for AI Coding Agents](#notes-for-ai-coding-agents)

---

## Prerequisites

- **Node.js** v22+ LTS
- **npm** (comes with Node.js)
- **Git**

> **Note:** No external database server is required. The project uses SQLite (embedded via Prisma). See [Database](#database) for details.

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/DevDomJ/WarEraCalculator.git
cd WarEraCalculator
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Environment Configuration

Create a `.env` file in the `backend/` directory:

```env
# Copy from .env.example and fill in your values
WARERA_API_KEY=your_api_key_here
DATABASE_URL="file:./prisma/dev.db"
PORT=3000
```

> **⚠️ Never commit the `.env` file.** It contains your personal API key.

### 4. Database Setup

```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Start Development Server

```bash
npm run start:dev
```

The backend will be available at `http://localhost:3000`.

### 6. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## Project Structure

For the full project directory tree, see [PROJECT.md — Project Structure](./PROJECT.md#project-structure).

Key directories for development:

```
backend/src/modules/    # NestJS feature modules (11 modules)
backend/src/config/     # Static configuration (categories, display names)
backend/prisma/         # Database schema & migrations
frontend/src/pages/     # Page-level React components (6 pages)
frontend/src/components/# Reusable React components (9 components)
frontend/src/api/       # API client with TypeScript interfaces
frontend/src/utils/     # Formatting utilities
```

---

## Development Workflow

### Running the Backend

```bash
cd backend
npm run start:dev    # Development with hot-reload
npm run build        # Build for production
npm run start:prod   # Run production build locally
```

### Running the Frontend

```bash
cd frontend
npm run dev          # Development with HMR
npm run build        # Build for production
npm run preview      # Preview production build
```

### Database Operations

```bash
npx prisma studio         # Visual database browser
npx prisma migrate dev     # Apply pending migrations (dev only)
npx prisma generate        # Regenerate Prisma client after schema changes
```

---

## Coding Conventions

### General
- **Language:** TypeScript (strict mode)
- **Style:** Follow existing code patterns
- **Node.js:** v22+ LTS required (see `engines` in package.json)

### Backend (NestJS)
- Use **modules** to organize features
- Use **services** for business logic
- Use **controllers** for HTTP endpoints
- Follow NestJS naming conventions: `*.module.ts`, `*.service.ts`, `*.controller.ts`
- Static configuration goes in `src/config/`

### Frontend (React)
- Functional components with hooks
- Use `@tanstack/react-query` for data fetching
- Use Tailwind CSS for styling
- Keep components small and focused
- Reusable components in `src/components/`
- Page-level components in `src/pages/`

---

## Database

### Engine: SQLite

The project uses **SQLite** via **Prisma ORM**. This is a deliberate and final decision — PostgreSQL is not used. See [PROJECT.md — Design Decision](./PROJECT.md#design-decision--sqlite-final) for the full rationale.

### Schema Location
`backend/prisma/schema.prisma`

### Models

| Model | Purpose | Status |
|-------|---------|--------|
| `Item` | Goods catalog (item codes, names, categories, production data) | ✅ |
| `PriceHistory` | Historical price data (price, volume, highest buy, lowest sell) | ✅ |
| `TradingOrder` | Current buy/sell orders snapshot | ✅ |
| `Company` | User's companies (type, region, production value, automated engine) | ✅ |
| `Worker` | Company workers (wage, energy, production, fidelity) | ✅ |
| `ProductionHistory` | Production tracking (actual vs expected PP, variance) | ✅ |

### Migrations
Always create migrations for schema changes:
```bash
npx prisma migrate dev --name descriptive_name
```

---

## API Reference

### WarEra API

- **Base URL:** `https://api2.warera.io/trpc`
- **Docs:** https://api2.warera.io/docs/
- **Auth:** `X-API-Key` header
- **Rate Limit:** 200 requests/minute
- **Batch Support:** `?batch=1` query parameter
- **Full reference:** [warEraApiDocumentation.md](./warEraApiDocumentation.md)

### Internal API (Backend → Frontend)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/items` | All items with current prices, categories, display names |
| GET | `/api/items/:code` | Single item details |
| GET | `/api/prices/:itemCode?days=X` | Price history (default 30 days) |
| GET | `/api/prices/:itemCode/orders` | Current buy/sell orders |
| POST | `/api/data-collection/trigger` | Manually trigger data collection |
| POST | `/api/companies/fetch` | Fetch companies from WarEra API by userId |
| GET | `/api/companies/user/:userId` | Get cached companies with profit metrics and summary |
| POST | `/api/companies/user/:userId/refresh` | Refresh companies from API |
| GET | `/api/companies/:id` | Get single company with production bonus |
| POST | `/api/companies/:id/refresh` | Refresh single company from API |
| GET | `/api/companies/:id/worker/:workerId/stats?days=X` | Worker daily production stats (default 30 days) |
| POST | `/api/companies/reorder` | Reorder companies (drag & drop) |
| GET | `/api/production/recipes` | All production recipes |
| GET | `/api/production/:companyId/metrics` | Production metrics calculation |
| GET | `/api/production/:companyId/profit` | Profit scenario comparison |
| POST | `/api/analytics/:companyId/track` | Track daily production |
| GET | `/api/analytics/:companyId/history?days=X` | Production history |
| GET | `/api/analytics/:companyId?days=X` | Analytics summary |
| GET | `/api/mu/user/:userId` | MU membership and owned MUs for a user |
| GET | `/api/mu/:muId` | MU detail with enriched member stats |

---

## Deployment

### Production Environment
- Runs on **Raspberry Pi 4**
- Managed by **pm2** (process name: `warera-prod`)
- Backend on **port 4000**
- Database in a separate, isolated location

### Deployment Steps

1. **Build** (in development directory):
   ```bash
   cd backend && npm run build
   cd ../frontend && npm run build
   ```

2. **Deploy**: See `PRODUCTION_DEPLOY.md` (private file, not in repository)

3. **Only deploy** the `dist/` folders (compiled output)

4. **Restart production**:
   ```bash
   pm2 restart warera-prod
   ```

### Important Rules
- **NEVER** modify the production directory during development
- **ALWAYS** test in development first
- **ONLY** deploy compiled code (`dist/`)
- Development and production databases are **completely separate**
- **NEVER** copy database files between environments

---

## Notes for AI Coding Agents

### Before Making Changes
1. Read `AGENTS.md` in the project root for operational guidelines
2. Read this file for development conventions
3. Check [FEATURES.md](./FEATURES.md) for feature requirements and status
4. Check [GAME_MECHANICS.md](./GAME_MECHANICS.md) for game formulas

### After Making Changes
1. Update feature status in [PROJECT.md](./PROJECT.md)
2. Update feature details in [FEATURES.md](./FEATURES.md)
3. Update [GAME_MECHANICS.md](./GAME_MECHANICS.md) if game formulas changed
4. Update this file if setup steps or conventions changed

### Common Pitfalls
- **Do not use PostgreSQL** — the project uses SQLite (final decision, see [PROJECT.md](./PROJECT.md))
- Don't modify production files — only work in the development directory
- Don't commit `.env` files or API keys
- Don't poll the WarEra API more than 200 times per minute
