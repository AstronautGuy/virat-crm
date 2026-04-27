# Architecture

- **Frontend:** Next.js App Router (React Server Components + Client Components)
- **Backend:** Next.js Route Handlers (`/api/trpc/*`) exposing a tRPC API
- **Data Access:** Drizzle ORM querying a PostgreSQL database directly from Server Components or tRPC procedures
- **State Management:** React Query (via `@trpc/react-query`) for remote state handling
- **Type Safety:** End-to-end type safety from database schema (Drizzle) through backend API (tRPC/Zod) to frontend components
