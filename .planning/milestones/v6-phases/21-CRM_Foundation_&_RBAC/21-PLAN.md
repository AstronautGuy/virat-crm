# Plan: Phase 21 - CRM Foundation & RBAC

Establishing the core customer database and securing it with manager-only editing rights.

## User Review Required

> [!IMPORTANT]
> The "Pincode to Village" lookup relies on the public `postalpincode.in` API. This is a free service; if it fails, the user can still manually enter the details.

## Proposed Changes

### 1. Database Schema

#### [NEW] [customers.ts](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/src/server/db/schema/customers.ts)

- Define `customers` table with: `id`, `name`, `mobile`, `dob`, `pincode`, `village`, `district`, `state`, `address`, `branchId`, `status` ('Draft', 'Approved'), `createdBy`, `createdAt`, `updatedAt`.
- Export `customerStatusEnum`.

#### [MODIFY] [sales.ts](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/src/server/db/schema/sales.ts)

- Add `totalAmount` (decimal), `advanceReceived` (decimal), `balanceAmount` (decimal).
- Link to `customers.id` via `customerId` (optional for now).

#### [MODIFY] [index.ts](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/src/server/db/schema/index.ts)

- Export everything from `customers.ts`.

### 2. API Layer

#### [NEW] [crm.ts](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/src/server/api/routers/crm.ts)

- `getBranchCustomers`: List customers for the user's branch (or all for Admin).
- `getCustomerById`: Detail view with order history summary.
- `createCustomer`: `managerProcedure` (auto-approves).
- `proposeCustomer`: `protectedProcedure` (forces 'Draft' status).
- `updateCustomer`: `managerProcedure`.

#### [MODIFY] [root.ts](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/src/server/api/root.ts)

- Register `crmRouter`.

### 3. Frontend Components

#### [NEW] [CustomerForm.tsx](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/src/app/_components/crm/CustomerForm.tsx)

- React Hook Form + Zod.
- Pincode field with `onChange` listener to trigger `postalpincode.in` fetch.
- Select dropdown for Village (populated from API).

#### [NEW] [CustomerList.tsx](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/src/app/_components/crm/CustomerList.tsx)

- Searchable table with branch-level isolation.
- Displays "Total Pending" (computed from sales balances).

### 4. Pages

#### [NEW] [page.tsx](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/src/app/crm/page.tsx)

- Customer directory page.

## Verification Plan

### Automated Tests

- Run `npx drizzle-kit push` to verify schema changes.
- Check TRPC panel (if available) or use a temporary test script to verify `proposeCustomer` vs `createCustomer` permissions.

### Manual Verification

1. Log in as **Employee**:
   - Verify only "Add Customer" (Draft) is possible.
   - Verify "Edit/Delete" is hidden/blocked.
2. Log in as **Manager**:
   - Verify "Approve" button for Draft customers.
   - Verify full Edit capability.
3. Test Pincode Lookup:
   - Enter `110001` -> Verify New Delhi/Delhi/State pops up.
