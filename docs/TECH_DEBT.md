# Tech Debt

Known issues and improvements to address when time permits.

---

### TD-001: No input validation on query parameters

**Scope:** Project-wide (all controllers)  
**Severity:** Low  
**Example:** `company.controller.ts` — `days` query param parsed with `parseInt` but never validated. `NaN`, negative, or absurdly large values get forwarded to the external API.  
**Recommendation:** Add a shared validation utility or use NestJS `ParseIntPipe` with bounds checking. Should be addressed globally for consistency rather than per-endpoint.

---

### TD-002: `any` type usage in frontend component iterations

**Scope:** Frontend, primarily `CompanyDetail.tsx`  
**Severity:** Low  
**Example:** Worker rows use `(worker: any)` and `(w: any)` in reduce calls, bypassing type safety from the `Worker` interface.  
**Recommendation:** Type `workers` using the `Worker` interface from `client.ts`. Pre-existing pattern — address in a cleanup pass.
