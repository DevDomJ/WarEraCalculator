# Item Detail Charts Enhancement

## Changes Made

### Database Schema (Prisma)
Added new fields to `PriceHistory` model:
- `volume` (Int): Total trade volume from buy/sell orders
- `highestBuy` (Float?): Highest buy order price at time of collection
- `lowestSell` (Float?): Lowest sell order price at time of collection

### Backend Changes

#### Market Price Service
Updated `fetchAndStorePrices()` to:
- Query current trading orders for each item
- Calculate total volume from order quantities
- Extract highest buy price and lowest sell price
- Store all metrics in PriceHistory

### Frontend Changes

#### ItemDetail Component
Enhanced with:
1. **Multiple Line Charts**: 
   - Average Price (green)
   - Highest Buy Order (blue)
   - Lowest Sell Order (red)

2. **Volume Bar Chart**:
   - Separate chart showing trade volume over time (purple bars)

3. **Interactive Legend**:
   - Click any legend entry to toggle visibility of that data series
   - State managed via React useState hook
   - Works for both line chart and bar chart

#### API Client Types
Updated `PriceHistory` interface to include new fields:
- `volume: number`
- `highestBuy?: number`
- `lowestSell?: number`

## Migration
Database migration created: `20260211154313_add_volume_and_order_prices`

## Usage
- Navigate to any item detail page
- Click legend entries to show/hide specific data series
- All historical data (30 days) shows average price, best buy/sell orders, and volume
- New data collection will populate these fields going forward

## Notes
- Existing historical data will have default values (volume=0, null for buy/sell)
- New data points will include all metrics
- Volume is calculated from current order book at time of price collection
