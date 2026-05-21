# Plan: Phase 4 UAT Gap Closure

Fix identified issues: RBAC error handling, IDOR protection in replacements, and granular address fields.

## Proposed Changes

### [MODIFY] [sales.ts](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/src/server/db/schema/sales.ts)

- Add columns: `addressLine1`, `landmark`, `area`, `city`, `state`.

### [MODIFY] [sales.ts](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/src/server/api/routers/sales.ts)

- Accept granular address fields in `createSale`.
- Update `updateSaleStatus` to provide more context in errors.

### [MODIFY] [replacements.ts](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/src/server/api/routers/replacements.ts)

- Tighten `createReplacement` to check for team ownership of the original sale.

### [MODIFY] [sales/new/page.tsx](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/src/app/sales/new/page.tsx)

- Implement granular address fields in form.
- Add Pincode auto-fill effect.

### [MODIFY] [sales/page.tsx](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/src/app/sales/page.tsx)

- Add toast/alert handling for `updateSaleStatus` errors.

## Verification Plan

- Manual verification of RBAC, IDOR, and Pincode auto-fill as defined in the implementation plan.
