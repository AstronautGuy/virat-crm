---
focus: arch
last_mapped_commit: HEAD
date: 2026-05-29
---

# ARCHITECTURE.md

## System Pattern
The application follows the **T3 Stack Architecture**, providing a full-stack type-safe React application.

## Layers
1. **Frontend (Presentation)**
   - Built with React 19 Server Components and Client Components in Next.js App Router (`src/app`).
   - Uses Tailwind CSS and shadcn/ui for styling.
   - Communicates with backend via tRPC hooks (`@trpc/react-query`).
2. **Backend (API)**
   - API routes handled by Next.js edge/node runtimes (`src/app/api`).
   - Core logic encapsulated in tRPC routers (`src/server/api/routers`).
   - Business logic typically placed directly in router procedures or `src/lib`.
3. **Data Access**
   - Drizzle ORM (`src/server/db`) manages database schema and queries.
   - Types are inferred directly from the database schema and shared with the frontend.

## Data Flow
Client Component -> tRPC Hook -> Next.js Route Handler (`/api/trpc`) -> tRPC Router -> Drizzle ORM -> PostgreSQL Database.
