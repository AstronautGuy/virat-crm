# Tech Stack

**Date Mapped:** 2026-05-26

## 1. Core Technologies
- **Monorepo Structure**: Web (root) and Mobile (`mobile/`) apps
- **Package Manager**: pnpm (11.2.2)
- **Language**: TypeScript (5.8.2)

## 2. Web Application (Root)
- **Framework**: Next.js (15.2.3) with Turbo
- **UI Library**: React (19.0.0)
- **Styling**: Tailwind CSS (4.0.15), Radix UI primitives, Framer Motion
- **Data Fetching/API**: tRPC (11.17.0) with React Query (5.69.0)
- **Database ORM**: Drizzle ORM (0.41.0) for PostgreSQL
- **Schema Validation**: Zod (3.24.2)
- **PWA Capabilities**: Serwist (9.5.10)
- **Map Components**: Leaflet (1.9.4) & React Leaflet
- **Forms**: React Hook Form with Hookform Resolvers
- **Authentication/Security**: bcryptjs, jose, input-otp

## 3. Mobile Application (`mobile/`)
- **Framework**: Expo (54.0.0) / React Native (0.81.5)
- **Location Services**: expo-location
- **Background Tasks**: expo-task-manager
- **Web Integration**: react-native-webview

## 4. Development & Build Tools
- **Linter**: ESLint (9.23.0) with Next.js config
- **Formatter**: Prettier
- **Database Tools**: Drizzle Kit (0.30.5)

## 5. Deployment
- **Type**: Vercel/Next.js hosting ready (ct3a metadata present)
