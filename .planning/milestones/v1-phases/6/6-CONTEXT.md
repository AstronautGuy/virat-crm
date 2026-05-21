# Phase 6: Mobile PWA & UI Polish

## Goal

Transform the CRM into a high-performance Progressive Web App with a premium, native-like mobile interface.

## Objectives

1. **PWA Manifest & Service Workers**: Enable offline caching, "Add to Home Screen" prompts, and splash screens.
2. **Bottom Navigation**: Implement a premium mobile navigation bar with smooth transitions.
3. **UI/UX Polish**:
   - Standardize hit-targets (min 44px).
   - Add micro-animations (Framer Motion or CSS) for transitions.
   - Implement "Pull-to-Refresh" if possible.
4. **Performance**: Use dynamic imports and code splitting to ensure fast initial loads on mobile networks.

## Current Context

The backend and core features (Attendance, Sales, Documents) are fully operational. The UI is functional but lacks the "premium" mobile feel required for field agents.

## Decisions

- **PWA Engine**: Use `serwist` for Service Worker management in Next.js 15.
- **Navigation**: Implement a fixed bottom tab bar for mobile, replacing the top header for core actions.
- **Micro-Animations**: Use `framer-motion` for page transitions and button haptics.
- **Theme**: "Minimal Light" - Pure white backgrounds (#FFFFFF) with subtle gray borders and high-contrast typography. Clean, airy, and focused on functional clarity.
- **Offline Strategy**: Stale-while-revalidate for core data (Attendance/Sales), read-only when offline.

## Specifics

- **Hit Targets**: Force 44px minimum for all interactive elements.
- **Safe Areas**: Use CSS `env(safe-area-inset-bottom)` for fixed navigation.
- **Dynamic Imports**: Lazy load the document gallery and heavy charts to keep initial bundle small.

## Success Criteria

- [ ] Lighthouse PWA score > 90.
- [ ] Bottom navigation replaces top bar on mobile.
- [ ] No layout shift on page transitions.
- [ ] Interactive elements respond instantly to touch.
