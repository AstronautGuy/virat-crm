# Phase 13 Context: Advanced Automated Reporting Engine

## Decisions
- **Export Format**: Only XLSX (Excel) is required.
- **Report Scopes**:
  - **Individual**: Specific employee performance.
  - **Team**: Immediate subordinates of a manager.
  - **Department**: Aggregated data across entire departments.
  - **Management**: Recursive subordinates (entire organization under a manager/admin).
- **Report Types**:
  - Daily
  - Monthly
  - Quarterly
  - Yearly
  - Lifetime
- **UI/UX**:
  - A dedicated "Reports" page will be created.
  - Users can select the report type and view a preview of the data.
  - A "Download XLSX" button will trigger the export.
- **Generation Logic**: 
  - Data fetching via tRPC (fetching raw sales/attendance/performance data).
  - Excel generation using `exceljs` on the client side (triggered by download button).
- **Exclusions**:
  - No automated emailing of reports is required at this stage.
  - No PDF generation is required.

## Technical Strategy
- **Library**: `exceljs` for XLSX generation, `file-saver` for triggering downloads in the browser.
- **Backend**: Update `analyticsRouter` or create a new `reportsRouter` to handle multi-frequency data aggregation.
- **Frontend**: Create `src/app/admin/reports/page.tsx` with a selection interface and data table preview.

## Verification Plan
- [ ] Verify that selecting "Daily" fetches data for the current day.
- [ ] Verify that selecting "Monthly" fetches data for the current month.
- [ ] Verify that "Download XLSX" produces a valid Excel file with correct headers and data.
- [ ] Verify that "Lifetime" report aggregates all historical data.
