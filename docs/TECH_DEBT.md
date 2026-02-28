# Tech Debt

Known issues and improvements to address when time permits.

---

### TD-003: `as any` cast in production-calculator controller

**Scope:** Backend — `production-calculator.controller.ts`  
**Severity:** Low  
**Example:** `{ companyId } as any` is passed to `calculateProductionMetrics()` which expects a full `CompanyData` object. The method accesses `company.productionValue` which would be `undefined` from this partial object.  
**Recommendation:** Investigate whether this endpoint is actively used. If so, either load the full company data first or refactor the method to accept `companyId` directly.

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
