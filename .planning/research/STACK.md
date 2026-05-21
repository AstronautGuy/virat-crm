# Research: Stack Additions for Milestone 6

## Summary

Milestone 6 requires robust handling of bulk data (Excel/CSV), document/receipt storage, and potentially enhanced financial calculations.

## Recommended Libraries

### 1. Bulk Data Operations (Excel/CSV)

- **Library**: `xlsx` (SheetJS)
- **Rationale**: The industry standard for parsing and writing Excel files in Node.js and the browser.
- **Integration**: Use server-side for heavy processing and client-side for simple exports.
- **Alternative**: `exceljs` (better for complex styling, but heavier).

### 2. File Uploads (Receipts/Documents)

- **Current Stack**: Cloudflare R2 + custom storage router.
- **Requirement**: No new stack changes needed, but `uploadthing` could simplify the client-side UI if we want to offload the upload logic further.
- **Recommendation**: Stick with current R2 implementation to avoid vendor sprawl.

### 3. Image Processing (Receipts)

- **Library**: `sharp` (server-side)
- **Rationale**: Essential for resizing and compressing receipt uploads to stay under the 5MB limit and save storage costs.

### 4. Financial Accuracy

- **Library**: `decimal.js`
- **Rationale**: Critical for expense tracking and procurement to avoid floating-point errors in tax and total calculations.

## Implementation Notes

- Install `xlsx`, `sharp`, and `decimal.js` as dependencies.
- Use `decimal.js` for all math in `procurement` and `expenses` routers.
