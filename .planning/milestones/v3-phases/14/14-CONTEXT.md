# Phase 14 Context: Milestone 3 Audit & Hardening

## Goals

- **Map Data Hardening**: Restrict live map data fetching to a single day.
- **Report Optimization**: Refactor "Lifetime" reports to be aggregated year-wise.
- **Package Manager Consolidation**: Remove redundant package manager files and standardize on `pnpm`.
- **Security Review**: Comprehensive audit of Milestone 3 features (Location, Hierarchy, Reports).

## Initial Assessment

- **Maps**: Currently fetching all active logs. We might need a date limit or pagination if users have months of breadcrumb data.
- **Reports**: Large "Lifetime" reports could potentially timeout on the server or crash the browser during Excel generation.
- **Hierarchy**: The Recursive CTE is efficient but we should ensure there are no cycles in the manager-subordinate relationships.

## Decisions

1.  **Map Scope**: Live map will only fetch logs where `date` is today's date.
2.  **Lifetime Aggregation**: "Lifetime" reports will group data by year in the Excel export.
3.  **Standard Tooling**: `pnpm` will be the sole package manager. `package-lock.json` and other `npm`/`yarn` artifacts will be removed.
