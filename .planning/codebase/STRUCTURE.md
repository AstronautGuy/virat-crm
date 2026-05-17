# Codebase Structure

**Analysis Date:** 2026-05-17

## Directory Layout

```
virat-crm/
├── .planning/             # GSD workspace planning and documentation
│   └── codebase/          # Codebase mapping documents (STACK, ARCHITECTURE, etc.)
├── docs/                  # Project specifications, designs, and guides
├── drizzle/               # Auto-generated SQL migration files from Drizzle Kit
├── mobile/                # Flutter cross-platform mobile application
│   ├── android/           # Native Android host project config and source
│   ├── ios/               # Native iOS host project config and source
│   ├── lib/               # Dart application source code
│   │   ├── core/          # App-wide configurations, theme, and API clients
│   │   ├── data/          # Offline databases models and repository patterns
│   │   └── presentation/  # Visual UI screens, Riverpod states, and guards
│   └── test/              # Flutter UI and logic test files
├── public/                # Static assets, site icons, and progressive web app manifest
├── src/                   # Next.js and tRPC full-stack application source
│   ├── app/               # App Router pages, templates, and backend REST endpoints
│   ├── components/        # React components (features, layouts, transitions)
│   │   └── ui/            # Granular shadcn/headless visual components
│   ├── hooks/             # Custom React lifecycle hooks
│   ├── server/            # Backend server code
│   │   ├── api/           # tRPC server procedures and routes config
│   │   ├── db/            # Database initialization, seed scripts, and schemas
│   │   └── lib/           # Auth encryption, push notifications, and S3 clients
│   ├── styles/            # Styling sheets (globals, Tailwind rules)
│   └── trpc/              # Client-side tRPC configuration and providers
└── tests/                 # Custom Node test scripts (RBAC and validation rules)
```

## Directory Purposes

**mobile/lib/core/**
- Purpose: Configures app-wide constants, shared preferences, styling setups, and the core HTTP layer.
- Contains: `config.dart` (baseUrl setup), `theme.dart` (app styles and dark mode setup), `api_client.dart` (Dio configurations).

**mobile/lib/data/**
- Purpose: Implements models for Isar Database caching and defines remote data sync routines.
- Subdirectories:
  - `models/` - Schemas representing physical local DB collections (`sync_item.dart`, `product.dart`).
  - `repositories/` - Data retrieval and queuing patterns (`sync_repository.dart`, `crm_repository.dart`, `auth_repository.dart`).

**mobile/lib/presentation/**
- Purpose: Renders layout screens, manages local state, and implements routing gates.
- Subdirectories:
  - `guards/` - Router filters like `location_gate.dart` ensuring geotracking remains active.
  - `screens/` - Main page widgets (`login_screen.dart`, `dashboard_screen.dart`, `profile_screen.dart`).
  - `providers/` - Riverpod state managers.
  - `widgets/` - Reusable UI widgets.

**src/app/**
- Purpose: Directory-based routing for pages and APIs under the Next.js App Router.
- Contains: Individual page files (`page.tsx`), root layouts (`layout.tsx`), page transition configs (`template.tsx`), and REST API endpoints under `/api`.

**src/server/api/**
- Purpose: Declares server-side API routers, middleware boundaries, and RBAC procedures.
- Contains:
  - `trpc.ts` - Context setups (`createTRPCContext`), base procedures (`publicProcedure`, `protectedProcedure`, `adminProcedure`, `managerProcedure`, and features gates).
  - `root.ts` - Merges sub-routers.
  - `routers/` - Domain-specific endpoints (`auth.ts`, `sales.ts`, `location.ts`, `inventory.ts`).

**src/server/db/**
- Purpose: Establishes database pools, handles migrations, and defines entities.
- Contains:
  - `index.ts` - Exports the main `db` connection instance.
  - `schema/` - 24 granular relational schema files (`users.ts`, `sales.ts`, `locationLogs.ts`, `inventory.ts`).
  - `seed.ts` - populates initial system parameters, roles, and admin users.

**src/server/lib/**
- Purpose: Encapsulates third-party cloud connections and cryptography logic.
- Contains: `auth.ts` (JWT handling), `r2.ts` (Cloudflare R2 S3 Client), `push.ts` (Web Push VAPID details), `monitoring.ts` (execution watchers).

## Key File Locations

**Entry Points:**
- `src/app/page.tsx` - Root Next.js web application landing page.
- `mobile/lib/main.dart` - Entry point for compiling and running the Flutter app.
- `mobile/lib/services/heartbeat_service.dart` - Background foreground-mode tracking thread.

**Configuration:**
- `tsconfig.json` - Path mapping setups (e.g. `@/*` resolved to `src/*`).
- `drizzle.config.ts` - Configures Drizzle Kit generators pointing to Postgres.
- `package.json` - Global script runners and dependency declarations.
- `.env` & `src/env.js` - Secrets, credentials, and configuration variables validated at startup.

**Core Logic:**
- `src/server/api/trpc.ts` - Gateway containing system procedures and middleware checks.
- `src/middleware.ts` - Client cookies session refresher.
- `mobile/lib/data/repositories/sync_repository.dart` - Core offline sync state engine.

**Testing:**
- `tests/validation.test.ts` - Custom assertion scripts verifying India pincode parsing and RBAC behaviors.

**Documentation:**
- `README.md` - Workspace guidelines and onboarding manual.
- `MOBILE-SPEC.md` - Technical specification for the mobile synchronization layer.
- `DESIGN.md` - Visual aesthetics, theme palettes, and UI rules.

## Naming Conventions

**Files:**
- `PascalCase.tsx` - All React visual components in `src/components/*` and layouts.
- `kebab-case.ts` - Modules, database schemas, tRPC routers, server actions, and general scripts.
- `kebab-case.dart` - All Dart files inside Flutter's `lib/` directories.
- `*.test.ts` - Node automation scripts.

**Directories:**
- `kebab-case` - Standard folder naming.
- `_components` - Folders prefixed with an underscore are excluded from Next.js App Router routing.

**Special Patterns:**
- `index.ts` - Re-exports modules inside directories (barrel pattern).
- `*.g.dart` - Auto-generated code outputs created by compiler engines (e.g. Isar schemas).

## Where to Add New Code

**New Database Entity:**
- Relational Schema: Add a file `src/server/db/schema/{entity}.ts` and register it inside `src/server/db/schema/index.ts`.
- Database Migrations: Run command `pnpm db:generate` to output schema updates in `drizzle/`, then apply to DB using `pnpm db:push`.

**New Server Procedure (API):**
- Router Logic: Add a sub-router at `src/server/api/routers/{domain}.ts` using `createTRPCRouter` and appropriate procedures.
- Route Registry: Merge the router in the root registry at `src/server/api/root.ts`.

**New Web Client Page:**
- Route Endpoint: Create directory `src/app/{route}` and define a `page.tsx` file inside it. Use custom layout wrappers if required.

**New Mobile Screen / Caching:**
- Isar Cache: Define a Dart class with `@collection` annotation under `mobile/lib/data/models/{entity}.dart`.
- Code Generation: Run `flutter pub run build_runner build --delete-conflicting-outputs` within `/mobile` folder.
- Repository Action: Implement query logic in `mobile/lib/data/repositories/{domain}_repository.dart`.
- Screen layout: Mount providers, create Riverpod listeners, and append UI inside `mobile/lib/presentation/screens/{name}_screen.dart`.

## Special Directories

**drizzle/**
- Purpose: SQL statements tracking database structure changes.
- Source: Automatically outputted by Drizzle Kit.
- Committed: Yes (source of truth for DB state transitions).

**mobile/build/ & .next/**
- Purpose: Visual layout and scripting outputs compiled for target execution devices.
- Source: Auto-generated by Flutter compiler and Next.js compiler.
- Committed: No (specifically excluded in `.gitignore` configurations).

---

*Structure analysis: 2026-05-17*
*Update when directory structure changes*
