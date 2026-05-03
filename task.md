# Phase 6: Mobile PWA & UI Polish - Tasks

## Wave 1: PWA Infrastructure (Foundation)
- `[x]` **Task 1.1: Setup Serwist PWA Engine**
  - `[x]` Install `@serwist/next`, `serwist`
  - `[x]` Create `src/app/sw.ts`
  - `[x]` Configure `next.config.js`
- `[x]` **Task 1.2: PWA Manifest & Assets**
  - `[x]` Create `public/manifest.json`
  - `[x]` Add Meta tags to `app/layout.tsx`

## Wave 2: Mobile Navigation (Core UX)
- `[x]` **Task 2.1: Build BottomNav Component**
  - `[x]` Create `src/components/BottomNav.tsx`
- `[x]` **Task 2.2: Layout Integration**
  - `[x]` Inject `BottomNav` into root layout
  - `[x]` Adjust main content padding

## Wave 3: Visual Polish & Motion (Premium Feel)
- `[x]` **Task 3.1: Page Transitions with Framer Motion**
  - `[x]` Install `framer-motion`
  - `[x]` Create `app/template.tsx`
- `[x]` **Task 3.2: Hit-Target & Spacing Audit**
  - `[x]` Update `globals.css` with hit-target baselines
  - `[x]` Audit `sales` page
  - `[x]` Audit `attendance` (replaced by Dashboard/Replacements) page

## Wave 4: Performance & Offline (Native Speed)
- `[x]` **Task 4.1: Performance Optimization**
  - `[x]` Refactor gallery to use `next/dynamic`
- `[x]` **Task 4.2: SWR Caching Strategy**
  - `[x]` Update `sw.ts` with runtime caching for tRPC
