---
focus: concerns
last_mapped_commit: HEAD
date: 2026-05-29
---

# CONCERNS.md

## Technical Debt
- **Type Safety on Client Boundaries**: Ensure `zod` validation is correctly matching the database schema to avoid unexpected runtime errors.
- **Large Dependency Tree**: The application includes many heavy dependencies (Leaflet, jspdf, exceljs, aws-sdk). Bundle size should be monitored, especially for client-side load times.

## Potential Fragility
- **Database Migrations**: Be careful with `drizzle-kit push` in production; prefer `drizzle-kit migrate` with versioned migration files for production safety.

## Security
- Authentication relies on custom implementations (`bcryptjs`, `jose`) instead of a fully managed provider (like NextAuth or Clerk). Ensure these flows (token signing, password hashing) are rigorously verified against security vulnerabilities.
