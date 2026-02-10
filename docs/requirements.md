# WarEra Calculator - Requirements Specification

## 1. Project Overview

### 1.1 Purpose
The WarEra Calculator is a web application designed to track and visualize market prices for goods in the WarEra game. The application will periodically fetch current market data, persist historical price information, and provide users with interactive visualizations of price trends and market offers.

### 1.2 Scope
This document defines the functional and non-functional requirements for the initial version of the WarEra Calculator application.

### 1.3 Technology Stack
- **Frontend**: React with TypeScript, Vite
- **Backend**: NestJS with TypeScript, Node.js
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Raspberry Pi 4 (4GB+ RAM)
- **Additional Technologies**: As specified in techStack.md

### 1.4 External Dependencies
- **WarEra API**: https://api2.warera.io/docs/
- **API Base URL**: `https://api2.warera.io/trpc`
- **Authentication**: API Key via `X-API-Key` header (stored in .env file, excluded from Git)
- **Batch Support**: Available via `?batch=1` query parameter

## 2. API Integration Details

### 2.1 Required Endpoints

#### 2.1.1 Market Price Data
- **Endpoint**: `/itemTrading.getPrices`
- **Method**: GET
- **Purpose**: Retrieve current average prices for all tradeable items
- **Cache TTL**: 60 seconds
- **Response**: Dictionary mapping item codes to average prices
- **Usage**: Called every 5 minutes to fetch all current market prices

#### 2.1.2 Trading Orders
- **Endpoint**: `/tradingOrder.getTopOrders`
- **Method**: GET
- **Parameters**:
  - `itemCode` (string, required): The code of the item
  - `limit` (integer, optional): Number of orders to retrieve (min: 1, max: 100, default: 10)
- **Purpose**: Retrieve top buy and sell orders for a specific item
- **Cache TTL**: 5 seconds
- **Response**: Tuple of (buy_orders, sell_orders)
- **Usage**: Called for each item to get top 5 buy/sell offers

#### 2.1.3 Game Configuration
- **Endpoint**: `/gameConfig.getGameConfig`
- **Method**: GET
- **Purpose**: Retrieve static game configuration including all items with metadata
- **Cache TTL**: 86400 seconds (24 hours)
- **Response**: Game configuration object containing items array with:
  - Item codes
  - Item names
  - Item icons/images
  - Item order (as displayed in game)
- **Usage**: Called once at startup and cached to get item metadata and icons

### 2.2 Batch Request Implementation

#### 2.2.1 Batch Endpoint Structure
- **Format**: `/endpoint1,endpoint2,endpoint3?batch=1`
- **Input Parameter**: JSON object with numbered keys ("0", "1", "2", etc.) mapping to endpoint payloads
- **Batch Limit**: Maximum 100 requests per batch
- **Delay**: 0.25 seconds between batch requests
- **Response**: Array of responses corresponding to batched requests

#### 2.2.2 Optimization Strategy
- **FR-6.1**: Use single request to `/itemTrading.getPrices` to get all average prices
- **FR-6.2**: Batch multiple `/tradingOrder.getTopOrders` calls (up to 30 items) into single batch request
- **FR-6.3**: Implement automatic retry logic for rate limit errors (HTTP 429)
- **FR-6.4**: Respect rate limits with configurable delay between requests (default: 0.25s)

### 2.3 Authentication & Headers

#### 2.3.1 Required Headers
```
X-API-Key: <API_TOKEN_FROM_ENV>
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
Accept: application/json
```

#### 2.3.2 Rate Limiting
- **FR-6.5**: Handle HTTP 429 responses by reading `Ratelimit-Reset` header
- **FR-6.6**: Implement exponential backoff for failed requests
- **FR-6.7**: Log all rate limit events for monitoring

## 3. Functional Requirements

### 2.1 Data Collection

#### 2.1.1 Periodic Price Fetching
- **FR-1.1**: The system SHALL fetch current market prices for all goods every 5 minutes
- **FR-1.2**: The system SHALL use batch requests where possible to minimize API calls
- **FR-1.3**: The system SHALL handle API rate limits and implement appropriate retry logic

#### 2.1.2 Data Points per Fetch
For each good, the system SHALL retrieve:
- **FR-2.1**: Current average price
- **FR-2.2**: Top 5 buy offers (price and quantity)
- **FR-2.3**: Top 5 sell offers (price and quantity)
- **FR-2.4**: Trading volume
- **FR-2.5**: Timestamp of the data fetch

#### 2.1.3 Goods Catalog
- **FR-2.6**: The system SHALL track approximately 30 static goods
- **FR-2.7**: Goods list SHALL be maintained in the same order as displayed in the game
- **FR-2.8**: Good icons/images SHALL match the game's visual representation
- **FR-2.9**: Icons SHALL be retrieved from API if available, otherwise stored locally

### 2.2 Data Persistence

#### 2.2.1 Database Storage
- **FR-3.1**: All fetched price data SHALL be persisted in a PostgreSQL database
- **FR-3.2**: Historical data SHALL be retained for at least 30 days
- **FR-3.3**: The database schema SHALL support efficient querying for time-series data
- **FR-3.4**: Data older than 30 days MAY be archived or aggregated for long-term storage

#### 2.2.2 Configuration Management
- **FR-3.5**: API credentials SHALL be stored in a `.env` file
- **FR-3.6**: The `.env` file SHALL be excluded from version control via `.gitignore`
- **FR-3.7**: A `.env.example` template SHALL be provided in the repository

### 2.3 User Interface

#### 2.3.1 Goods Overview View
- **FR-4.1**: The system SHALL display a grid/list of all available goods (~30 items)
- **FR-4.2**: Each good entry SHALL display:
  - Good icon/image (matching game visuals)
  - Good name
  - Current average price
- **FR-4.3**: Goods SHALL be displayed in the same order as in the game
- **FR-4.4**: All goods SHALL be visible at all times (no search/filter functionality)
- **FR-4.5**: Goods SHALL be clickable to navigate to detail view

#### 2.3.2 Good Detail View
- **FR-5.1**: The system SHALL display a historical price chart for the selected good
- **FR-5.2**: The chart SHALL show data for the last 30 days
- **FR-5.3**: The chart SHALL display:
  - Average price over time (line chart)
  - Trading volume over time (bar chart or secondary axis)
- **FR-5.4**: The system SHALL display current top 5 buy offers with:
  - Price per unit
  - Quantity available
- **FR-5.5**: The system SHALL display current top 5 sell offers with:
  - Price per unit
  - Quantity available
- **FR-5.6**: The system SHALL provide a way to navigate back to the overview

## 3. Non-Functional Requirements

### 3.1 Performance
- **NFR-1.1**: The system SHALL fetch and persist data within 30 seconds per cycle
- **NFR-1.2**: The UI SHALL load the goods overview within 2 seconds
- **NFR-1.3**: Chart rendering SHALL complete within 1 second for standard time ranges

### 3.2 Reliability
- **NFR-2.1**: The background data fetching service SHALL run continuously with automatic restart on failure
- **NFR-2.2**: The system SHALL handle API failures gracefully without data loss
- **NFR-2.3**: The system SHALL log all errors for debugging purposes

### 3.3 Scalability
- **NFR-3.1**: The database SHALL support at least 1 year of historical data without performance degradation
- **NFR-3.2**: The system SHALL be deployable on a Raspberry Pi 4 (4GB RAM)

### 3.4 Usability
- **NFR-4.1**: The UI SHALL be responsive and accessible from desktop and mobile devices
- **NFR-4.2**: The UI SHALL follow modern web design principles

## 4. Technical Architecture

### 4.1 Backend Components
- **Background Service**: Scheduled task for periodic API data fetching
- **REST API**: Endpoints for frontend to query historical data and current prices
- **Database Layer**: PostgreSQL with Prisma ORM

### 4.2 Frontend Components
- **Overview Page**: Grid/list display of all goods
- **Detail Page**: Charts and offer tables for individual goods
- **Data Fetching**: TanStack Query for server state management

### 4.3 Data Flow
```
WarEra API → Backend Service → PostgreSQL → Backend API → Frontend
     ↓              ↓              ↓            ↓           ↓
  (every 5min)  (persist)     (store)      (query)    (display)
```

## 5. Company Management & Production Calculator

### 5.1 Company Overview

#### 5.1.1 Company List Display
- **FR-7.1**: The system SHALL display all companies owned by the user
- **FR-7.2**: Each company entry SHALL display:
  - Company name
  - Company type/industry
  - Region/location
  - Number of workers
  - Wage per worker
  - Production value per worker
  - Energy consumption per worker

#### 5.1.2 Production Metrics Calculation
- **FR-7.3**: The system SHALL calculate production points per work action using formula:
  ```
  Production Points per Work = P × (1 + PBF + Fidelity Bonus)
  
  Where:
  - P = Base production value of the worker
  - PBF = Production Bonus of Factory (in decimal, e.g., 0.20 for 20%)
  - Fidelity Bonus = Worker's fidelity bonus (in decimal)
  ```

- **FR-7.4**: The system SHALL calculate work actions per day using formula:
  ```
  Work Actions per Day = (Max Energy × 0.1 × 24) / 10
                       = Max Energy × 0.024
  
  Where:
  - Max Energy = Worker's maximum energy
  - 0.1 = Energy regeneration rate (10% of max energy per hour)
  - 24 = Hours per day
  - 10 = Energy cost per work action
  
  Example: Worker with 70 max energy
  → 70 × 0.24 = 16.8 work actions per day
  ```

- **FR-7.5**: The system SHALL calculate total production points per day:
  ```
  Total PP per Day = Work Actions per Day × Production Points per Work
  ```

- **FR-7.6**: All calculation formulas SHALL be visible via tooltip/hover on the respective metric

### 5.2 Production Analytics

#### 5.2.1 Actual vs. Expected Production
- **FR-8.1**: The system SHALL track actual production points achieved per day
- **FR-8.2**: The system SHALL compare actual vs. expected production points
- **FR-8.3**: The system SHALL display variance percentage between actual and expected production
- **FR-8.4**: Historical production data SHALL be visualized in a chart (last 7-30 days)

#### 5.2.2 Profit Calculation per Production Point
- **FR-8.5**: The system SHALL calculate profit per production point using formula:
  ```
  Profit per PP = (Sale Price × Production Bonus × Units per PP) - (Wage per PP)
  
  Where:
  - Sale Price = Current market average price for the produced good
  - Production Bonus = Company's production bonus multiplier (e.g., 1.2 for +20%)
  - Units per PP = Number of units produced per production point (from game config)
  - Wage per PP = (Total Daily Wage) / (Total Daily Production Points)
  ```
- **FR-8.6**: The system SHALL display profit projections based on current market prices
- **FR-8.7**: All variables in the profit formula SHALL be visible via tooltip

### 5.3 Production Chain Calculator

#### 5.3.1 Input Material Sourcing Options
- **FR-9.1**: For companies requiring input materials, the system SHALL calculate two scenarios:
  - **Scenario A**: Purchase input materials from market
  - **Scenario B**: Produce input materials in own factory

#### 5.3.2 Scenario A: Market Purchase Calculation
- **FR-9.2**: The system SHALL calculate profit when buying input materials using formula:
  ```
  Profit (Market Purchase) = Revenue - Input Costs - Wage Costs
  
  Where:
  - Revenue = (Output Units × Output Price × Production Bonus)
  - Input Costs = (Input Units Required × Market Price of Input)
  - Wage Costs = (Production Points Required × Wage per PP)
  ```

#### 5.3.3 Scenario B: Self-Production Calculation
- **FR-9.3**: The system SHALL calculate profit when producing input materials using formula:
  ```
  Profit (Self-Production) = Revenue - Total Production Costs
  
  Where:
  - Revenue = (Output Units × Output Price × Output Production Bonus)
  - Total Production Costs = Input Production Costs + Output Production Costs
  
  Input Production Costs:
  - Raw Material Costs (if any)
  - Input Factory Wage Costs
  - Input Factory Production Points × Input Wage per PP
  
  Output Production Costs:
  - Output Factory Wage Costs
  - Output Factory Production Points × Output Wage per PP
  
  IMPORTANT: Do NOT add revenue from selling input material, as it is consumed in production
  ```

#### 5.3.4 Production Chain Comparison
- **FR-9.4**: The system SHALL display side-by-side comparison of both scenarios
- **FR-9.5**: The system SHALL highlight the more profitable scenario
- **FR-9.6**: The system SHALL show the profit difference between scenarios
- **FR-9.7**: The system SHALL account for production bonuses at each stage of the chain

### 5.4 Formula Transparency

#### 5.4.1 Formula Display
- **FR-10.1**: All calculated metrics SHALL have an info icon/tooltip
- **FR-10.2**: Hovering over the info icon SHALL display:
  - The complete formula used for calculation
  - Explanation of each variable
  - Current values of all variables
  - Example calculation with actual numbers

#### 5.4.2 Interactive Calculations
- **FR-10.3**: Users SHALL be able to modify variables (wage, market price) to see hypothetical results
- **FR-10.4**: Changes to variables SHALL update all dependent calculations in real-time
- **FR-10.5**: The system SHALL provide a "reset to current values" button

### 5.5 API Integration for Companies

#### 5.5.1 Required Endpoints
- **Endpoint**: `/company.getCompanies` - Retrieve all companies for a user
- **Endpoint**: `/company.getById` - Get detailed company information
- **Endpoint**: `/workOffer.getWorkOfferByCompanyId` - Get wage and worker information
- **Endpoint**: `/gameConfig.getGameConfig` - Get production requirements and game configuration
- **Endpoint**: To be determined - Historical production data (if available in API)

#### 5.5.2 Data Retrieval
- **FR-11.1**: The system SHALL prompt the user to enter their User ID on first access
- **FR-11.2**: The User ID SHALL be stored in the session and persist during the user's session
- **FR-11.3**: The system SHALL fetch all companies for the entered User ID
- **FR-11.4**: The system SHALL fetch work offers for each company to determine wages and worker count
- **FR-11.5**: The system SHALL retrieve production recipes from game configuration (if available)
- **FR-11.6**: Company data SHALL be refreshed every 5 minutes (same as market data)

#### 5.5.3 Production Recipe Data Management
- **FR-11.7**: Production recipes (input materials, output quantities) SHALL be stored in a JSON configuration file
- **FR-11.8**: The JSON file SHALL be located at `/src/config/production-recipes.json` in the backend
- **FR-11.9**: The JSON structure SHALL define:
  - Output item code
  - Output quantity per production point
  - Required input items and quantities
- **FR-11.10**: The system SHALL load production recipes on application startup
- **FR-11.11**: Production recipes SHALL be cached in memory for fast access
- **FR-11.12**: Future enhancement: Migration to database if recipes become dynamic

**Example JSON Structure:**
```json
{
  "recipes": {
    "itemCode": {
      "output": "itemCode",
      "outputPerProductionPoint": 1.0,
      "inputs": [
        {
          "itemCode": "inputItemCode",
          "quantityRequired": 2.0
        }
      ]
    }
  }
}
```

### 5.6 User Interface Requirements

#### 5.6.1 Company Management View
- **FR-12.1**: The system SHALL provide a dedicated "My Companies" page (separate from Market Overview)
- **FR-12.2**: On first access, the system SHALL prompt for User ID input
- **FR-12.3**: The User ID input SHALL be validated before fetching data
- **FR-12.4**: Companies SHALL be displayed in a table/card layout
- **FR-12.5**: Each company SHALL be expandable to show detailed analytics
- **FR-12.6**: The system SHALL provide filtering by company type/region
- **FR-12.7**: The system SHALL display a "Change User" button to enter a different User ID

#### 5.6.2 Production Chain Visualizer
- **FR-12.5**: The system SHALL visualize production chains graphically
- **FR-12.6**: The visualization SHALL show:
  - Input materials (with icons)
  - Production process
  - Output product (with icon)
  - Profit margins at each stage

## 6. Future Enhancements (Out of Scope for v1)
- User authentication and personalized tracking
- Price alerts and notifications
- Production cost calculator
- Profit margin analysis
- Market trend predictions