# Phase 23 Context: Bulk Export Utilities

## Decisions

- **Export Format & Styling**: Styled Excel sheets using `exceljs`. Files will include bold headers and frozen top rows for professional reporting.
- **Download Architecture**: Standard REST API Endpoints (e.g., `app/api/export/sales/route.ts`). Instead of straining tRPC with large binary base64 string responses, we will stream native `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` buffers directly to the browser for robust, high-performance downloads.
- **Export Filtering**: Keep it simple initially. The UI will provide a "Date Range" picker and an "Export All" button for the Admin.

## Specifics

- Use the newly implemented `Inter` font and `rounded-xl` buttons from Phase 25 when building the Export UI.
- Secure all API routes using the existing session and role checks (must be Admin).

## Deferred

- Custom field selection/column pickers (defer to a future "Custom Reports" phase if needed).

## Canonical refs

- None
