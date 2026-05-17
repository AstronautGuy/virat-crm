# Technology Stack

**Analysis Date:** 2026-05-17

## Languages

**Primary:**
- **TypeScript 5.8.2** - All server-side API routers, database schema definitions, Next.js web client, and configuration tooling.
- **Dart 3.11.5+** - All mobile application code, including state management, models, screens, and background services.

**Secondary:**
- **Kotlin 1.8+** - Android native host implementation (`MainActivity.kt`) and configurations.
- **Swift / Objective-C** - iOS native host implementation and configurations.
- **JavaScript (ES Module)** - Config files, DB sync/drop scripts, and next-env.

## Runtime

**Environment:**
- **Node.js 20.x (LTS)** or higher - Server runtime environment for Next.js and build tooling.
- **Flutter SDK 3.11.5+** - Cross-platform mobile development framework and build engine.
- **Modern Browser Runtimes** - Client execution environment supporting progressive web app (PWA) features.

**Package Manager:**
- **pnpm 10.33.0** - High-performance Node package manager with workspace capabilities.
- **pub (Dart)** - Package manager for Dart and Flutter dependencies.
- Lockfiles: `pnpm-lock.yaml` (root) and `pubspec.lock` (mobile) are present.

## Frameworks

**Core:**
- **Next.js 15.2.3 (App Router)** - Full-stack web framework providing server rendering, static optimization, and routing.
- **React 19.0.0** - Core library for building interactive user interfaces.
- **tRPC 11.17.0** - End-to-end typesafe API framework for React-to-Node communication.
- **Flutter Framework** - Cross-platform mobile framework utilizing Skia/Impeller engines for high-performance UI rendering.

**Testing:**
- Custom node test scripts using standard `assert` module and run via `tsx` compiler. No heavy-weight runners like Vitest or Jest are currently installed.

**Build / Development:**
- **Tailwind CSS 4.0.15** - Next-generation utility-first styling engine with native PostCSS support.
- **Drizzle Kit 0.30.5** - Database schema management and migrations generator.
- **TypeScript Compiler (tsc)** - Types and compilation checking.
- **PostCSS 8.5.3** - Used by Tailwind v4.0 for styling transpilation.

## Key Dependencies

### Web / Server Core:
- **drizzle-orm 0.41.0** - Headless TypeScript ORM connecting to PostgreSQL.
- **postgres 3.4.4** - Highly efficient PostgreSQL client for Node.js.
- **zod 3.24.2** - Robust schema validation library used for environment variables, tRPC inputs, and database mappings.
- **@serwist/next 9.5.10** - PWA integration layer for Next.js, supporting service workers, precaching, and offline capability.
- **@aws-sdk/client-s3 3.1041.0** - AWS S3 client used for Cloudflare R2 bucket interactions (uploads/presigned URLs).
- **bcryptjs 3.0.3** - Blowfish-based hashing library for securing password hashes.
- **jose 6.2.3** - JWT signing and verification for session management.

### Web / Client UI:
- **framer-motion 12.38.0** - Advanced animation and interaction library.
- **reactflow 11.11.4** - Custom UI node and flow charting library.
- **recharts 3.8.0** - D3-based charting components.
- **leaflet 1.9.4 & react-leaflet 5.0.0** - Interactive maps for tracking and location logs.
- **vaul 1.1.2** - Accessible drawer component (collapsible sheet).
- **sonner 2.0.7** - Beautiful, customizable toast notification manager.
- **@radix-ui/react-*** - Headless UI components (dialogs, dropdowns, popovers, select, tabs, etc.).

### Mobile Application:
- **flutter_riverpod 2.5.1** - State management library based on reactive caching.
- **dio 5.4.3+1** - Feature-rich HTTP client with interceptors and global configurations.
- **isar 3.1.0+1** - Extremely fast, local, offline-first database for Flutter apps.
- **geolocator 13.0.1** - GPS location acquisition library supporting background geolocation.
- **flutter_background_service 5.0.7** - Runs background tasks in native Android/iOS hosts.
- **connectivity_plus 6.0.3** - Network status tracking (WiFi, Mobile, None).
- **shared_preferences 2.2.3** - Simple key-value local storage.
- **flutter_local_notifications 17.2.1** - System notifications trigger engine.

## Configuration

**Environment:**
- **Web/Server:** Managed using `.env` files and typesafely exported via `src/env.js` (validated by `@t3-oss/env-nextjs` and `zod`). Includes parameters for `DATABASE_URL`, `AUTH_SECRET`, Web Push VAPID keys, and Cloudflare R2 storage bucket keys.
- **Mobile:** Configured via `lib/core/config.dart` containing base URL properties and secure credential loaders.

**Build Configs:**
- `tsconfig.json` - Custom paths aliases (`@/*` mapping to `src/*`) and compilation setups.
- `drizzle.config.ts` - Schema mapping from `src/server/db/schema/*` pointing to output folder `drizzle/`.
- `postcss.config.js` and `next.config.js` - Transpilation and bundling configurations.

## Platform Requirements

**Development:**
- Operating System: macOS, Linux, or Windows (Windows environment in use).
- Tooling: Node.js 20.x, pnpm, Java Development Kit (JDK) for Android compilation, Android Studio / Gradle, Flutter SDK.

**Production / Deployment:**
- **Serverless/Next.js hosting:** Vercel or Node.js server.
- **Database:** PostgreSQL (Supabase or custom instance).
- **Storage:** Cloudflare R2 or Amazon S3 compatible object storage.
- **Mobile Distribution:** Google Play Store (Android 6.0+), Apple App Store (iOS 12.0+).

---

*Stack analysis: 2026-05-17*
*Update after major dependency changes*
