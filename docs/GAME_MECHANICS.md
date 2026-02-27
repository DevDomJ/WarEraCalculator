# WarEra Calculator - Game Mechanics Reference

This document describes the WarEra.io game mechanics relevant to the calculator application. It serves as a reference for developers (human and AI) to understand *why* calculations work the way they do.

> **⚠️ Important:** WarEra.io is in active development. Game mechanics may change. When they do, update this document and adjust calculations accordingly.

---

## Economy Overview

WarEra.io has a fully **player-driven economy**:
- All goods on the market are produced by players in their factories
- Prices are determined by supply and demand (player-set buy/sell orders)
- Countries collect taxes on trade and salaries
- There is no NPC trading — every transaction involves real players

---

## Items and Resources

### Item Codes
Each tradeable item has a unique code (e.g., `iron`, `steel`, `oil`). The full list of item codes and their properties can be retrieved from the `/gameConfig.getGameConfig` API endpoint.

### Item Categories
Items are organized into the following categories (defined in `backend/src/config/item-categories.ts`):

| Category | Items |
|----------|-------|
| **Cases** | case2, case1 |
| **Craft** | scraps |
| **Buffs** | cocain, coca |
| **Ammo** | heavyAmmo, ammo, lightAmmo, lead |
| **Food** | cookedFish, steak, bread, fish, livestock, grain |
| **Construction** | oil, steel, concrete, petroleum, iron, limestone |
| **Equipment** | Weapons (knife, gun, rifle, sniper, tank, jet) and armor (helmet, chest, boots, gloves, pants — tiers 1-6) |

---

## Production System

### Factories
- Players own factories (companies) that produce specific items
- Each factory has workers that must be paid salaries
- Production output depends on:
  - Worker's production value
  - Worker's fidelity bonus
  - Production bonuses (country, party ethics, regional deposits)
  - Worker's max energy (determines work actions per day)

### Production Metrics

**Production Points per Work Action:**
```
PP per Work = Production Value × (1 + Production Bonus + Fidelity Bonus)
```

**Work Actions per Day:**
```
Work Actions per Day = Max Energy × 0.24

Where:
  Max Energy = Worker's maximum energy (default: 70)
  0.24 = derived from: (10% energy regen per hour × 24 hours) / 10 energy per action
  
Example: Worker with 70 max energy → 70 × 0.24 = 16.8 work actions per day
```

**Total Production Points per Day:**
```
Total PP per Day = Work Actions per Day × PP per Work
```

### Automated Engine
- Companies can have an automated engine upgrade (levels 0+)
- Automated engines produce output without worker input
- The `automatedEngineLevel` field on the Company model tracks this

---

## Production Bonus System

Production bonuses increase output without increasing input costs. The total bonus comes from multiple sources:

### Country Specialization
- Each country has a specialized item
- Companies producing that item receive a production bonus
- Bonus percentage comes from the country's `strategicResources.bonuses.productionPercent`

### Regional Deposits
- Regions can have resource deposits that grant production bonuses
- Deposit bonus applies when the company produces the deposit's item type
- Deposits have an expiry date (`endsAt`)
- Bonus percentage from `region.deposit.bonusPercent`

### Party Ethics
- The ruling party's ethics affect production bonuses for certain item categories
- Defined in `backend/src/config/ethics.json`

| Ethic | Levels | Affects |
|-------|--------|---------|
| **Industrialism** | 0-2 | Ammo & Construction categories |
| **Agrarianism** | 0-2 | Food category |

Higher ethic levels grant larger production bonuses.

### Total Production Bonus
```
Total Bonus = Country Bonus + Deposit Bonus + Party Ethics Bonus
```

This total is used in the PP per Work formula above.

---

## Market System

### Trading Orders
- Players place **buy orders** (offering to buy at a specific price) and **sell orders** (offering to sell at a specific price)
- Orders are matched when a buy price ≥ sell price
- The market shows the top orders (highest buy, lowest sell)

### Average Price
- The API provides an average price per item via `/itemTrading.getPrices`
- This is the average of recent completed trades (exact window TBD)
- The API caches this value for 60 seconds

### Price Spread
- The difference between the lowest sell order and highest buy order
- A large spread indicates low liquidity or market uncertainty

---

## Tax System

### Trade Tax
- Applied when goods are sold on the market
- Set by the country government
- Reduces the seller's revenue

```
Net Revenue = Selling Price × Quantity × (1 - trade_tax_rate)
```

### Salary Tax
- Applied when salaries are paid to workers
- Set by the country government
- Increases the effective cost of labor

```
Effective Salary Cost = Base Salary × (1 + salary_tax_rate)
```

### Tax Revenue
- All tax revenue goes to the country treasury
- Countries use this for military spending, infrastructure, etc.

---

## Profit Calculation

### Daily Profit

```
Profit = Revenue - Input Costs - Wage Costs

Where:
  Revenue     = Daily Output × Output Price
  Input Costs = Daily Output × Σ (Input Item Market Price × Input Quantity Per Unit)
  Wage Costs  = Total Daily Wages for workers
```

For raw material producers (no input items required):
```
Profit = Revenue - Wage Costs
```

For automated production (no workers):
```
Profit = Revenue - Input Costs
```

### Profit Per Unit

```
Profit Per Unit = (Revenue / Units Produced) - (Total Costs / Units Produced)
```

---

## Country System

### Government
- Players vote in elections
- Elected officials form the government
- Government can:
  - Declare war
  - Form alliances
  - Set tax rates (trade tax, salary tax)
  - Spend country treasury

### Party Ethics System
- Each party has ethics with levels 0-2:
  - **Militarism** — Military-related bonuses
  - **Isolationism** — Defensive bonuses
  - **Imperialism** — Expansion bonuses
  - **Industrialism** — Production bonus for Ammo & Construction
  - **Agrarianism** — Production bonus for Food/agricultural goods
- The ruling party's ethics apply to all citizens

---

## Updating This Document

When game mechanics change or new ones are discovered:

1. Update the relevant section with the new formula/rule
2. Add a note about when the change was discovered
3. Update any affected features in [FEATURES.md](./FEATURES.md)
4. Ensure calculators in the application are updated to match

> **Format for changes:**
> ```
> > **Updated YYYY-MM-DD:** Description of what changed
> ```
