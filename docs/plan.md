# WarEra Calculator - Implementation Plan

## Phase 1: Project Setup & Infrastructure

### 1.1 Development Environment Setup
- Install Node.js v18+ LTS
- Install PostgreSQL
- Setup Git repository structure
- Create `.gitignore` with `.env` exclusion
- Create `.env.example` template

### 1.2 Backend Project Initialization
- Initialize NestJS project
- Install dependencies:
  - `@nestjs/axios` (HTTP client)
  - `@nestjs/config` (environment variables)
  - `@nestjs/schedule` (cron jobs)
  - `class-validator`, `class-transformer` (validation)
  - `@prisma/client`, `prisma` (ORM)
  - `axios` (HTTP requests)
- Configure TypeScript settings
- Setup ESLint and Prettier

### 1.3 Frontend Project Initialization
- Initialize Vite + React + TypeScript project
- Install dependencies:
  - `@tanstack/react-query` (data fetching)
  - `axios` (HTTP client)
  - `tailwindcss` (styling)
  - `recharts` (charts)
  - `@tanstack/react-table` (tables)
  - `shadcn/ui` components (or MUI)
- Configure Tailwind CSS
- Setup routing (React Router)

### 1.4 Database Schema Design
- Design Prisma schema for:
  - `Item` (goods catalog)
  - `PriceHistory` (historical prices)
  - `TradingOrder` (buy/sell orders)
  - `Company` (user companies)
  - `ProductionHistory` (production tracking)
- Run initial Prisma migration
- Seed database with initial data

---

## Phase 2: Core Backend - Market Data Collection

### 2.1 API Client Module
- Create `WarEraApiModule`
- Implement API authentication with `X-API-Key` header
- Create base HTTP client with Axios interceptors
- Implement rate limiting logic (200 req/min)
- Add retry logic for HTTP 429 errors
- Implement exponential backoff

### 2.2 Game Configuration Service
- Create `GameConfigService`
- Implement `/gameConfig.getGameConfig` endpoint call
- Parse and cache item metadata (codes, names, icons, order)
- Store items in database
- Cache configuration for 24 hours

### 2.3 Market Price Service
- Create `MarketPriceService`
- Implement `/itemTrading.getPrices` endpoint call
- Parse price data for all items
- Store prices in `PriceHistory` table with timestamp

### 2.4 Trading Orders Service
- Create `TradingOrderService`
- Implement `/tradingOrder.getTopOrders` endpoint call
- Implement batch request logic (up to 30 items per batch)
- Parse top 5 buy/sell orders per item
- Store orders in `TradingOrder` table

### 2.5 Batch Request Optimization
- Implement batch endpoint formatter (`/endpoint1,endpoint2?batch=1`)
- Create batch request handler with 0.25s delay
- Implement request grouping (max 100 per batch)
- Add error handling for partial batch failures

### 2.6 Scheduled Data Collection
- Create `DataCollectionService`
- Implement cron job (every 5 minutes)
- Orchestrate: fetch game config → fetch prices → fetch orders (batched)
- Add comprehensive error logging
- Implement graceful failure handling

---

## Phase 3: Core Backend - REST API

### 3.1 Items API
- Create `ItemsController`
- `GET /api/items` - List all items with current prices
- `GET /api/items/:code` - Get single item details
- Return item metadata (name, icon, code)

### 3.2 Price History API
- Create `PriceHistoryController`
- `GET /api/prices/:itemCode` - Get historical prices (last 30 days)
- Support query params: `startDate`, `endDate`, `interval`
- Return time-series data for charts

### 3.3 Trading Orders API
- Create `TradingOrdersController`
- `GET /api/orders/:itemCode` - Get current top 5 buy/sell orders
- Return sorted orders with price and quantity

### 3.4 Data Validation & DTOs
- Create DTOs for all API responses
- Add validation decorators
- Implement error handling middleware

---

## Phase 4: Frontend - Market Overview

### 4.1 API Client Setup
- Create Axios instance with base URL
- Setup TanStack Query client
- Configure query defaults (caching, refetch)

### 4.2 Goods Overview Page
- Create `GoodsOverview` component
- Fetch all items with `useQuery`
- Display grid/list of items (30 items)
- Show: icon, name, current price
- Maintain game order for items
- Make items clickable (navigate to detail)

### 4.3 Item Card Component
- Create reusable `ItemCard` component
- Display item icon (from API or local fallback)
- Display item name
- Display current average price
- Add hover effects

---

## Phase 5: Frontend - Item Detail View

### 5.1 Item Detail Page
- Create `ItemDetail` component
- Fetch item details by code
- Fetch price history (30 days)
- Fetch current trading orders

### 5.2 Price Chart Component
- Create `PriceChart` component using Recharts
- Display line chart for average price over time
- Display bar chart for trading volume (if available)
- Add time range selector (7d, 14d, 30d)
- Make chart responsive

### 5.3 Trading Orders Display
- Create `OrdersTable` component using TanStack Table
- Display top 5 buy orders (price, quantity)
- Display top 5 sell orders (price, quantity)
- Add sorting functionality
- Style buy/sell orders differently (green/red)

### 5.4 Navigation
- Add back button to return to overview
- Implement breadcrumb navigation

---

## Phase 6: Company Management Backend

### 6.1 Production Recipes Configuration
- Create `/src/config/production-recipes.json`
- Define recipe structure:
  - Output item code
  - Output quantity per production point
  - Input items and quantities
- Load recipes on application startup
- Cache recipes in memory

### 6.2 Company API Integration
- Create `CompanyService`
- Implement `/company.getCompanies` endpoint call (by userId)
- Implement `/company.getById` endpoint call
- Implement `/workOffer.getWorkOfferByCompanyId` endpoint call
- Parse company data: name, type, region, workers, wages

### 6.3 Production Calculation Service
- Create `ProductionCalculatorService`
- Implement formula: Production Points per Work
  - `PP = P × (1 + PBF + Fidelity Bonus)`
- Implement formula: Work Actions per Day
  - `Actions = Max Energy × 0.24`
- Implement formula: Total PP per Day
  - `Total PP = Actions × PP per Work`
- Implement formula: Profit per PP
  - `Profit = (Sale Price × Bonus × Units) - Wage per PP`

### 6.4 Production Chain Calculator
- Implement Scenario A: Market Purchase
  - `Profit = Revenue - Input Costs - Wage Costs`
- Implement Scenario B: Self-Production
  - `Profit = Revenue - Total Production Costs`
  - Account for multi-stage production
- Compare scenarios and highlight better option

### 6.5 Company API Endpoints
- Create `CompanyController`
- `POST /api/companies/fetch` - Fetch companies by userId
- `GET /api/companies/:id` - Get company details
- `GET /api/companies/:id/production` - Get production metrics
- `GET /api/companies/:id/profit` - Calculate profit scenarios
- `GET /api/production-recipes` - Get all recipes

---

## Phase 7: Company Management Frontend

### 7.1 User ID Input
- Create `UserIdPrompt` component
- Store userId in session/localStorage
- Add "Change User" button
- Validate userId before API calls

### 7.2 Companies List Page
- Create `CompaniesList` component
- Fetch companies by userId
- Display table/cards with:
  - Company name, type, region
  - Workers count, wage per worker
  - Production value per worker
  - Energy consumption
- Add filtering by type/region
- Make companies expandable/clickable

### 7.3 Company Detail View
- Create `CompanyDetail` component
- Display all company metrics
- Show production calculations with formulas
- Add info icons with tooltips for formulas
- Display formula variables and current values

### 7.4 Production Calculator Component
- Create `ProductionCalculator` component
- Display Scenario A (Market Purchase)
- Display Scenario B (Self-Production)
- Show side-by-side comparison
- Highlight more profitable scenario
- Show profit difference

### 7.5 Interactive Formula Editor
- Create `FormulaEditor` component
- Allow users to modify variables (wage, market price)
- Update calculations in real-time
- Add "Reset to Current Values" button
- Display example calculations with actual numbers

### 7.6 Production Chain Visualizer
- Create `ProductionChainVisualizer` component
- Display graphical production chain
- Show input materials with icons
- Show output product with icon
- Display profit margins at each stage

---

## Phase 8: Production History & Analytics

### 8.1 Production History Tracking
- Add `ProductionHistory` table to database
- Track actual production points per day
- Store expected vs actual production
- Calculate variance percentage

### 8.2 Production Analytics API
- Create `ProductionAnalyticsController`
- `GET /api/companies/:id/history` - Get production history (7-30 days)
- `GET /api/companies/:id/analytics` - Get variance analysis

### 8.3 Production History Chart
- Create `ProductionHistoryChart` component
- Display actual vs expected production over time
- Show variance percentage
- Add time range selector (7d, 14d, 30d)

---

## Phase 9: Deployment & Infrastructure

### 9.1 Raspberry Pi Setup
- Install Node.js v18+ on Raspberry Pi
- Install PostgreSQL on Raspberry Pi
- Clone repository to Raspberry Pi
- Install dependencies

### 9.2 Environment Configuration
- Create production `.env` file
- Configure database connection
- Add WarEra API key
- Set production URLs

### 9.3 Database Migration
- Run Prisma migrations on production
- Seed initial data
- Verify database connectivity

### 9.4 Process Management
- Install PM2 on Raspberry Pi
- Create PM2 ecosystem config
- Configure auto-restart on crash
- Setup log rotation

### 9.5 Build & Deploy
- Build frontend for production (`npm run build`)
- Configure NestJS to serve static frontend files
- Start backend with PM2
- Verify application is running

### 9.6 Network Access
- Configure local network access (IP address)
- Setup mDNS/Avahi for hostname resolution
- Test access from PC and mobile devices

### 9.7 Remote Access (Optional)
- Install Tailscale on Raspberry Pi
- Configure Tailscale network
- Test remote access
- Alternative: Setup Cloudflare Tunnel or ngrok

### 9.8 SSL/TLS (Optional)
- Install Certbot for Let's Encrypt
- Generate SSL certificate
- Configure nginx as reverse proxy
- Enable HTTPS

---

## Phase 10: Testing & Optimization

### 10.1 Backend Testing
- Write unit tests for services (Jest)
- Test API endpoints
- Test batch request logic
- Test rate limiting and retry logic
- Test production calculations

### 10.2 Frontend Testing
- Test component rendering
- Test data fetching and caching
- Test user interactions
- Test responsive design on mobile

### 10.3 Performance Optimization
- Optimize database queries
- Add database indexes
- Implement query result caching
- Optimize frontend bundle size
- Lazy load components

### 10.4 Monitoring & Logging
- Setup Winston/Pino logging
- Configure log levels (dev/prod)
- Add PM2 monitoring
- Monitor API rate limits
- Track data collection success rate

---

## Phase 11: Documentation & Maintenance

### 11.1 Code Documentation
- Add JSDoc comments to services
- Document API endpoints (Swagger/OpenAPI)
- Document component props
- Add inline code comments

### 11.2 User Documentation
- Create user guide for market overview
- Create user guide for company management
- Document formula calculations
- Add FAQ section

### 11.3 Deployment Documentation
- Document Raspberry Pi setup steps
- Document environment configuration
- Document backup procedures
- Document troubleshooting steps

---

## Task Dependencies Summary

### Critical Path (Must be done in order):
1. **Phase 1** → **Phase 2** → **Phase 3** → **Phase 4** → **Phase 5**
   - Setup → Backend Data Collection → Backend API → Frontend Overview → Frontend Detail

2. **Phase 1** → **Phase 6** → **Phase 7**
   - Setup → Company Backend → Company Frontend

3. **Phase 6** → **Phase 8**
   - Company Backend → Production Analytics

4. **All Phases** → **Phase 9** → **Phase 10** → **Phase 11**
   - Development → Deployment → Testing → Documentation

### Parallel Work Opportunities:
- **Phase 4 & 5** (Frontend Market) can be developed in parallel with **Phase 6** (Company Backend)
- **Phase 7** (Company Frontend) can start once Phase 6 is complete
- **Phase 10** (Testing) can be done incrementally throughout development
- **Phase 11** (Documentation) can be written alongside development

---

## Estimated Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1 | 1 day | None |
| Phase 2 | 2-3 days | Phase 1 |
| Phase 3 | 1-2 days | Phase 2 |
| Phase 4 | 1-2 days | Phase 3 |
| Phase 5 | 2-3 days | Phase 4 |
| Phase 6 | 3-4 days | Phase 1 |
| Phase 7 | 3-4 days | Phase 6 |
| Phase 8 | 2-3 days | Phase 6 |
| Phase 9 | 1-2 days | All phases |
| Phase 10 | 2-3 days | Phase 9 |
| Phase 11 | 1-2 days | Phase 10 |

**Total Estimated Time:** 3-4 weeks (with parallel work)

---

## Priority Order for MVP

### High Priority (MVP - Market Tracker):
1. Phase 1: Project Setup
2. Phase 2: Market Data Collection
3. Phase 3: Backend API
4. Phase 4: Goods Overview
5. Phase 5: Item Detail View
6. Phase 9: Basic Deployment

### Medium Priority (Company Management):
7. Phase 6: Company Backend
8. Phase 7: Company Frontend
9. Phase 8: Production Analytics

### Low Priority (Polish & Optimization):
10. Phase 10: Testing & Optimization
11. Phase 11: Documentation

---

## Next Steps

1. Start with **Phase 1.1-1.3**: Setup development environment and initialize projects
2. Move to **Phase 1.4**: Design and implement database schema
3. Begin **Phase 2**: Build backend data collection (critical for all features)
4. Proceed sequentially through phases, testing each component before moving forward

---

**Last Updated:** February 10, 2026  
**Status:** Ready for Implementation
