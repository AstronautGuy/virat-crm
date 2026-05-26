# Directory Structure

**Date Mapped:** 2026-05-26

## 1. Root Structure
```text
/
├── .planning/       # Agent planning, notes, and codebase maps
├── mobile/          # Expo / React Native mobile application
├── public/          # Static assets for the web app
├── src/             # Next.js web application source
├── package.json     # Web app dependencies and scripts
├── tailwind.config.ts  # Tailwind CSS configuration
└── tsconfig.json    # TypeScript configuration
```

## 2. Web Application (`src/`)
```text
src/
├── app/             # Next.js App Router
│   ├── _components/ # Shared layout/page components
│   ├── api/         # Next.js API Routes (e.g., tRPC handler)
│   ├── [routes]/    # Feature routes (admin, crm, inventory, sales, etc.)
│   ├── layout.tsx   # Root layout
│   └── page.tsx     # Landing/Dashboard page
├── components/      # Reusable UI components (shadcn/ui, etc.)
├── env.js           # Environment variable validation (T3 Env)
├── hooks/           # Custom React hooks (e.g., use-location-breadcrumbs.ts)
├── lib/             # Utility functions and library wrappers
├── server/          # Backend logic
│   ├── api/         # tRPC Routers
│   │   ├── routers/ # Feature-specific routers
│   │   ├── root.ts  # Main router aggregating all routers
│   │   └── trpc.ts  # tRPC context and procedure definitions
│   ├── db/          # Database configuration
│   │   ├── schema/  # Drizzle table definitions
│   │   └── index.ts # Drizzle client initialization
│   └── lib/         # Backend-only utilities
├── styles/          # Global CSS files
└── trpc/            # Frontend tRPC client setup
```

## 3. Mobile Application (`mobile/`)
```text
mobile/
├── android/         # Native Android build configuration
├── ios/             # Native iOS build configuration
├── App.tsx / index.js # Mobile app entry points
├── app.json         # Expo configuration
└── package.json     # Mobile dependencies
```

## 4. Key Locations & Concepts
- **Database Schema**: Located in `src/server/db/schema/*.ts`. Centralized schema for CRM entities (sales, customers, inventory, leaves, users).
- **Backend Handlers**: Located in `src/server/api/routers/*.ts`.
- **Frontend Pages**: Located in `src/app/**/page.tsx`.
