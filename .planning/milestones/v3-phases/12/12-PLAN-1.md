# Phase 12 Plan: Visual Team Hierarchy

## Wave 1: Backend Hierarchy Engine

- [ ] **Task 1.1: Recursive User Procedure**
  - `<action>`: Create `users.getOrgTree` in `src/server/api/routers/users.ts`.
  - `<action>`: Implement recursive logic to fetch users and their subordinates based on `managerId`.
  - `<acceptance_criteria>`: tRPC returns a nested JSON structure (e.g., `{ name: "Admin", children: [...] }`).

## Wave 2: Interactive Org Tree UI

- [ ] **Task 2.1: Org Tree Component**
  - `<action>`: Create `src/app/_components/workforce/OrgTree.tsx` using `reactflow` or a lightweight SVG tree.
  - `<action>`: Add support for expanding/collapsing nodes.
  - `<acceptance_criteria>`: Admin can see the full tree; Managers can see their own team's subtree.
- [ ] **Task 2.2: Node Integration**
  - `<action>`: Each node should display user role, status (Active/Away), and a "View Live" shortcut.
  - `<acceptance_criteria>`: Clicking "View Live" navigates to the map centered on that user.

## Wave 3: Integration & UX

- [ ] **Task 3.1: Workforce Page Update**
  - `<action>`: Add a "Hierarchy View" toggle to `src/app/attendance/page.tsx` or create `src/app/workforce/hierarchy/page.tsx`.
  - `<acceptance_criteria>`: Easy navigation between the list view and the visual tree.

## Verification Criteria

- [ ] Verify `getOrgTree` returns correct nesting for 3-level deep hierarchy.
- [ ] Verify node interaction: clicking a subordinate opens their profile or map location.
- [ ] Verify responsive behavior on tablet/mobile (panning/zooming the tree).
