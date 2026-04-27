# Structure

- `src/app/`: Next.js App Router pages and layouts (`page.tsx`, `layout.tsx`)
- `src/app/_components/`: React components used in the application
- `src/app/api/trpc/[trpc]/`: tRPC Next.js API handler
- `src/server/`: Backend code
  - `src/server/api/`: tRPC routers (`routers/`) and base configuration (`trpc.ts`, `root.ts`)
  - `src/server/db/`: Database configuration (`index.ts`) and Drizzle schema (`schema.ts`)
- `src/trpc/`: tRPC client setup (`react.tsx`, `server.ts`, `query-client.ts`)
- `src/styles/`: Global CSS (`globals.css` with Tailwind directives)
- `src/env.js`: Environment variable validation schema
