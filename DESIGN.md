# Virat CRM Design System

A premium, robust, and slick design system for internal workforce and sales management.

## Philosophy
- **Robustness**: High legibility, stable layouts, and clear hierarchy.
- **Slickness**: Modern typography, subtle transitions, and refined color palettes.
- **Mobile-First**: High touch targets (44px+) and battery-efficient animations.

## Foundation

### Typography
- **Primary Font**: **Inter**
- **Fallback**: System-UI, Sans-Serif
- **Scale**:
  - `text-xs`: 12px (Captions)
  - `text-sm`: 14px (Body/Default)
  - `text-base`: 16px (Primary Buttons/Inputs)
  - `text-lg`: 18px (Subheadings)
  - `text-xl`: 20px (Section Headers)
  - `text-2xl`: 24px (Page Titles)

### Color Palette (Modern Blue)
- **Primary**: `#2563eb` (Blue 600)
- **Secondary**: `#64748b` (Slate 500)
- **Background (Light)**: `#f8fafc` (Slate 50)
- **Background (Dark)**: `#0f172a` (Slate 900)
- **Surface**: `#ffffff` (White) / `#1e293b` (Slate 800)
- **Border**: `#e2e8f0` (Slate 200) / `#334155` (Slate 700)

### Shape & Shadows
- **Rounding**: `rounded-xl` (12px) for cards, modals, and primary inputs.
- **Shadows**:
  - `shadow-sm`: Subtle border depth.
  - `shadow-md`: Floating elements (Modals/Popovers).
  - `shadow-lg`: Heavy focus/drawers.

## Components

### Buttons
- **Default**: Bold primary color, white text, subtle hover scaling.
- **Outline**: Thin slate border, transparent background, refined hover state.
- **Ghost**: No background, primary/slate text, background appears on hover.

### Inputs
- **Style**: High-contrast borders, clear focus rings (Blue 500), and large hit-areas.
- **Validation**: Animated shake on error, clear red borders.

### Cards
- **Style**: White/Deep Slate background, 1px border, subtle `shadow-sm`.
- **Spacing**: Generous internal padding (`p-6`) for readability.

## Interactions
- **Page Transitions**: Smooth fade-in and slide-up (200ms).
- **Loading**: Minimal, elegant spinner or skeletal screens.
- **Haptics (Mobile)**: Tactile scale-down effect on press.
