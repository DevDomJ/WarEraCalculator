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

### Get Battle by ID
**Endpoint:** `/battle.getById`  
**Operation ID:** `battle.getById`  
**Description:** Retrieves detailed information about a specific battle (renamed from `battle.getBattleById`)

**Request Body:**
```json
{
  "battleId": "string" // Required: The unique identifier of the battle
}
```

**Response Fields:**
```json
{
  "_id": "string",
  "war": "string", // War ID
  "type": "string",
  "isActive": true,
  "roundsToWin": 5,
  "currentRound": "string", // Current round ID
  "rounds": ["string"], // Array of round IDs
  "roundsHistory": [],
  "attacker": {
    "country": "string",
    "wonRoundsCount": 0,
    "countryOrders": ["string"], // Country IDs with orders
    "muOrders": ["string"], // MU IDs with orders
    "damages": 0,
    "hitCount": 3402,
    "moneyPer1kDamages": 0.01,
    "moneyPool": 968.96,
    "bountyEffectiveAt": "string"
  },
  "defender": {
    "region": "string", // Defended region ID
    "country": "string",
    "wonRoundsCount": 0,
    "countryOrders": ["string"],
    "muOrders": ["string"],
    "damages": 0,
    "hitCount": 2945
  },
  "stats": { "hitCount": 0 },
  "createdAt": "string",
  "updatedAt": "string"
}
```

---

### Get Live Battle Data
**Endpoint:** `/battle.getLiveBattleData`  
**Operation ID:** `battle.getLiveBattleData`  
**Description:** Retrieves real-time battle and round data including damage scores, points, and tick timing

**Request Body:**
```json
{
  "battleId": "string" // Required: The battle ID
}
```

**Response:**
```json
{
  "battle": {
    "isActive": true,
    "attackerCountryOrders": ["string"],
    "defenderCountryOrders": ["string"],
    "roundIds": ["string"],
    "roundHistory": [],
    "attackerMoneyPer1kDamages": 0.01,
    "attackerMoneyPool": 968.96,
    "attackerBountyEffectiveAt": "string"
  },
  "round": {
    "roundId": "string",
    "attackerDamages": 3373637,
    "defenderDamages": 2772078,
    "isActive": true,
    "actualTickPoints": 1,
    "attackerPoints": 5,
    "defenderPoints": 44,
    "nextTickAt": "string" // When the next tick/point is awarded
  }
}
```

---

### Get Battles
**Endpoint:** `/battle.getBattles`  
**Operation ID:** `battle.getBattles`  
**Description:** Retrieves a paginated list of battles (renamed from `battle.getBattlesPaginated`)

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

## Battle Order Endpoints

### Get Battle Orders by Battle
**Endpoint:** `/battleOrder.getByBattle`  
**Operation ID:** `battleOrder.getByBattle`  
**Description:** Retrieves active battle orders for a specific battle and side. Battle orders are instructions set by countries or military units directing players where to fight.

**Request Body:**
```json
{
  "battleId": "string", // Required: The battle ID
  "side": "string" // Required: "attacker" or "defender"
}
```

**Response:** Array of battle order objects:
```json
[
  {
    "_id": "string",
    "battle": "string", // Battle ID
    "side": "attacker", // "attacker" or "defender"
    "sideCountry": "string", // Country ID of the side
    "user": "string", // User ID who set the order
    "mu": "string", // Military unit ID (present if MU order)
    "country": "string", // Country ID (present if country order)
    "text": "string", // Order description/message
    "priority": "high", // "high", "medium", or "low"
    "isActive": true,
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

**Notes:**
- Orders can be set by either a country or a military unit (one of `mu` or `country` will be present)
- Priority levels: `high`, `medium`, `low`
- Battle IDs can be found in action logs (via `setOrder` actions) or country data (`currentBattleOrder`)

---

## War Endpoints (REMOVED)

War endpoints (`war.getWarById`, `war.getWarsPaginated`) have been removed from the API as of March 2026. War IDs can still be found in battle data (`battle.getById` → `war` field).

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
**Endpoint:** `/region.getById`  
**Operation ID:** `region.getById`  
**Description:** Retrieves detailed information about a specific region (renamed from `region.getRegionById`)

**Request Body:**
```json
{
  "regionId": "string" // Required: The unique identifier of the region
}
```

---

### Get All Regions Object
**Endpoint:** `/region.getRegionsObject`  
**Operation ID:** `region.getRegionsObject`  
**Description:** Retrieves all regions as an object keyed by region ID. Returns all 726+ regions in a single call. Replaces `region.getRegionsByCountry` (use client-side filtering by `country` field instead).

**Request Body:**
```json
{}
```

**Response:** Object keyed by region ID:
```json
{
  "6813b7039403bc4170a5d68a": {
    "_id": "string",
    "code": "ch-zurich",
    "name": "Switzerland",
    "mainCity": "Zurich",
    "country": "string", // Current owner country ID
    "initialCountry": "string", // Original owner country ID
    "countryCode": "ch",
    "isCapital": false,
    "isLinkedToCapital": true,
    "neighbors": ["string"], // Adjacent region IDs
    "development": 4.74,
    "baseDevelopment": 4.74,
    "biome": "string",
    "climate": "string",
    "position": {},
    "resistance": 0,
    "resistanceMax": 0,
    "strategicResource": "string", // If present
    "deposit": "string", // If present (only in getById)
    "activeUpgradeLevels": {},
    "upgradesV2": { "upgrades": {}, "activeConstructionCount": 0 },
    "stats": { "investedMoney": 0 },
    "dates": { "lastOwnershipChangeAt": "string" }
  }
}
```

---

## Party Endpoints

### Get Party by ID
**Endpoint:** `/party.getById`  
**Operation ID:** `party.getById`  
**Description:** Retrieves detailed information about a political party, including ethics levels

**Request Body:**
```json
{
  "partyId": "string" // Required: The unique identifier of the party
}
```

**Response Fields:**
- `name` - Party name
- `description` - Party description
- `country` - Country ID where the party is located
- `leader` - User ID of the party leader
- `rulingParty` - Boolean indicating if this is the ruling party
- `ethics` - Object containing ethics levels:
  - `militarism` - Militarism ethic level (0-2)
  - `isolationism` - Isolationism ethic level (0-2)
  - `imperialism` - Imperialism ethic level (0-2)
  - `industrialism` - Industrialism ethic level (0-2, grants production bonus to Ammo & Construction)
  - `agrarianism` - Agrarianism ethic level (0-2, grants production bonus to agricultural goods)

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

### Get User by ID
**Endpoint:** `/user.getUserById`  
**Operation ID:** `user.getUserById`  
**Description:** Retrieves comprehensive public user information including activity dates, leveling, skills (with equipment/weapon bonuses), stats, equipment, rankings, and more. Returns significantly more data than `getUserLite`.

**Request Body:**
```json
{
  "userId": "string" // Required: The unique identifier of the user
}
```

**Response Fields:**
```json
{
  "_id": "string",
  "username": "string",
  "country": "string", // Country ID
  "party": "string", // Party ID
  "mu": "string", // Military unit ID
  "company": "string", // Company ID
  "isActive": true,
  "emailVerified": true,
  "militaryRank": 26,
  "createdAt": "string",
  "dates": {
    "lastConnectionAt": "string",
    "lastWorkAt": "string",
    "lastDailyRewardClaimedAt": "string",
    "lastWorkOfferApplications": ["string"],
    "lastCompanyJoinedAt": "string"
    // ... more date fields
  },
  "leveling": {
    "level": 9,
    "totalXp": 2090,
    "dailyXpLeft": 100,
    "availableSkillPoints": 0,
    "spentSkillPoints": 36,
    "totalSkillPoints": 36,
    "freeReset": 4
  },
  "skills": {
    // Each skill has: level, value, weapon, equipment, limited, total, currentBarValue, hourlyBarRegen, totalAfterSoftCap, overflow
    "energy": { "level": 2, "value": 50, "total": 50, "currentBarValue": 50, "hourlyBarRegen": 5 },
    "health": { "level": 3, "value": 130, "total": 130 },
    "hunger": { "level": 0, "value": 4, "total": 4 },
    "attack": { "level": 3, "value": 175, "weapon": 28, "total": 219, "ammoPercent": 0, "buffsPercent": 0, "militaryRankPercent": 7.75 },
    "companies": { "level": 0, "value": 2, "total": 2 },
    "entrepreneurship": { "level": 2, "value": 40, "total": 40 },
    "production": { "level": 2, "value": 16, "total": 16 },
    "criticalChance": { "level": 3, "value": 25, "weapon": 3, "total": 28 },
    "criticalDamages": { "level": 0, "value": 100, "total": 100 },
    "armor": { "level": 0, "total": 0 },
    "precision": { "level": 2, "value": 60, "total": 60 },
    "dodge": { "level": 0, "equipment": 10, "total": 10, "totalAfterSoftCap": 20 },
    "lootChance": { "level": 3, "value": 8, "total": 8 },
    "management": { "level": 0, "value": 4, "total": 4 }
  },
  "equipment": {
    "weapon": "string", // Item ID (or null)
    "boots": "string" // Item ID (or null)
    // Other equipment slots possible
  },
  "stats": {
    "worksCount": 354,
    "damagesCount": 89905,
    "estimatedWealth": 896.935,
    "wealth": {
      "companies": 238.328,
      "items": 680.105,
      "money": 311.044,
      "equipments": 4.202,
      "weapons": 24.879,
      "total": 1258.558
    },
    "case1": { "openedCount": 8, "byRarity": { "common": 6, "uncommon": 2 } },
    "case2": { "openedCount": 2, "byRarity": { "uncommon": 1, "rare": 1 } }
  },
  "rankings": {
    "userDamages": { "value": 89905, "rank": 6964, "tier": "bronze" },
    "userWealth": { "value": 1258.558, "rank": 7476, "tier": "bronze" },
    "userLevel": { "value": 2090, "rank": 8590, "tier": "bronze" }
    // ... more ranking types
  },
  "missions": { "rerolledDailyMissions": 0, "rerolledWeeklyMissions": 0 }
}
```

**Notes:**
- Much more detailed than `getUserLite` — includes activity timestamps, full skill breakdowns with equipment bonuses, wealth breakdown, case opening stats
- Skills show weapon/equipment contributions separately from base value
- `totalAfterSoftCap` appears when soft cap mechanics apply (e.g., dodge)

---

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

## Work Stats Endpoints

### Get Stats By Company
**Endpoint:** `/work.getStatsByCompany`  
**Operation ID:** `work.getStatsByCompany`  
**Description:** Get daily production stats for a company over a time period. Breaks down production by source (employees, self-work, automated engine).

**Request Body:**
```json
{
  "companyId": "string", // Required: The company ID
  "days": 30,            // Required: Number of days to look back
  "timezone": "Europe/Berlin" // Required: Timezone for daily aggregation
}
```

**Response:**
```json
[
  {
    "dailyDate": "2026-02-27",
    "total": 2481.39,
    "wage": 177.416,
    "employeeProd": 2264.04,
    "selfWork": 0,
    "automatedEngine": 217.35
  }
]
```

| Field | Description |
|---|---|
| `dailyDate` | Date string (YYYY-MM-DD) |
| `total` | Total production points produced that day |
| `wage` | Total wages paid that day |
| `employeeProd` | Production points from employees |
| `selfWork` | Production points from owner working |
| `automatedEngine` | Production points from automated engine |

---

### Get Stats By Worker And Company
**Endpoint:** `/work.getStatsByWorkerAndCompany`  
**Operation ID:** `work.getStatsByWorkerAndCompany`  
**Description:** Get daily production stats for a specific worker in a company. Requires supporter status in-game.

**Request Body:**
```json
{
  "workerId": "string",  // Required: The worker's user ID
  "companyId": "string", // Required: The company ID
  "days": 14,            // Required: Number of days to look back
  "timezone": "Europe/Berlin" // Required: Timezone for daily aggregation
}
```

**Response:**
```json
[
  {
    "dailyDate": "2026-02-27",
    "total": 1212.39,
    "wage": 95.006,
    "employeeProd": 1212.39
  }
]
```

| Field | Description |
|---|---|
| `dailyDate` | Date string (YYYY-MM-DD) |
| `total` | Total production points by this worker that day |
| `wage` | Wages paid to this worker that day |
| `employeeProd` | Production points contributed (same as total for individual workers) |

---

## Wage Stats Endpoints

### Get Wage Stats
**Endpoint:** `/workOffer.getWageStats`  
**Operation ID:** `workOffer.getWageStats`  
**Description:** Get global wage market statistics including allowed range and top offers.

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "allowedRange": {
    "min": 0.094,
    "max": 0.175,
    "average": 0.135
  },
  "topOffer": 0.16,
  "topEligibleOffer": 0.14,
  "topEligibleOffers": [
    {
      "_id": "string",
      "company": "string",
      "user": "string",
      "region": "string",
      "quantity": 1,
      "initialQuantity": 1,
      "wage": 0.14,
      "text": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
}
```

---

## Production Bonus Endpoints

### Get Production Bonus
**Endpoint:** `/company.getProductionBonus`  
**Operation ID:** `company.getProductionBonus`  
**Description:** Get the production bonus breakdown for a company directly from the server.

**Request Body:**
```json
{
  "companyId": "string" // Required: The company ID
}
```

**Response:**
```json
{
  "strategicBonus": 31,
  "depositBonus": 0,
  "ethicSpecializationBonus": 30,
  "ethicDepositBonus": 0,
  "total": 61
}
```

---

## Inventory Endpoints

### Get Current Equipment
**Endpoint:** `/inventory.fetchCurrentEquipment`  
**Operation ID:** `inventory.fetchCurrentEquipment`  
**Description:** Retrieves a user's currently equipped items with full item details including stats, durability, and acquisition date.

**Request Body:**
```json
{
  "userId": "string" // Required: The user ID to get equipment for
}
```

**Response:**
```json
{
  "weapon": {
    "_id": "string",
    "code": "knife", // Item code (e.g., "knife", "pistol")
    "skills": {
      "attack": 28,
      "criticalChance": 3
    },
    "state": 74, // Current durability
    "maxState": 100, // Maximum durability
    "quantity": 1,
    "lastAcquisitionAt": "string",
    "isEquipStatsMigrated": true
  },
  "boots": {
    "_id": "string",
    "type": "equipment",
    "code": "boots2", // Item code
    "skills": {
      "dodge": 10
    },
    "state": 94,
    "maxState": 100,
    "quantity": 1,
    "lastAcquisitionAt": "string"
  }
}
```

**Notes:**
- Response keys correspond to equipment slots (weapon, boots, etc.)
- Slots without equipped items are omitted from the response
- `state` / `maxState` represent item durability (items degrade with use)
- `skills` shows the stat bonuses the item provides
- `code` matches the item codes used elsewhere in the API

---

## Action Log Endpoints

### Get Paginated Action Logs
**Endpoint:** `/actionLog.getPaginated`  
**Operation ID:** `actionLog.getPaginated`  
**Description:** Retrieves a paginated feed of game action logs. Can be filtered by user. Covers mission claims, battle orders, username changes, citizenship changes, and more.

**Request Body:**
```json
{
  "limit": 10, // Optional: Maximum entries to return (default varies)
  "cursor": "string", // Optional: Pagination cursor (from nextCursor in response)
  "userId": "string" // Optional: Filter by user ID
}
```

**Response:**
```json
{
  "items": [
    {
      "_id": "string",
      "user": "string", // User ID who performed the action
      "data": {
        "action": "string", // Action type (see below)
        // ... action-specific fields
      },
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "nextCursor": "string" // Use as cursor for next page
}
```

**Known Action Types and their data fields:**

| Action | Description | Extra Fields |
|---|---|---|
| `claimMissionXp` | Player claimed XP from a mission | `missionType`, `missionTimeType` (daily/weekly), `xpReward` |
| `claimFinishedMissionXp` | Player completed all missions for a period | `missionTimeType`, `missionsFinishedCount`, `xpReward`, `moneyReward`, `casesReward` |
| `setOrder` | Battle order was set | `countrySide`, `battleId`, `muId`, `priority` |
| `changedUsername` | Player changed their username | `old`, `new` |
| `changedCitizenship` | Player changed citizenship | `fromCountryId`, `toCountryId`, `reason` |

**Mission Types (for `claimMissionXp`):**
`participateInBattle`, `openCases`, `eat`, `eatSteak`, `blockDamage`, `sellItems`, and more.

**Notes:**
- Without `userId` filter, returns a global feed of all players' actions
- The `nextCursor` field is a composite string (timestamp + ID) used for pagination
- `setOrder` actions contain `battleId` which can be used with `battleOrder.getByBattle`

---

## Restricted Endpoints (API Token Forbidden)

The following endpoints are accessible only via session auth (in-game), not via API tokens:

- `company.getCompaniesCount` — Get total company count for a user
- `company.getActiveCompaniesCount` — Get active company count for a user

---

## API Information

- **Title:** WarEra API Documentation
- **Base URL:** `/trpc`
- **Protocol:** All endpoints use GET requests
- **Content Type:** `application/json`
- **Additional Properties:** Not allowed in request bodies (strict schema validation)
