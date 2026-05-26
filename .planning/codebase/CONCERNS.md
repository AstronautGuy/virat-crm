# Concerns

**Date Mapped:** 2026-05-26

## 1. Technical Debt & Architecture
- **Testing Framework**: While there is a `tests` directory, the `package.json` scripts lack a dedicated, standard test runner command (like `jest` or `vitest`). This indicates testing might not be fully automated or integrated into the standard development workflow yet.
- **Monorepo Setup**: The project uses a `pnpm-workspace.yaml` with a Next.js app at the root and an Expo app in `mobile/`. This pattern, while simple, can sometimes lead to root dependency pollution compared to a strict isolated workspace setup (like Turborepo or Nx).

## 2. Security
- **Authentication Handlers**: Needs thorough verification to ensure that tRPC endpoints properly validate user sessions and roles via the context layer, as CRM data is highly sensitive.

## 3. Fragile Areas
- **Mobile/Web State Sharing**: If the Expo app and Next.js web app share complex schema definitions (`src/server/db/schema`), ensuring the mobile app reliably imports or accesses these without pulling in Node-only dependencies is a common fragile point in this type of monorepo.
- **PWA Configuration**: `serwist` is used for PWA support. The service worker cache and background sync logic (`sw.ts`) should be carefully managed to avoid stale data in an offline-first CRM scenario.
