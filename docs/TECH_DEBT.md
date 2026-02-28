# Tech Debt

Known issues and improvements to address when time permits.

---

---

### TD-005: `any` typed `ProfitScenario.breakdown`

**Scope:** Backend — `production-calculator/production-calculator.service.ts`  
**Severity:** Low  
**Example:** `breakdown: any` in the `ProfitScenario` interface. The breakdown object has different shapes depending on the scenario (buy inputs vs self-produce vs raw material), so a union or discriminated type would be appropriate.  
**Recommendation:** Define a `ProfitBreakdown` interface (or a union of scenario-specific breakdown types) to replace `any`.

---

## Resolved

### ~~TD-001: No input validation on query parameters~~ ✅ Resolved 2026-02-28

**Scope:** Project-wide (all controllers)  
**Severity:** Low  
**Resolution:** Created shared `backend/src/common/parse-query.ts` with `parseIntParam` and `parseFloatParam` utilities (bounds clamping, NaN handling). Applied to all 4 controllers: `company`, `price-history`, `production-analytics`, `production-calculator`.

---

### ~~TD-002: `any` type usage in frontend component iterations~~ ✅ Resolved 2026-02-28

**Scope:** Frontend, primarily `CompanyDetail.tsx`  
**Severity:** Low  
**Resolution:** Imported `Worker` interface from `client.ts`, explicitly typed `workers` as `Worker[]`, removed all 8 `any` annotations. Types now inferred correctly from the array type.

---

### ~~TD-003: `as any` cast in production-calculator controller~~ ✅ Resolved 2026-02-28

**Scope:** Backend — `production-calculator.controller.ts`  
**Severity:** Low  
**Resolution:** Refactored `calculateProductionMetrics()` to accept `productionValue: number` directly instead of a full `CompanyData` object. Controller now loads the company via `CompanyService.getCompanyProductionValue()` (lightweight DB-only query). Also properly typed `calculateRawMaterialProfit()` params (`CompanyData`, `GameItem`) — exported `GameItem` from `game-config.service.ts`.

---

### ~~TD-004: `any` typed API responses across backend services~~ ✅ Resolved 2026-02-28

**Scope:** Backend — all `WarEraApiService.request()` call sites  
**Severity:** Low  
**Resolution:** Created `warera-api/warera-api.types.ts` with typed interfaces for all tRPC API responses (prices, game config, companies, work offers, workers, users, MUs, transactions, trading orders) plus a generic `TrpcResponse<T>` wrapper and `extractData()` helper. Applied typed responses across all 5 services: `market-price`, `game-config`, `company`, `mu`, `trading-order`. Eliminated all 9 `request<any>()` calls and 2 `batchRequest<any>()` calls.
