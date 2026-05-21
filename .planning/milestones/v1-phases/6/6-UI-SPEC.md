# Phase 6: Mobile PWA & UI Polish - UI Design Contract

## Spacing & Layout

- **Hit Targets**: Minimum 44x44px for all buttons and links.
- **Gutters**: 16px (mobile default), 24px (tablet+).
- **Navigation**:
  - **Bottom Bar**: 64px height, fixed to viewport bottom.
  - **Safe Area**: `padding-bottom: env(safe-area-inset-bottom)` applied to bottom nav.

## Typography

- **Primary**: Inter (sans-serif)
- **Headings**: Semibold, tight tracking (-0.02em).
- **Body**: Regular, 16px (standard), 14px (secondary/metadata).

## Color Palette (Minimal Light)

- **Background**: `#FFFFFF` (Pure white)
- **Surface**: `#F9FAFB` (Very light gray / Gray-50)
- **Border**: `#E5E7EB` (Gray-200)
- **Accent**: `#2563EB` (Royal Blue - reliable and clear)
- **Text**:
  - Primary: `#111827` (Deep charcoal / Gray-900)
  - Secondary: `#4B5563` (Gray-600)

## Copywriting & Tone

- **Voice**: Professional, efficient, helpful.
- **Empty States**: Encouraging (e.g., "No documents here yet. Tap the button to upload.")
- **Error States**: Explanatory, not alarming.

## Interactions & Animations

- **Library**: `framer-motion`
- **Page Transitions**:
  - Main Tabs: Cross-fade (200ms).
  - Deep Links: Slide-in/out (300ms, ease-out).
- **Haptics**: Subtle scale-down (0.95) on button press.
- **Refresh**: Custom pull-to-refresh spinner at top.

## Non-Negotiables

- **No Hover Reliance**: All actions must be accessible via tap.
- **Dynamic Imports**: Document gallery must use `next/dynamic`.
- **Contrast**: Maintain WCAG AA compliance for all text.
