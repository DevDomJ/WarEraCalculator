# WarEra API Documentation

Base URL: `/trpc`

All endpoints use GET requests with JSON request bodies.
---

## Authentication

API requests require authentication using the following header:

```http
X-API-Key: YOUR_API_TOKEN
```

**Rate Limit:** 200 requests per minute per token

⚠️ **Important:** Exceeding the rate limit will result in temporary API access suspension.

---

---

## Battle Endpoints

### Get Active Battles
**Endpoint:** `/battle.getActiveBattles`  
**Operation ID:** `battle.getActiveBattles`  
**Description:** Retrieves all currently active battles in the game

**Request Body:**
```json
{}
```

---

### Get Battle by ID
**Endpoint:** `/battle.getBattleById`  
**Operation ID:** `battle.getBattleById`  
**Description:** Retrieves detailed information about a specific battle

**Request Body:**
```json
{
  "battleId": "string" // Required: The unique identifier of the battle
}
```

---

### Get Battles Paginated
**Endpoint:** `/battle.getBattlesPaginated`  
**Operation ID:** `battle.getBattlesPaginated`  
**Description:** Retrieves a paginated list of battles with optional filtering

**Request Body:**
```json
{
  "limit": 10, // Optional: Maximum number of battles to return (1-100, default: 10)
  "cursor": "string", // Optional: Pagination cursor
  "countryId": "string", // Optional: Filter by country ID
  "warId": "string" // Optional: Filter by war ID
}
```

---

## War Endpoints

### Get War by ID
**Endpoint:** `/war.getWarById`  
**Operation ID:** `war.getWarById`  
**Description:** Retrieves detailed information about a specific war

**Request Body:**
```json
{
  "warId": "string" // Required: The unique identifier of the war
}
```

---

### Get Wars Paginated
**Endpoint:** `/war.getWarsPaginated`  
**Operation ID:** `war.getWarsPaginated`  
**Description:** Retrieves a paginated list of wars with optional filtering

**Request Body:**
```json
{
  "limit": 10, // Optional: Maximum number of wars to return (1-100, default: 10)
  "cursor": "string", // Optional: Pagination cursor
  "countryId": "string" // Optional: Filter by country ID
}
```

---

## Country Endpoints

### Get All Countries
**Endpoint:** `/country.getAllCountries`  
**Operation ID:** `country.getAllCountries`  
**Description:** Retrieves a list of all countries in the game

**Request Body:**
```json
{}
```

---

### Get Country by ID
**Endpoint:** `/country.getCountryById`  
**Operation ID:** `country.getCountryById`  
**Description:** Retrieves detailed information about a specific country

**Request Body:**
```json
{
  "countryId": "string" // Required: The unique identifier of the country
}
```

---

## Region Endpoints

### Get Region by ID
**Endpoint:** `/region.getRegionById`  
**Operation ID:** `region.getRegionById`  
**Description:** Retrieves detailed information about a specific region

**Request Body:**
```json
{
  "regionId": "string" // Required: The unique identifier of the region
}
```

---

### Get Regions by Country
**Endpoint:** `/region.getRegionsByCountry`  
**Operation ID:** `region.getRegionsByCountry`  
**Description:** Retrieves all regions belonging to a specific country

**Request Body:**
```json
{
  "countryId": "string" // Required: The unique identifier of the country
}
```

---

## Company Endpoints

### Get Company by ID
**Endpoint:** `/company.getById`  
**Operation ID:** `company.getById`  
**Description:** Retrieves detailed information about a specific company

**Request Body:**
```json
{
  "companyId": "string" // Required: The unique identifier of the company
}
```

---

### Get Companies
**Endpoint:** `/company.getCompanies`  
**Operation ID:** `company.getCompanies`  
**Description:** Retrieves a paginated list of companies with optional filtering

**Request Body:**
```json
{
  "userId": "string", // Optional: Filter companies by user ID
  "orgId": "string", // Optional: Filter companies by organization ID
  "perPage": 10, // Optional: Number of companies per page (1-100, default: 10)
  "cursor": "string" // Optional: Pagination cursor for next page
}
```

---

## Round Endpoints

### Get Round by ID
**Endpoint:** `/round.getRoundById`  
**Operation ID:** `round.getRoundById`  
**Description:** Retrieves detailed information about a specific battle round

**Request Body:**
```json
{
  "roundId": "string" // Required: The unique identifier of the round
}
```

---

### Get Last Hits in Round
**Endpoint:** `/round.getLastHits`  
**Operation ID:** `round.getLastHits`  
**Description:** Retrieves the most recent hits/damages in a specific battle round

**Request Body:**
```json
{
  "roundId": "string" // Required: The unique identifier of the round
}
```

---

## Battle Ranking Endpoints

### Get Battle Rankings
**Endpoint:** `/battleRanking.getRanking`  
**Operation ID:** `battleRanking.getRanking`  
**Description:** Retrieves damage, ground, or money rankings for users or countries in battles, rounds, or wars

**Request Body:**
```json
{
  "battleId": "string", // Optional: Battle ID to filter rankings
  "roundId": "string", // Optional: Round ID to filter rankings
  "warId": "string", // Optional: War ID to filter rankings
  "dataType": "damage", // Required: Type of ranking data (damage, points, money)
  "type": "user", // Required: Ranking type (user, country, mu)
  "side": "attacker" // Required: Battle side (attacker, defender)
}
```

**Data Type Options:**
- `damage` - Damage rankings
- `points` - Ground points rankings
- `money` - Money rankings

**Type Options:**
- `user` - Rank by user
- `country` - Rank by country
- `mu` - Rank by military unit

**Side Options:**
- `attacker` - Attacker side
- `defender` - Defender side

---

## Item Trading Endpoints

### Get Item Prices
**Endpoint:** `/itemTrading.getPrices`  
**Operation ID:** `itemTrading.getPrices`  
**Description:** Retrieves current market prices for all tradeable items

**Request Body:**
```json
{}
```

---

### Get Top Orders
**Endpoint:** `/tradingOrder.getTopOrders`  
**Operation ID:** `tradingOrder.getTopOrders`  
**Description:** Retrieves the best orders for an item

**Request Body:**
```json
{
  "itemCode": "string", // Required: The item code to get orders for
  "limit": 10 // Optional: Maximum orders to return (1-100, default: 10)
}
```

---

## Item Offer Endpoints

### Get Item Offer by ID
**Endpoint:** `/itemOffer.getById`  
**Operation ID:** `itemOffer.getById`  
**Description:** Retrieves detailed information about a specific item offer

**Request Body:**
```json
{
  "itemOfferId": "string" // Required: The unique identifier of the item offer
}
```

---

## Work Offer Endpoints

### Get Work Offer by ID
**Endpoint:** `/workOffer.getById`  
**Operation ID:** `workOffer.getById`  
**Description:** Retrieves detailed information about a specific work offer

**Request Body:**
```json
{
  "workOfferId": "string" // Required: The unique identifier of the work offer
}
```

---

### Get Work Offer by Company ID
**Endpoint:** `/workOffer.getWorkOfferByCompanyId`  
**Operation ID:** `workOffer.getWorkOfferByCompanyId`  
**Description:** Retrieves work offer for a specific company

**Request Body:**
```json
{
  "companyId": "string" // Required: The unique identifier of the company
}
```

---

### Get Work Offers Paginated
**Endpoint:** `/workOffer.getWorkOffersPaginated`  
**Operation ID:** `workOffer.getWorkOffersPaginated`  
**Description:** Retrieves a paginated list of work offers with optional user and region filtering

**Request Body:**
```json
{
  "userId": "string", // Optional: Filter by user ID
  "regionId": "string", // Optional: Filter by region ID
  "cursor": "string", // Optional: Pagination cursor
  "limit": 10, // Optional: Maximum offers to return (default: 10)
  "energy": 0, // Optional: Minimum energy requirement (>= 0)
  "production": 0, // Optional: Minimum production requirement (>= 0)
  "citizenship": "string" // Optional: Filter by citizenship
}
```

---

## Ranking Endpoints

### Get Ranking Data
**Endpoint:** `/ranking.getRanking`  
**Operation ID:** `ranking.getRanking`  
**Description:** Retrieves ranking data for the specified ranking type and optional year-week filter

**Request Body:**
```json
{
  "rankingType": "string" // Required: The type of ranking to retrieve
}
```

**Ranking Type Options:**

**Country Rankings:**
- `weeklyCountryDamages` - Weekly country damage rankings
- `weeklyCountryDamagesPerCitizen` - Weekly country damage per citizen
- `countryRegionDiff` - Country region differences
- `countryDevelopment` - Country development rankings
- `countryActivePopulation` - Country active population
- `countryDamages` - Total country damages
- `countryWealth` - Country wealth rankings
- `countryProductionBonus` - Country production bonus
- `countryBounty` - Country bounty rankings

**User Rankings:**
- `weeklyUserDamages` - Weekly user damage rankings
- `userDamages` - Total user damages
- `userWealth` - User wealth rankings
- `userLevel` - User level rankings
- `userReferrals` - User referral rankings
- `userSubscribers` - User subscriber rankings
- `userTerrain` - User terrain rankings
- `userPremiumMonths` - User premium months
- `userPremiumGifts` - User premium gifts
- `userCasesOpened` - User cases opened
- `userGemsPurchased` - User gems purchased
- `userBounty` - User bounty rankings

**Military Unit Rankings:**
- `muWeeklyDamages` - Weekly MU damage rankings
- `muDamages` - Total MU damages
- `muTerrain` - MU terrain rankings
- `muWealth` - MU wealth rankings
- `muBounty` - MU bounty rankings

---

## Search Endpoints

### Global Search
**Endpoint:** `/search.searchAnything`  
**Operation ID:** `search.searchAnything`  
**Description:** Performs a global search across users, companies, articles, and other entities

**Request Body:**
```json
{
  "searchText": "string" // Required: The search query string
}
```

---

## Game Config Endpoints

### Get Game Dates
**Endpoint:** `/gameConfig.getDates`  
**Operation ID:** `gameConfig.getDates`  
**Description:** Retrieves game-related dates and timings

**Request Body:**
```json
{}
```

---

### Get Game Configuration
**Endpoint:** `/gameConfig.getGameConfig`  
**Operation ID:** `gameConfig.getGameConfig`  
**Description:** Retrieves static game configuration

**Request Body:**
```json
{}
```

---

## User Endpoints

### Get User Profile (Lite)
**Endpoint:** `/user.getUserLite`  
**Operation ID:** `user.getUserLite`  
**Description:** Retrieves basic public information about a user including username, skills, and rankings

**Request Body:**
```json
{
  "userId": "string" // Required: The unique identifier of the user
}
```

---

### Get Users by Country
**Endpoint:** `/user.getUsersByCountry`  
**Operation ID:** `user.getUsersByCountry`  
**Description:** Retrieves a list of users by country

**Request Body:**
```json
{
  "countryId": "string", // Required: The country ID
  "limit": 10, // Optional: Maximum users to return (1-100, default: 10)
  "cursor": "string" // Optional: Pagination cursor
}
```

---

## Article Endpoints

### Get Article by ID
**Endpoint:** `/article.getArticleById`  
**Operation ID:** `article.getArticleById`  
**Description:** Retrieves detailed information about a specific article

**Request Body:**
```json
{
  "articleId": "string" // Required: The ID of the article to get
}
```

---

### Get Articles Paginated
**Endpoint:** `/article.getArticlesPaginated`  
**Operation ID:** `article.getArticlesPaginated`  
**Description:** Retrieves a paginated list of articles

**Request Body:**
```json
{
  "type": "weekly", // Required: The type of articles to get
  "limit": 10, // Optional: Maximum articles to return (1-100, default: 10)
  "cursor": "string", // Optional: Pagination cursor
  "userId": "string", // Optional: Filter by user ID
  "categories": ["string"], // Optional: Filter by categories
  "languages": ["string"] // Optional: Filter by languages
}
```

**Article Type Options:**
- `weekly` - Weekly articles
- `top` - Top articles
- `my` - User's own articles
- `subscriptions` - Articles from subscriptions
- `last` - Latest articles

---

## Military Unit Endpoints

### Get Military Unit by ID
**Endpoint:** `/mu.getById`  
**Operation ID:** `mu.getById`  
**Description:** Retrieves detailed information about a specific military unit

**Request Body:**
```json
{
  "muId": "string" // Required: The unique identifier of the military unit
}
```

---

### Get Military Units Paginated
**Endpoint:** `/mu.getManyPaginated`  
**Operation ID:** `mu.getManyPaginated`  
**Description:** Retrieves a paginated list of military units with optional filters

**Request Body:**
```json
{
  "limit": 20, // Optional: Maximum MUs to return (1-100, default: 20)
  "cursor": "string", // Optional: Pagination cursor
  "memberId": "string", // Optional: Filter by member ID
  "userId": "string", // Optional: Filter by user ID
  "orgId": "string", // Optional: Filter by organization ID
  "search": "string" // Optional: Search query
}
```

---

## Transaction Endpoints

### Get Paginated Transactions
**Endpoint:** `/transaction.getPaginatedTransactions`  
**Operation ID:** `transaction.getPaginatedTransactions`  
**Description:** Retrieves a paginated list of transactions

**Request Body:**
```json
{
  "limit": 10, // Optional: Maximum transactions to return (1-100, default: 10)
  "cursor": "string", // Optional: Pagination cursor
  "userId": "string", // Optional: Filter by user ID
  "muId": "string", // Optional: Filter by military unit ID
  "countryId": "string", // Optional: Filter by country ID
  "itemCode": "string", // Optional: Filter by item code
  "transactionType": "trading" // Optional: Filter by transaction type (string or array)
}
```

**Transaction Type Options:**
- `applicationFee` - Application fees
- `trading` - Trading transactions
- `itemMarket` - Item market transactions
- `wage` - Wage payments
- `donation` - Donations
- `articleTip` - Article tips
- `openCase` - Case openings
- `craftItem` - Item crafting
- `dismantleItem` - Item dismantling

---

## Upgrade Endpoints

### Get Upgrade by Type and Entity
**Endpoint:** `/upgrade.getUpgradeByTypeAndEntity`  
**Operation ID:** `upgrade.getUpgradeByTypeAndEntity`  
**Description:** Retrieves upgrade information for a specific upgrade type and entity (region, company, or military unit)

**Request Body:**
```json
{
  "upgradeType": "bunker", // Required: The upgrade type
  "regionId": "string", // Optional: Filter by region ID
  "companyId": "string", // Optional: Filter by company ID
  "muId": "string" // Optional: Filter by military unit ID
}
```

**Upgrade Type Options:**
- `bunker` - Bunker upgrades
- `base` - Base upgrades
- `storage` - Storage upgrades
- `automatedEngine` - Automated engine upgrades
- `breakRoom` - Break room upgrades
- `headquarters` - Headquarters upgrades
- `dormitories` - Dormitory upgrades

---

## Worker Endpoints

### Get Workers
**Endpoint:** `/worker.getWorkers`  
**Operation ID:** `worker.getWorkers`  
**Description:** Get workers for a company or user

**Request Body:**
```json
{
  "companyId": "string", // Optional: Filter by company ID
  "userId": "string" // Optional: Filter by user ID
}
```

---

### Get Total Workers Count
**Endpoint:** `/worker.getTotalWorkersCount`  
**Operation ID:** `worker.getTotalWorkersCount`  
**Description:** Get total workers count for a user

**Request Body:**
```json
{
  "userId": "string" // Required: The user ID
}
```

---

## API Information

- **Title:** WarEra API Documentation
- **Base URL:** `/trpc`
- **Protocol:** All endpoints use GET requests
- **Content Type:** `application/json`
- **Additional Properties:** Not allowed in request bodies (strict schema validation)
