# Phase 25: UI/UX Rework & Stitch MCP - Context

**Gathered:** 2026-05-14
**Status:** Ready for planning
**Source:** User Directive: "Fixed Light Mode Only"

<domain>
## Phase Boundary

This phase delivers a premium, robust UI/UX overhaul for the Virat CRM, locked to a **Fixed Light Mode**. It focuses on visual consistency, modern typography, and refined interaction patterns.

</domain>

<decisions>
## Implementation Decisions

### Typography & Branding

- **Font Family**: Standardize on **Inter**.
- **Rationale**: High legibility for data-dense ERP interfaces.

### Theme Strategy: FIXED LIGHT MODE

- **Primary Background**: `#f8fafc` (Slate 50) for the app container.
- **Surface**: `#ffffff` (White) for cards and modals.
- **Border Strategy**: Crisp 1px borders (`#e2e8f0`) to maintain structure without heavy shadows.
- **Rationale**: Maximum visibility for field operations and reduced visual complexity.

### Design System (Stitch MCP)

- **Primary Color**: Modern Blue (#2563eb).
- **Rounding**: Consistent `rounded-xl` (12px).

### Interaction & UX

- **Transitions**: Subtle Framer Motion "fade-in".
- **Micro-feedback**: Smooth hover states and scale-down effects.

</decisions>

<canonical_refs>

## Canonical References

- `src/styles/globals.css`
- `src/app/layout.tsx`

</canonical_refs>

<specifics>
## Specific Ideas
- Clean, "Apple-esque" enterprise look: white surfaces, thin borders, and plenty of whitespace.

</specifics>

<deferred>
## Deferred Ideas
- Dark mode support (removed per user request).

</deferred>

---

_Phase: 25-rework-ui-ux-stitch-mcp_
_Context gathered: 2026-05-14_
