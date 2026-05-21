# Phase 26: Predictive Analytics Engine - Context

**Gathered:** 2026-05-19
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers a predictive time-series modeling engine for sales forecasting and embeds high-value visualizations into the Intelligence Reports dashboard.
Specifically, it implements:

1. A backend forecasting algorithm (e.g., Holt-Winters / Linear Regression with Seasonality) exposed via tRPC.
2. A premium UI dashboard tab inside Intelligence Reports showing historical sales vs. future projections.
3. Highly responsive charts with confidence boundaries conforming to Soft Modernism UI specifications.

</domain>

<decisions>
## Implementation Decisions

### Predictive Engine Algorithm & Time-series Modeling

- **Algorithm Choice**: Holt-Winters Exponential Smoothing or Linear Regression with seasonal adjustment, implemented in TypeScript.
- **Aggregation Interval**: Monthly and Weekly aggregation depending on selected range.
- **Forecasting Horizon**: Next 3 periods (e.g., next 3 months or next 3 weeks).
- **Model Training Window**: At least 6-12 months of historical data, falling back to all available history if less.

### Forecasting Parameters & Seasonality

- **Seasonality Handling**: Yes, with a weighted seasonal multiplier calculated from prior months/weeks.
- **Confidence Intervals**: Display optimistic (+95%) and pessimistic (-95%) prediction intervals.
- **Product/Branch Granularity**: Global and branch-level forecasting depending on the active branch filter.
- **External Variables**: Exclude external factors, keeping the model purely historical time-series driven to maintain high reliability and performance.

### Dashboard Visualization & UI Integration

- **Visual Representation**: Dual-line chart (historical actual vs. projected dotted future) using a beautiful modern chart library (Recharts).
- **Visual Theme & Premium Design**: Soft Modernism UI matching the application, with sleek glassmorphism panels, gradients, and clear micro-interaction tooltips.
- **Location on Portal**: Integrated as a new tab ("Predictive Forecasting") on the `/admin/reports` page.
- **Mobile Responsiveness**: Fully responsive charts designed to scale down to 320px screen width.

### the agent's Discretion

- The exact regression coefficients, fallback weight values, and specific charting color choices are left to the agent's discretion for optimal implementation.

</decisions>

<code_context>

## Existing Code Insights

### Reusable Assets

- `reportsRouter` in `src/server/api/routers/reports.ts` for sales data retrieval.
- `DashboardLayout` in `src/app/_components/layout/DashboardLayout.tsx` for layout styling.
- `cn` utility for dynamic class styling.

### Established Patterns

- tRPC procedures secured via `featureProtectedProcedure` middleware.
- Client-side page layout with Lucide icons.
- Excel spreadsheet export patterns (`lib/excel.ts`).

### Integration Points

- `/admin/reports` page: add a new UI tab for Predictive Analytics alongside the existing report filters.
- `reportsRouter`: add a new protected procedure `getSalesForecast` returning forecast data.

</code_context>

<specifics>
## Specific Ideas

- Show dynamic tooltip details displaying forecasted value, upper bounds, and lower bounds on hover.
- Make the predictive analytics completely responsive so it works perfectly in mobile wrappers.

</specifics>

<deferred>
## Deferred Ideas

- Advanced machine learning/TensorFlow.js models (out of scope for standard time-series scaling, which is better suited for fast SQL/TS analytics).

</deferred>
