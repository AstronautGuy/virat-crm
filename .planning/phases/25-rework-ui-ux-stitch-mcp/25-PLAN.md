# Phase 25 Plan: UI/UX Rework & Stitch MCP (Light Mode Focus)

Rework the Virat CRM UI/UX to be "slick and robust" with a premium, fixed light mode aesthetic.

## Wave 1: Foundation (Visual Tokens)
- [ ] **Task 25.1**: Integrate **Inter** font in `src/app/layout.tsx`.
- [ ] **Task 25.2**: Refactor `src/styles/globals.css` for **Fixed Light Mode**:
    - Remove dark mode variable blocks.
    - Set background to `slate-50`.
    - Define crisp border and shadow tokens for white surfaces.
- [ ] **Task 25.3**: Remove any theme-switching logic or providers if present.

## Wave 2: Core Component Overhaul
- [ ] **Task 25.4**: Refactor `src/components/ui/button.tsx` for premium Light Mode appearance.
- [ ] **Task 25.5**: Refactor `src/components/ui/card.tsx` (White background, Slate-200 border, soft shadow).
- [ ] **Task 25.6**: Refactor `src/components/ui/input.tsx` and `textarea.tsx` (Slate-50 backgrounds on focus, clean borders).

## Wave 3: Layout & Interaction Refinement
- [ ] **Task 25.7**: Refine the **Sidebar** for a clean, light enterprise look.
- [ ] **Task 25.8**: Add subtle **Framer Motion** transitions to main content containers.
- [ ] **Task 25.9**: Clean up dashboard widgets for a "Modern SaaS" look (high contrast, clear labels).

## Wave 4: Page-Specific Polish & Audit
- [ ] **Task 25.10**: Audit **CRM Directory** and **Reports** pages for alignment and readability.
- [ ] **Task 25.11**: Remove legacy "Dark Mode" classes across the codebase.
- [ ] **Task 25.12**: Performance check for animations.

## Verification
- [ ] `npm run build` check.
- [ ] Visual walkthrough (Ensuring no dark mode "leaks").
- [ ] Mobile readability audit (High contrast check).
