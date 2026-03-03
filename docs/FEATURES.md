# WarEra Calculator - Feature Documentation

This document describes each feature in detail, including the requirement (why it exists), the implementation approach, and any known limitations.

> **Status Legend:** ✅ Implemented | 🚧 In Progress / Partial | ❌ Not Started

---

## F-01: Market Price Data Collection
**Status:** ✅ Implemented

### Requirement
The WarEra.io game does not provide historical price data. Players have no way to see how prices have changed over time. To enable price trend analysis, we need to periodically collect and store current market prices.

### Implementation
- A scheduled task (cron job) in the NestJS backend runs every 5 minutes (`@Cron(CronExpression.EVERY_5_MINUTES)`)
- The collection cycle: fetch game config → fetch trading orders (batched) → fetch and store prices
- Each price data point includes: average price, volume (from order book), highest buy order, lowest sell order
- Data is stored in the `PriceHistory` table with a timestamp

### Design Decisions
- **5-minute interval** was chosen as a balance between data granularity and API load / storage growth
- Data collection runs in the **production environment 24/7** to ensure continuous coverage
- Volume and order extremes are captured alongside price for richer analytics

### Known Limitations
- If the production server goes down, price data for that period is lost
- No backfill mechanism exists

---

## F-02: Historical Price Storage
**Status:** ✅ Implemented

### Requirement
To visualize price trends, we need a persistent store of historical price data points.

### Implementation
- Uses SQLite database via Prisma ORM
- `PriceHistory` model stores: item code, price, volume, highestBuy, lowestSell, timestamp
- Data grows linearly over time (~288 records per item per day at 5-min intervals)
- Indexed on `[itemCode, timestamp]` for efficient time-range queries

### Design Decisions
- **SQLite** was chosen over PostgreSQL (originally planned) for simplicity on Raspberry Pi
- No data aggregation/rollup is implemented yet — raw data points are kept indefinitely

### Known Limitations
- Long-term storage may become large without data aggregation (e.g., daily averages for old data)
- No data retention policy defined yet

---

## F-03: WarEra API Integration
**Status:** ✅ Implemented

### Requirement
All data comes from the WarEra API. We need a robust API client that handles authentication, rate limiting, and errors.

### Implementation
- `WarEraApiModule` in NestJS with Axios HTTP client
- Authentication via `X-API-Key` header (key stored in `.env`, excluded from Git)
- API Base URL: `https://api2.warera.io/trpc`
- Rate limit: 200 requests/minute, with 250ms delay between requests
- Retry logic with exponential backoff for HTTP 429 errors

### Endpoints Used
| Endpoint | Purpose | Polling Frequency |
|----------|---------|-------------------|
| `/itemTrading.getPrices` | Current average prices for all items | Every 5 minutes |
| `/tradingOrder.getTopOrders` | Buy/sell orders for specific items | Every 5 minutes (batched) |
| `/gameConfig.getGameConfig` | Game configuration (item definitions) | Every 5 minutes (cached) |
| `/company.getCompanies` | User's companies | On demand |
| `/company.getById` | Single company details | On demand |
| `/workOffer.getWorkOfferByCompanyId` | Worker/wage info | On demand |
| `/company.getProductionBonus` | Server-side production bonus | On demand |
| `/mu.getById` | Military unit details | On demand |
| `/mu.getManyPaginated` | MU membership/ownership lookup | On demand |
| `/user.getUserLite` | User profiles (level, stats, last login) | On demand (batched) |
| `/transaction.getPaginatedTransactions` | MU donation totals (30-day window) | On demand |
| `/work.getStatsByWorkerAndCompany` | Per-worker daily production stats | On demand |
| `/work.getStatsByCompany` | Company daily production breakdown | On demand |
| `/workOffer.getWageStats` | Global wage market statistics | On demand |

### Design Decisions
- API key is **never committed** to the repository — stored in `.env` file
- Rate limiting is handled proactively with 250ms delay between requests
- Batch requests used for trading orders (up to 30 items per batch)

---

## F-04: Environment Separation (Dev/Prod)
**Status:** ✅ Implemented

### Requirement
The application runs 24/7 in production collecting data. Development work must not interfere with production data collection.

### Implementation
- Development: port 3000, database at `backend/prisma/dev.db`
- Production: port 4000, separate database in isolated directory
- Both can run simultaneously
- Production location documented in `PRODUCTION_DEPLOY.md` (private, not in repo)

### Design Decisions
- **Complete directory isolation** — dev and prod are in entirely separate directories, not just different configs
- This prevents accidental data corruption during development

---

## F-05: Production Deployment (pm2)
**Status:** ✅ Implemented

### Requirement
The backend must run continuously on a Raspberry Pi to collect market data 24/7.

### Implementation
- pm2 process manager keeps the backend running
- Process name: `warera-prod`
- Management: `pm2 status`, `pm2 restart warera-prod`, `pm2 logs warera-prod`
- Deployment: build in dev directory, deploy only `dist/` folder to production
- Backend serves both API endpoints and frontend static files in production

### Design Decisions
- **pm2** was chosen for its simplicity, auto-restart on crash, and log management
- Only compiled code (`dist/`) is deployed — no `node_modules` sync needed if dependencies haven't changed

---

## F-06: Trading Order Display
**Status:** ✅ Implemented

### Requirement
Players need to see current buy and sell orders on the market to make informed trading decisions.

### Implementation
- Backend: `TradingOrderService` fetches orders via `/tradingOrder.getTopOrders` with batch support (30 items per batch)
- Orders stored in `TradingOrder` table with itemCode, type (buy/sell), price, quantity, timestamp
- REST API: `GET /api/prices/:itemCode/orders` returns current buy and sell orders
- Frontend: `ItemDetail` page displays buy orders (sorted by price desc) and sell orders (sorted by price asc) in tables

---

## F-07: Price Trend Charts
**Status:** ✅ Implemented

### Requirement
Players need to visualize how prices change over time to identify trends, seasonal patterns, and market manipulation.

### Implementation
- Backend: `GET /api/prices/:itemCode?days=X` returns historical price data
- Frontend: `ItemDetail` page with interactive Recharts charts
- **Price chart** with toggleable lines:
  - Average price (green)
  - Highest buy order (blue)
  - Lowest sell order (red)
- **Volume bar chart** showing trade volume over time (purple bars)
- **Time interval selection**: Day, Week, 2 Weeks, Month
- **Dynamic X-axis**: time-based formatting for day view, date-based for longer periods
- **15-minute aggregation** for day view to reduce data density
- Click legend entries to toggle visibility of data series

---

## F-08: Production Profit Calculator
**Status:** ✅ Implemented

### Requirement
Players need to calculate whether producing and selling a specific item is profitable, given wages, production bonuses, and market prices.

### Implementation
- Backend: `ProductionCalculatorService` with recipe-based calculations
- **Production metrics**: PP per work, work actions per day, total PP per day
- **Profit calculation**: Single profit value per company (Revenue - Wages - Input Costs)
  - For raw material producers (no inputs): Profit = Revenue - Wages
  - For advanced ware producers: Profit = Revenue - Wages - Input Costs (buying inputs from market)
  - Self-production profit is not calculated separately — if you self-produce inputs, that profit shows on the input-producing company
- REST API: `GET /api/production/:companyId/profit?outputItem=X`
- Frontend: `CompanyDetail` page with `ProfitSection` component showing profit analysis
- Uses real-time market prices as defaults
- Production bonus adjustable via interactive input

### Design Decisions
- **Single profit model**: Originally had two scenarios (buy inputs vs self-produce). Consolidated to a single profit value because self-production profit is already captured by the input-producing company. Showing both double-counted the value.

### Game Mechanics Reference
See [GAME_MECHANICS.md](./GAME_MECHANICS.md) for the formulas and rules governing production costs and revenue.

---

## F-09: Salary Expense Tracking
**Status:** ❌ Not Started

### Requirement
The game does not show players how much they have spent on salaries over time. This makes it impossible to calculate true profit without manual tracking.

### Planned Behavior
- Track salary payments per company/factory
- Show daily, weekly, monthly salary totals
- Break down by factory/product type

---

## F-10: Trade Income Tracking
**Status:** ❌ Not Started

### Requirement
The game does not provide a trade history with revenue summaries. Players cannot easily see how much they earned from selling goods.

### Planned Behavior
- Track completed trades (items sold, quantities, prices)
- Show revenue over time periods
- Compare against production costs for profit analysis

---

## F-11: Financial Dashboard
**Status:** ❌ Not Started

### Requirement
A combined overview that brings together income, expenses, and profit into a single view.

### Planned Behavior
- Summary cards: Total Revenue, Total Expenses, Net Profit
- Time-period selector
- Breakdown by product/factory
- Trend indicators (up/down compared to previous period)

---

## F-12: Responsive UI
**Status:** ✅ Implemented

### Requirement
Players should be able to check market data and run calculations from different screen sizes.

### Implementation
- Tailwind CSS utility-first styling throughout
- Responsive grid layout on GoodsOverview (up to 6 columns on large screens)
- Charts resize responsively
- Touch-friendly controls

---

## F-13: Item Catalog / Game Config
**Status:** ✅ Implemented

### Requirement
The application needs to know about all tradeable items in the game — their names, codes, categories, production recipes, etc.

### Implementation
- Backend: `GameConfigService` fetches `/gameConfig.getGameConfig` from the API and caches it
- Item categories defined in `backend/src/config/item-categories.ts`: Cases, Craft, Buffs, Ammo, Food, Construction, Equipment
- Item display names mapped in `backend/src/config/item-display-names.ts`
- Frontend: `GoodsOverview` page displays items organized by category with icons and display names
- Equipment items shown in a separate toggle view

---

## F-14: Batch API Requests
**Status:** ✅ Implemented

### Requirement
The WarEra API supports batch requests, which allows multiple queries in a single HTTP request.

### Implementation
- `TradingOrderService` batches order requests (up to 30 items per batch)
- Reduces API call count to stay within rate limits
- Used during the every-5-minute data collection cycle

---

## F-15: Company Management
**Status:** ✅ Implemented

### Requirement
Players need to view and manage their companies, see worker details, and understand production capacity.

### Implementation
- Backend: `CompanyService` fetches companies from WarEra API by userId
- Resolves region IDs to human-readable names via `region.getById` API (cached in-memory)
- Stores region name and ISO country code per company for country flag emoji display
- Fetches work offers and worker details (wages, energy, production value, fidelity)
- Fetches actual daily production stats per worker via `work.getStatsByWorkerAndCompany`
- Database models: `Company` and `Worker` with full worker stats
- REST API:
  - `POST /api/companies/fetch` — Fetch companies from WarEra API
  - `GET /api/companies/user/:userId` — Get cached companies with production bonuses
  - `POST /api/companies/user/:userId/refresh` — Refresh from API
  - `GET /api/companies/:id` — Get single company (includes avg daily production per worker)
  - `POST /api/companies/:id/refresh` — Refresh single company
  - `GET /api/companies/:id/worker/:workerId/stats?days=X` — Get worker daily production stats
  - `POST /api/companies/reorder` — Reorder companies (drag & drop)
- Frontend: `CompaniesList` page with drag & drop reordering (@dnd-kit), daily profit per company card, aggregated summary card (`CompaniesSummary` component), `CompanyDetail` page with full metrics and clickable workers, `WorkerDetail` page with worker info card and 30-day production bar chart
- Region displayed with country flag emoji (ISO country code → regional indicator symbols)
- Company ID shown in muted monospace for easy reference
- User ID stored in localStorage for persistence

---

## F-16: Production Analytics
**Status:** ✅ Implemented

### Requirement
Players need to track actual production output against expected values to identify efficiency issues.

### Implementation
- Backend: `ProductionAnalyticsService` tracks daily production (actual vs expected)
- Database: `ProductionHistory` model with unique constraint on (companyId, date)
- Calculates: efficiency percentage, average variance, totals
- REST API:
  - `POST /api/analytics/:companyId/track` — Track daily production
  - `GET /api/analytics/:companyId/history?days=X` — Get history
  - `GET /api/analytics/:companyId?days=X` — Get analytics summary
- Frontend: `ProductionTracker` component for input, `ProductionHistoryChart` for visualization (30-day line chart)

---

## F-17: Production Bonus Calculation
**Status:** ✅ Implemented

### Requirement
Production output is affected by multiple bonus sources. Players need to understand where their bonuses come from.

### Implementation
- Backend: `CompanyService.fetchProductionBonus()` calls the WarEra API endpoint `company.getProductionBonus` directly
- Returns breakdown: strategic bonus, deposit bonus, ethic specialization bonus, ethic deposit bonus
- Frontend: `ProductionBonusTooltip` component shows breakdown with simple labels

### Design Decisions
- **API-based approach**: Previously calculated client-side from 3 separate API calls (region, country, party). Replaced with a single `company.getProductionBonus` call that returns the authoritative server-side values. This eliminated the `ProductionBonusService`, `EthicsService`, and `ethics.json` config (~270 lines).
- **Simplified tooltip labels**: The API returns only numeric values (no country/party names), so the tooltip shows generic labels like "strategic resources" and "ethic specialization" instead of the previous contextual descriptions.

---

## F-18: Ethics System Integration
**Status:** ✅ Implemented (merged into F-17)

### Requirement
The ruling party's ethics affect production bonuses for certain item categories.

### Implementation
- Ethics bonuses are now included in the `company.getProductionBonus` API response as `ethicSpecializationBonus` and `ethicDepositBonus`
- The dedicated `EthicsService`, `EthicsModule`, and `ethics.json` config have been removed — the game server handles this calculation

---

## F-19: Military Unit (MU) Management
**Status:** ✅ Implemented

### Requirement
Players belong to military units (MUs) and need to view MU membership, member activity, combat stats, and donation contributions. MU commanders need to identify inactive members (candidates for removal).

### Implementation
- Backend: `MuModule` with service and controller
  - Fetches MU data via `/mu.getManyPaginated` (membership via `memberId`, ownership via `userId`)
  - Fetches MU detail via `/mu.getById`
  - Enriches all members with user profiles via batched `/user.getUserLite` calls (up to 25 in one batch)
  - Calculates 30-day donation totals from `/transaction.getPaginatedTransactions` (stops at 30-day cutoff)
  - Computes last login time ago and inactive flag (48h+ since last login)
  - Members sorted: owner first → commanders → by level descending
- REST API:
  - `GET /api/mu/user/:userId` — Returns MU membership and owned MUs (summary)
  - `GET /api/mu/:muId` — Returns full MU detail with enriched member data
- Frontend:
  - `MuList` page: Shows "My MU" (the MU the user belongs to) and "Owned MUs" sections
  - `MuDetail` page: Upgrade levels (HQ, Dormitories), member table with avatars (animated when available), owner/commander badges, level, military rank, total damage, attack, 30-day donations, last login with inactive highlighting (red background for 48h+)

### Design Decisions
- **30-day donation window**: Donations are fetched from the transaction API (not the inaccurate `investedMoneyByUsers` field). Limited to 30 days to avoid ever-growing pagination (~25 donations/day from daily missions). Transactions come newest-first, so we stop paginating when we hit the cutoff.
- **No database storage**: MU data is fetched live from the API on each page load. No local caching since the data changes frequently (members join/leave, donations happen daily).
- **Batch user fetching**: All 25 members fetched in a single tRPC batch request to minimize API calls.

### Known Limitations
- MU detail page makes ~4 API requests (1 MU detail + 1 user batch + ~2 donation pages), so initial load takes a few seconds
- No MU member list endpoint exists in the API — members come from the MU object itself
- `investedMoneyByUsers` from the API is inaccurate and not used

---

## Adding New Features

When adding a new feature:

1. Assign the next feature number (F-XX)
2. Add an entry to this file following the template below
3. Update the Feature Status table in [PROJECT.md](./PROJECT.md)
4. Update [GAME_MECHANICS.md](./GAME_MECHANICS.md) if the feature involves game formulas

### Feature Template

```markdown
## F-XX: Feature Name
**Status:** ❌ Not Started | 🚧 In Progress | ✅ Implemented

### Requirement
Why does this feature exist? What player problem does it solve?

### Implementation
How is it built? What technologies/patterns are used?

### Design Decisions
Why was it built this way? What alternatives were considered?

### Known Limitations
What doesn't work yet? What edge cases exist?
```
