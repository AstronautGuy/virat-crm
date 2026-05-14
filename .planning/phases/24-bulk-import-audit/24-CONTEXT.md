# Phase 24 Context: Bulk Import & Audit

## Goal
Enable administrators to manage the product catalog efficiently through bulk Excel uploads and perform a final verification audit of Milestone 6 features.

## Requirements
- **Excel Parsing**: Support `.xlsx` file uploads.
- **Product Upsert**: Match products by `SKU`. If a product exists, update its `name` and `price`. If not, create it.
- **Validation**:
  - `name`: Required, max 256 chars.
  - `sku`: Required, unique identifier.
  - `price`: Required, numeric (2 decimal places).
- **Feedback**: Provide the user with a summary of how many rows were processed, updated, created, or failed.
- **Admin Only**: Restrict import access to `Admin` role.
- **Audit**: Verify integrity of related data (inventory counts, customer relations) across Milestone 6.

## Technical Strategy
- **Library**: Use `exceljs` for reading the uploaded stream.
- **API**: Use Next.js API Route with `edge: false` (to handle file buffers).
- **UI**: Standardized Admin interface using `lucide-react` and `rounded-xl` design tokens.
- **Database**: Use `db.insert(...).onConflictDoUpdate(...)` for efficient batch processing.

## Success Criteria
- Admin can upload a valid Excel file and see products appear in the system.
- Duplicate SKUs update existing records.
- Invalid data (e.g., negative prices) is caught and reported without crashing the process.
- All Milestone 6 features are verified as functional.
