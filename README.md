# WarEra Calculator

A web application for tracking and visualizing market prices in the WarEra.io game.

## Prerequisites

- Node.js v22+ LTS
- npm or pnpm

## Installation

### 1. Install Node.js

On Raspberry Pi:
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Edit `.env` and add your WarEra API key:
```
WARERA_API_KEY=your_actual_api_key_here
```

Initialize database:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

### 4. Add Item Icons

Item icons are not included in this repository due to copyright. You need to obtain them from the WarEra game:

1. Create the icons directory: `mkdir -p frontend/public/icons`
2. Download or extract item icons from WarEra
3. Place PNG files named by item code (e.g., `bread.png`, `steel.png`) in `frontend/public/icons/`

The application will work without icons, but they will be hidden.

## Development

### Start Backend (Terminal 1)
```bash
cd backend
npm run start:dev
```

Backend will run on http://localhost:3000

### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

Frontend will run on http://localhost:5173

## Production Build

### Build Frontend
```bash
cd frontend
npm run build
```

### Build Backend
```bash
cd backend
npm run build
```

### Deploy to Production

**CRITICAL:** See PRODUCTION_DEPLOY.md for detailed deployment instructions (private file, not in repo).

**Deployment Checklist:**
1. ✅ Build code in dev directory (frontend and backend)
2. ✅ Create timestamped backup of production database
3. ✅ Copy `dist/` folders to production location
4. ✅ Copy `schema.prisma` to production and run `npx prisma generate` (if schema changed)
5. ✅ Copy new migration folders and run `npx prisma migrate deploy` (if migrations exist)
6. ✅ Restart production: `pm2 restart warera-prod`
7. ✅ Verify: `pm2 status` and `pm2 logs warera-prod`

**Database Migration Command (Production):**
```bash
# In production directory
cd backend
npx prisma migrate deploy
```

**NEVER:**
- ❌ Copy database files during deployment
- ❌ Use `prisma migrate dev` in production (use `migrate deploy` instead)
- ❌ Touch production database files directly

### Run Production
```bash
cd backend
npm run start:prod
```

## Project Structure

```
WarEraApplication/
├── backend/           # NestJS backend (11 modules)
│   ├── src/modules/   # Feature modules (API, data collection, companies, production, MU)
│   ├── src/config/    # Static config (categories, display names)
│   └── prisma/        # Database schema & migrations
├── frontend/          # React + Vite frontend
│   ├── src/pages/     # 7 page components
│   ├── src/components/# 9 reusable components
│   └── src/api/       # API client
└── docs/              # Project documentation
```

For the full directory tree, see [docs/PROJECT.md](docs/PROJECT.md#project-structure).

## Features Implemented

### Phase 1: Project Setup ✅
- Backend (NestJS) and Frontend (React + Vite) initialized
- Database schema with Prisma
- Environment configuration

### Phase 2: Market Data Collection ✅
- API client with rate limiting and retry logic
- Game configuration fetching and caching
- Market price fetching (every 5 minutes)
- Trading orders fetching with batch support
- Scheduled data collection with cron jobs

### Phase 3: REST API ✅
- REST API for frontend consumption (20 endpoints)
- Market data, company management, production, and analytics endpoints
- See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md#api-reference) for the full endpoint reference

### Phase 4: Frontend - Market Overview ✅
- Goods overview page with category organization (Cases, Craft, Buffs, Ammo, Food, Construction)
- Equipment view toggle (separate from wares)
- Item cards with icons, display names, and current prices
- Navigation to item details
- Responsive grid layout (up to 6 columns on large screens)

### Phase 5: Frontend - Item Detail ✅
- Item detail page with interactive charts
- Time interval selection (Day, Week, 2 Weeks, Month)
- Price history chart with toggleable lines:
  - Average price
  - Highest buy order
  - Lowest sell order
- Trade volume bar chart
- Dynamic X-axis formatting (time-based for day view, dates for longer periods)
- 15-minute aggregation for day view
- Buy/sell orders tables
- Proper item display names matching in-game terminology

### Phase 6: Company Management Backend ✅
- Company API integration (fetch by userId)
- Production recipes configuration (JSON)
- Production metrics calculator
- Profit calculator (daily profit per company)
- REST API endpoints for companies and production

### Phase 7: Company Management Frontend ✅
- User ID input and storage
- Companies list page
- Company detail page with metrics
- Production calculator with formulas
- Profit display and aggregated summary

### Phase 8: Production History & Analytics ✅
- Production tracking (actual vs expected)
- Historical production data storage
- Analytics dashboard with efficiency metrics
- Production history chart (30 days)
- Variance analysis

## API Documentation

See `docs/warEraApiDocumentation.md` for WarEra API details.

## License

Private project
