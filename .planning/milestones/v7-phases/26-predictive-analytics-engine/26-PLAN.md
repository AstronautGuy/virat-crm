# Phase 26: Predictive Analytics Engine - Plan

## Proposed Changes

### Backend Routing

#### [MODIFY] [reports.ts](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/src/server/api/routers/reports.ts)

- Implement `getSalesForecast` procedure.
- Query historical sales data, grouped by month/week.
- If less than 3 periods exist, fall back gracefully to a baseline projection.
- Calculate time-series forecasting using linear regression (or exponential smoothing).
- Forecast 3 future periods.
- Add standard error calculations for optimistic (+95%) and pessimistic (-95%) intervals.

### Frontend Presentation

#### [MODIFY] [page.tsx](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/src/app/admin/reports/page.tsx)

- Integrate a new "Predictive Forecasting" tab.
- Render a Soft Modernist interactive line chart using Recharts showing:
  - Historical Actual Revenue (solid line).
  - Projected Revenue (dotted line).
  - Standard error boundary/shading.
- Add summary widgets:
  - Forecasted Next Month Revenue.
  - Overall Sales Trend (Growth/Decline %).
  - Confidence Score.
- Style with beautiful gradients, glassmorphism panels, and highly polished micro-interactions.

---

## Verification Plan

### Automated Verification

- Run typecheck: `pnpm typecheck`
- Run linting: `npx eslint src/app/admin/reports/page.tsx`

### Manual Verification

- Deploy CRM locally and check the "/admin/reports" dashboard.
- Verify switching branch/scope updates the forecast correctly.
- Test empty/low-data database states to ensure the page doesn't crash and instead shows a polite, clean descriptive fallback.
