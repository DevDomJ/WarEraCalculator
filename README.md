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

### Run Production
```bash
cd backend
npm run start:prod
```

## Project Structure

```
WarEraApplication/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── warera-api/       # API client with rate limiting
│   │   │   ├── game-config/      # Game configuration & items
│   │   │   ├── market-price/     # Price fetching
│   │   │   ├── trading-order/    # Order fetching
│   │   │   ├── items/            # Items API
│   │   │   ├── price-history/    # Price history API
│   │   │   └── data-collection/  # Cron job scheduler
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   └── prisma.service.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts         # API client
│   │   ├── pages/
│   │   │   ├── GoodsOverview.tsx # Market overview
│   │   │   └── ItemDetail.tsx    # Item detail with charts
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
└── docs/
    ├── plan.md
    ├── requirements.md
    └── techStack.md
```

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
- GET /api/items - List all items with current prices
- GET /api/items/:code - Get single item details
- GET /api/prices/:itemCode - Get price history
- GET /api/prices/:itemCode/orders - Get current orders

### Phase 4: Frontend - Market Overview ✅
- Goods overview page with all items
- Item cards with icons and current prices
- Navigation to item details

### Phase 5: Frontend - Item Detail ✅
- Item detail page with price chart
- 30-day price history visualization
- Buy/sell orders tables

### Phase 6: Company Management Backend ✅
- Company API integration (fetch by userId)
- Production recipes configuration (JSON)
- Production metrics calculator
- Profit scenario calculator (buy vs self-produce)
- REST API endpoints for companies and production

### Phase 7: Company Management Frontend ✅
- User ID input and storage
- Companies list page
- Company detail page with metrics
- Production calculator with formulas
- Profit comparison (Scenario A vs B)

### Phase 8: Production History & Analytics ✅
- Production tracking (actual vs expected)
- Historical production data storage
- Analytics dashboard with efficiency metrics
- Production history chart (30 days)
- Variance analysis

## Next Steps

To continue implementation:

1. **Phase 9**: Deployment to Raspberry Pi
2. **Phase 10**: Testing & Optimization
3. **Phase 11**: Documentation

## API Documentation

See `docs/warEraApiDocumentation.md` for WarEra API details.

## License

Private project
