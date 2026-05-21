# Phase 6 Plan: Mobile PWA & UI Polish

## Overview

Transform the CRM into a premium PWA with native-like navigation and visual excellence.

## Wave 1: PWA Infrastructure (Foundation)

- `[ ]` **Task 1.1: Setup Serwist PWA Engine**
  - `<read_first>`: `package.json`, `next.config.js`
  - `<action>`: Install `@serwist/next`, `serwist`. Create `worker/index.ts` for basic caching. Update `next.config.js` with `withSerwist`.
  - `<acceptance_criteria>`: `package.json` contains serwist, `next.config.js` uses withSerwist, `sw.js` generated during build.
- `[ ]` **Task 1.2: PWA Manifest & Assets**
  - `<read_first>`: `app/layout.tsx`
  - `<action>`: Create `public/manifest.json` with theme colors and icons. Update `app/layout.tsx` with `<link rel="manifest" ...>` and viewport meta tags.
  - `<acceptance_criteria>`: `public/manifest.json` exists, `/manifest.json` accessible in browser, "Add to Home Screen" prompt active.

## Wave 2: Mobile Navigation (Core UX)

- `[ ]` **Task 2.1: Build BottomNav Component**
  - `<read_first>`: `src/components/` directory
  - `<action>`: Create `src/components/BottomNav.tsx`. Use glassmorphism styling (`backdrop-blur`). Include Home, Sales, Workforce, Docs, Profile. Support `env(safe-area-inset-bottom)`.
  - `<acceptance_criteria>`: Component exists, uses backdrop-blur, fixed to bottom.
- `[ ]` **Task 2.2: Layout Integration**
  - `<read_first>`: `src/app/layout.tsx`, `src/components/Header.tsx` (if exists)
  - `<action>`: Inject `BottomNav` into root layout. Use media queries to show on mobile (< 768px) and hide/adjust top header. Add `pb-20` to main content on mobile.
  - `<acceptance_criteria>`: BottomNav visible on mobile, content not obscured by nav bar.

## Wave 3: Visual Polish & Motion (Premium Feel)

- `[ ]` **Task 3.1: Page Transitions with Framer Motion**
  - `<read_first>`: `app/layout.tsx`, `src/app/template.tsx` (for per-page transitions)
  - `<action>`: Install `framer-motion`. Implement `template.tsx` with `motion.div` for slide/fade transitions. Ensure zero layout shift.
  - `<acceptance_criteria>`: Page transitions are smooth (200-300ms), no flickering.
- `[ ]` **Task 3.2: Hit-Target & Spacing Audit**
  - `<read_first>`: `src/app/sales/page.tsx`, `src/app/attendance/page.tsx`
  - `<action>`: Audit all interactive elements. Ensure min 44px hit targets. Update Tailwind classes for consistent 16px/24px padding.
  - `<acceptance_criteria>`: All buttons are easily tappable, UI feels airy and premium.

## Wave 4: Performance & Offline (Native Speed)

- `[ ]` **Task 4.1: Performance Optimization**
  - `<read_first>`: `src/app/sales/[id]/page.tsx`
  - `<action>`: Use `next/dynamic` for heavy components (FileGallery, Charts). Optimize image loading.
  - `<acceptance_criteria>`: Lighthouse performance score improves, initial bundle size reduced.
- `[ ]` **Task 4.2: SWR Caching Strategy**
  - `<read_first>`: `worker/index.ts`
  - `<action>`: Update Serwist config to cache tRPC responses with Stale-While-Revalidate. Ensure offline access to recently viewed sales/attendance logs.
  - `<acceptance_criteria>`: Application works offline for cached routes, "Offline" indicator shown when network lost.

## Verification Criteria (must_haves)

- `[ ]` **Lighthouse PWA Score > 90**
- `[ ]` **Bottom Nav operational on mobile**
- `[ ]` **Smooth page transitions without layout shifts**
- `[ ]` **App installable on iOS/Android home screen**
