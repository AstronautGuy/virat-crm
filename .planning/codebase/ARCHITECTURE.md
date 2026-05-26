# Architecture

**Date Mapped:** 2026-05-26

## 1. High-Level System Design
The application is a full-stack CRM and inventory management system with a Next.js (App Router) monolithic backend and frontend, and a React Native (Expo) mobile companion app.

### Core Paradigms
- **T3 Stack Architecture**: Utilizing Next.js, tRPC, React Query, and Tailwind CSS.
- **Client-Server Communication**: tRPC for end-to-end typesafe API calls.
- **Database Access**: Drizzle ORM connecting to a PostgreSQL database.

## 2. Key Components
### Web Frontend (`src/app` & `src/components`)
- **Routing**: Next.js App Router for server and client components.
- **State Management**: React Context, React Query (via tRPC) for server state.
- **Forms**: React Hook Form with Zod schema validation.

### Backend (`src/server`)
- **API Layer**: `src/server/api/routers` contains tRPC routers defining the backend endpoints.
- **Database Layer**: `src/server/db` contains Drizzle configuration and a modular schema definition (`src/server/db/schema/*`).

### Mobile App (`mobile/`)
- **Framework**: Expo / React Native.
- **Purpose**: Primarily used for field-agent capabilities, focusing on location tracking (`expo-location`) and potentially WebView rendering (`react-native-webview`) or native CRM views.

## 3. Data Flow
1. **User Action**: The user interacts with the UI in Next.js or the Expo App.
2. **API Request**: The client dispatches a typesafe tRPC request using React Query hooks (`api.router.procedure.useQuery/useMutation`).
3. **Backend Router**: The tRPC router in `src/server/api/routers` receives the request. Zod validates the input.
4. **Data Access**: The router interacts with the PostgreSQL DB via Drizzle ORM (`ctx.db`).
5. **Response**: Data is returned seamlessly to the frontend, updating the React Query cache and triggering a re-render.

## 4. Key Abstractions
- **Context Layer (`src/server/api/trpc.ts`)**: Injects dependencies (like the db instance and session data) into every tRPC resolver.
- **Modular DB Schema**: Tables are defined in isolated files within `src/server/db/schema` and aggregated in `index.ts`.
