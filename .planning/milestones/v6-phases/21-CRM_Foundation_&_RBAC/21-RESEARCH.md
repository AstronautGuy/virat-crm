# Research: Phase 21 (CRM Foundation & RBAC)

## Pincode to Village Lookup

- **API Choice**: `https://api.postalpincode.in/pincode/{Pincode}`
  - Format: Returns an array with `Message`, `Status`, and `PostOffice` array.
  - `PostOffice` items contain `Name` (Village/Locality), `District`, `State`.
  - Rate Limits: None specified for public use, but should be cached or fetched client-side to avoid server-side overhead.
- **Frontend Implementation**:
  - User enters 6-digit pincode.
  - Fetch from API.
  - Populate a `Select` dropdown for "Village" with the names returned.
  - Auto-fill "District" and "State" fields.

## Schema Implementation (Drizzle/PostgreSQL)

- **Table**: `customers`
  - `id`: uuid primaryKey.
  - `name`: text/varchar(256).
  - `mobile`: varchar(15).
  - `dob`: timestamp/date.
  - `pincode`: varchar(6).
  - `village`: text.
  - `district`: text.
  - `state`: text.
  - `address`: text.
  - `branchId`: integer references `branches`.
  - `status`: pgEnum `customer_status` ('Draft', 'Approved').
  - `createdBy`: uuid references `users`.
- **RBAC Enforcement**:
  - `managerProcedure`: For all mutations (Create, Update, Delete).
  - `protectedProcedure`: For `get` and `list` queries.
  - Employees can call a specific `propose` mutation (which uses `protectedProcedure` but forces `status: 'Draft'`).

## Financial Data (Sales Table Update)

- **Table**: `sales` (already exists, need to add columns).
  - `totalAmount`: decimal(12, 2).
  - `advanceReceived`: decimal(12, 2).
  - `balanceAmount`: decimal(12, 2) (calculated as total - advance).
- **Precision**: Using `decimal` instead of `float` to prevent rounding errors.

## Reuse & Patterns

- **Table Component**: Use existing `DataTable` or `DataTableToolbar` patterns from `src/app/_components/ui`.
- **Form Component**: Use `react-hook-form` and `zod` as seen in `src/app/_components/forms` (if any exist).
- **Isolation**: Ensure `and(eq(customers.branchId, ctx.dbUser.branchId))` is applied for non-Admin users in all queries.
